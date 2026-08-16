#!/usr/bin/env node
// Assert that the production hostname serves the build this job just uploaded.
//
// `wrangler pages deploy` infers the Pages branch from git. A CI checkout by SHA
// leaves a detached HEAD, so it inferred `head` and every upload landed on a
// preview alias. Production kept serving the 2026-08-11 build for five days of
// green deploys, and four merged fixes never reached a user. Nothing in the
// pipeline looked at the live site, so nothing failed.
//
// The check compares the build id in the served manifest to the build id this
// job produced. Timestamp freshness alone would let a previous deploy inside
// the freshness window mask a preview upload of this build.

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const DEFAULT_MAX_AGE_MS = 30 * 60 * 1000
const POLL_ATTEMPTS = 10
const POLL_DELAY_MS = 15_000
const DEFAULT_DIST_DIR = 'dist'

export function parseVerifyArgs(argv) {
  let url = ''
  let maxAgeMs = DEFAULT_MAX_AGE_MS
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--url')
      url = argv[index + 1] ?? ''
    if (argv[index] === '--max-age-minutes')
      maxAgeMs = Number(argv[index + 1]) * 60 * 1000
  }
  if (!url)
    throw new Error('Pass the production site with --url.')
  if (!Number.isFinite(maxAgeMs) || maxAgeMs <= 0)
    throw new Error('Pass a positive number of minutes with --max-age-minutes.')
  return { url, maxAgeMs }
}

export function parseBuildManifest(manifest) {
  return {
    id: typeof manifest?.id === 'string' ? manifest.id : undefined,
    timestamp: typeof manifest?.timestamp === 'number' ? manifest.timestamp : Number.NaN,
  }
}

export async function readLocalBuildManifest(distDir = DEFAULT_DIST_DIR) {
  try {
    const raw = await readFile(resolve(distDir, '_nuxt/builds/latest.json'), 'utf-8')
    return parseBuildManifest(JSON.parse(raw))
  }
  catch {
    return null
  }
}

export function evaluateProductionBuild({ served, expected = null, now, maxAgeMs }) {
  if (!Number.isFinite(served?.timestamp))
    return { _tag: 'unreadable' }

  // The build id is what proves THIS upload is live. Freshness alone cannot:
  // a previous deploy inside the freshness window would mask a preview upload
  // of this build, which is the exact failure this check exists to catch.
  if (expected?.id && served?.id !== expected.id)
    return { _tag: 'mismatch', expectedId: expected.id, servedId: served.id }

  const ageMs = now - served.timestamp
  if (ageMs > maxAgeMs)
    return { _tag: 'stale', ageMs }

  return { _tag: 'fresh', ageMs }
}

function minutes(ms) {
  return Math.round(ms / 60_000)
}

async function fetchBuildManifest(url) {
  const response = await fetch(new URL('/_nuxt/builds/latest.json', url), {
    headers: { 'cache-control': 'no-cache' },
  })
  if (!response.ok)
    throw new Error(`${url} returned ${response.status} for the build manifest.`)
  return parseBuildManifest(await response.json())
}

// Poll until the production hostname serves this build. A transient fetch
// failure is retryable too: an edge 5xx during propagation should not fail a
// deploy that is on its way up. Only running out of attempts is a failure.
export async function pollProductionBuild(fetcher, {
  maxAgeMs,
  expectedId,
  attempts = POLL_ATTEMPTS,
  delayMs = POLL_DELAY_MS,
  now = Date.now,
}) {
  let result = { _tag: 'unreadable' }

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let served
    try {
      served = await fetcher()
    }
    catch (error) {
      console.warn(`[verify-deploy] attempt ${attempt}: ${error instanceof Error ? error.message : String(error)}`)
    }

    if (served !== undefined) {
      result = evaluateProductionBuild({ served, expected: expectedId ? { id: expectedId } : null, now: now(), maxAgeMs })
      if (result._tag === 'fresh')
        return result
    }

    if (attempt < attempts)
      await new Promise(resolve => setTimeout(resolve, delayMs))
  }

  return result
}

async function verify() {
  const { url, maxAgeMs } = parseVerifyArgs(process.argv.slice(2))
  const localManifest = await readLocalBuildManifest()
  const result = await pollProductionBuild(() => fetchBuildManifest(url), {
    maxAgeMs,
    expectedId: localManifest?.id,
  })

  if (result._tag === 'fresh') {
    console.log(`[verify-deploy] ${url} serves a build from ${minutes(result.ageMs)} minute(s) ago.`)
    return
  }
  if (result._tag === 'mismatch') {
    throw new Error(
      `${url} serves build ${result.servedId ?? 'without a build id'}, not ${result.expectedId}. `
      + 'The upload went somewhere other than the production branch.',
    )
  }
  if (result._tag === 'unreadable')
    throw new Error(`${url} did not return a readable build manifest.`)

  throw new Error(
    `${url} still serves a build from ${minutes(result.ageMs)} minute(s) ago. `
    + 'The upload went somewhere other than the production branch.',
  )
}

async function main() {
  try {
    await verify()
    return 0
  }
  catch (error) {
    console.error(`[verify-deploy] ${error instanceof Error ? error.message : String(error)}`)
    return 1
  }
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename)
  process.exitCode = await main()
