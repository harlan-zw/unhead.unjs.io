import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  evaluateProductionBuild,
  parseBuildManifest,
  parseVerifyArgs,
  pollProductionBuild,
  readLocalBuildManifest,
  verifyProductionBuild,
} from '../scripts/verify-production-deploy.mjs'

const now = Date.parse('2026-08-16T02:00:00Z')
const maxAgeMs = 30 * 60 * 1000

describe('evaluateProductionBuild', () => {
  it('accepts the build this job uploaded, served moments ago', () => {
    const result = evaluateProductionBuild({
      served: { id: 'this-deploy', timestamp: now - 60_000 },
      expected: { id: 'this-deploy' },
      now,
      maxAgeMs,
    })
    expect(result).toEqual({ _tag: 'fresh', ageMs: 60_000 })
  })

  it('accepts an id match even when the build took longer than the freshness window', () => {
    // The manifest timestamp is the build start time, and the deploy job allows
    // a thirty-minute build. A matching id already proves THIS upload is live;
    // gating it on the freshness window fails a healthy deploy on a slow build.
    const result = evaluateProductionBuild({
      served: { id: 'this-deploy', timestamp: now - 31 * 60 * 1000 },
      expected: { id: 'this-deploy' },
      now,
      maxAgeMs,
    })
    expect(result).toEqual({ _tag: 'fresh', ageMs: 31 * 60 * 1000 })
  })

  it('rejects the build production kept while the deploy went to a preview branch', () => {
    // unhead.unjs.io served the 2026-08-11 build for five days of green deploys.
    const result = evaluateProductionBuild({
      served: { id: '2026-08-11-build', timestamp: Date.parse('2026-08-11T05:28:25Z') },
      expected: { id: 'this-deploy' },
      now,
      maxAgeMs,
    })
    expect(result).toEqual({ _tag: 'mismatch', expectedId: 'this-deploy', servedId: '2026-08-11-build' })
  })

  it('rejects another fresh build when this build is not the one being served', () => {
    // A previous deploy landing within the freshness window must not make a
    // preview upload of THIS build pass. Freshness alone cannot prove this
    // deploy reached production; only the build id can.
    const result = evaluateProductionBuild({
      served: { id: 'older-fresh-deploy', timestamp: now - 60_000 },
      expected: { id: 'this-deploy' },
      now,
      maxAgeMs,
    })
    expect(result).toEqual({ _tag: 'mismatch', expectedId: 'this-deploy', servedId: 'older-fresh-deploy' })
  })

  it('falls back to the freshness window when no build identity is available', () => {
    expect(evaluateProductionBuild({
      served: { timestamp: now - 60_000 },
      expected: null,
      now,
      maxAgeMs,
    })).toEqual({ _tag: 'fresh', ageMs: 60_000 })
  })

  it('still applies the freshness window when there is no expected id', () => {
    expect(evaluateProductionBuild({
      served: { timestamp: now - 31 * 60 * 1000 },
      expected: null,
      now,
      maxAgeMs,
    })).toEqual({ _tag: 'stale', ageMs: 31 * 60 * 1000 })
  })

  it('rejects a build manifest with no usable timestamp', () => {
    expect(evaluateProductionBuild({
      served: { id: 'this-deploy', timestamp: Number.NaN },
      expected: { id: 'this-deploy' },
      now,
      maxAgeMs,
    })).toEqual({ _tag: 'unreadable' })
  })
})

describe('parseBuildManifest', () => {
  it('reads the id and timestamp Nuxt writes into the build manifest', () => {
    expect(parseBuildManifest({ id: 'b5b5b643', timestamp: 1786426105375 })).toEqual({
      id: 'b5b5b643',
      timestamp: 1786426105375,
    })
  })

  it.each([null, undefined, {}, { timestamp: 'yesterday' }])('returns an unreadable timestamp for %s', (manifest) => {
    const parsed = parseBuildManifest(manifest)
    expect(parsed.id).toBeUndefined()
    expect(parsed.timestamp).toBeNaN()
  })
})

describe('readLocalBuildManifest', () => {
  it('reads the manifest produced by this build', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'verify-deploy-'))
    await mkdir(join(dir, '_nuxt', 'builds'), { recursive: true })
    await writeFile(join(dir, '_nuxt', 'builds', 'latest.json'), JSON.stringify({ id: 'this-deploy', timestamp: now - 60_000 }))
    expect(await readLocalBuildManifest(dir)).toEqual({ id: 'this-deploy', timestamp: now - 60_000 })
    await rm(dir, { recursive: true, force: true })
  })

  it('returns null when the local manifest is missing', async () => {
    expect(await readLocalBuildManifest(join(tmpdir(), 'does-not-exist'))).toBeNull()
  })

  it('returns null for a corrupt local manifest', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'verify-deploy-'))
    await writeFile(join(dir, 'latest.json'), 'not json')
    expect(await readLocalBuildManifest(dir)).toBeNull()
    await rm(dir, { recursive: true, force: true })
  })
})

describe('pollProductionBuild', () => {
  it('retries a transient fetch failure and accepts the build once reachable', async () => {
    const responses = [new Error('502 from the edge'), { id: 'this-deploy', timestamp: now - 60_000 }]
    const fetcher = async () => {
      const next = responses.shift()
      if (next instanceof Error)
        throw next
      return next
    }
    const result = await pollProductionBuild(fetcher, {
      maxAgeMs,
      expectedId: 'this-deploy',
      attempts: 3,
      delayMs: 0,
      now: () => now,
    })
    expect(result).toEqual({ _tag: 'fresh', ageMs: 60_000 })
  })

  it('reports unreadable when every attempt fails', async () => {
    const fetcher = async () => {
      throw new Error('the site is unreachable')
    }
    const result = await pollProductionBuild(fetcher, { maxAgeMs, attempts: 2, delayMs: 0, now: () => now })
    expect(result).toEqual({ _tag: 'unreadable' })
  })

  it('keeps polling while the served build stays stale in the no-id fallback', async () => {
    const timestamps = [Date.parse('2026-08-11T05:28:25Z'), now - 60_000]
    const fetcher = async () => {
      const next = timestamps.shift() ?? now
      return { timestamp: next }
    }
    const result = await pollProductionBuild(fetcher, {
      maxAgeMs,
      attempts: 3,
      delayMs: 0,
      now: () => now,
    })
    expect(result).toEqual({ _tag: 'fresh', ageMs: 60_000 })
  })

  it('accepts the build once propagation switches the manifest to it', async () => {
    const servedBuilds = [
      { id: 'previous-deploy', timestamp: now - 60_000 },
      { id: 'this-deploy', timestamp: now - 60_000 },
    ]
    const fetcher = async () => servedBuilds.shift() ?? { id: 'this-deploy', timestamp: now - 60_000 }
    const result = await pollProductionBuild(fetcher, {
      maxAgeMs,
      expectedId: 'this-deploy',
      attempts: 3,
      delayMs: 0,
      now: () => now,
    })
    expect(result).toEqual({ _tag: 'fresh', ageMs: 60_000 })
  })

  it('fails the deploy when production keeps serving a different build', async () => {
    const fetcher = async () => ({ id: 'older-fresh-deploy', timestamp: now - 60_000 })
    const result = await pollProductionBuild(fetcher, {
      maxAgeMs,
      expectedId: 'this-deploy',
      attempts: 3,
      delayMs: 0,
      now: () => now,
    })
    expect(result).toEqual({ _tag: 'mismatch', expectedId: 'this-deploy', servedId: 'older-fresh-deploy' })
  })
})

describe('verifyProductionBuild', () => {
  it('refuses to run the deploy check when the local build id is unavailable', async () => {
    // A missing local manifest must fail the job, not fall back to a
    // freshness-only check that cannot tell a preview upload from a deploy.
    await expect(verifyProductionBuild({
      argv: ['--url', 'https://unhead.unjs.io'],
      readLocal: async () => null,
      poll: async () => {
        throw new Error('must not poll without a build id')
      },
    })).rejects.toThrow('no build id')
  })

  it('passes a deploy that production is serving', async () => {
    await expect(verifyProductionBuild({
      argv: ['--url', 'https://unhead.unjs.io'],
      readLocal: async () => ({ id: 'this-deploy', timestamp: now - 60_000 }),
      poll: async () => ({ _tag: 'fresh', ageMs: 60_000 }),
    })).resolves.toBeUndefined()
  })

  it('fails when production keeps serving a different build', async () => {
    await expect(verifyProductionBuild({
      argv: ['--url', 'https://unhead.unjs.io'],
      readLocal: async () => ({ id: 'this-deploy', timestamp: now - 60_000 }),
      poll: async () => ({ _tag: 'mismatch', expectedId: 'this-deploy', servedId: 'older-deploy' }),
    })).rejects.toThrow('somewhere other than the production branch')
  })
})

describe('parseVerifyArgs', () => {
  it('reads the site and the freshness window', () => {
    expect(parseVerifyArgs(['--url', 'https://unhead.unjs.io', '--max-age-minutes', '45'])).toEqual({
      url: 'https://unhead.unjs.io',
      maxAgeMs: 45 * 60 * 1000,
    })
  })

  it('defaults the freshness window to thirty minutes', () => {
    expect(parseVerifyArgs(['--url', 'https://unhead.unjs.io'])).toEqual({
      url: 'https://unhead.unjs.io',
      maxAgeMs: 30 * 60 * 1000,
    })
  })

  it('throws when the site is missing', () => {
    expect(() => parseVerifyArgs([])).toThrow('--url')
  })
})
