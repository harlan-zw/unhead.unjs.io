import { describe, expect, it } from 'vitest'
import { evaluateProductionBuild, parseBuildTimestamp, parseVerifyArgs } from '../scripts/verify-production-deploy.mjs'

const now = Date.parse('2026-08-16T02:00:00Z')
const maxAgeMs = 30 * 60 * 1000

describe('evaluateProductionBuild', () => {
  it('accepts a build published moments ago', () => {
    const result = evaluateProductionBuild({
      buildTimestamp: now - 60_000,
      now,
      maxAgeMs,
    })
    expect(result).toEqual({ _tag: 'fresh', ageMs: 60_000 })
  })

  it('rejects the build production kept while the deploy went to a preview branch', () => {
    // unhead.unjs.io served the 2026-08-11 build for five days of green deploys.
    const result = evaluateProductionBuild({
      buildTimestamp: Date.parse('2026-08-11T05:28:25Z'),
      now,
      maxAgeMs,
    })
    expect(result).toEqual({ _tag: 'stale', ageMs: now - Date.parse('2026-08-11T05:28:25Z') })
  })

  it('rejects a build manifest with no usable timestamp', () => {
    expect(evaluateProductionBuild({ buildTimestamp: Number.NaN, now, maxAgeMs })).toEqual({
      _tag: 'unreadable',
    })
  })
})

describe('parseBuildTimestamp', () => {
  it('reads the timestamp Nuxt writes into the build manifest', () => {
    expect(parseBuildTimestamp({ id: 'b5b5b643', timestamp: 1786426105375 })).toBe(1786426105375)
  })

  it.each([null, undefined, {}, { timestamp: 'yesterday' }])('returns NaN for %s', (manifest) => {
    expect(parseBuildTimestamp(manifest)).toBeNaN()
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
