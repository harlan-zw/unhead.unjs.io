#!/usr/bin/env node
// Assert that the production hostname serves the build this job just uploaded.
//
// `wrangler pages deploy` infers the Pages branch from git. A CI checkout by SHA
// leaves a detached HEAD, so it inferred `head` and every upload landed on a
// preview alias. Production kept serving the 2026-08-11 build for five days of
// green deploys, and four merged fixes never reached a user. Nothing in the
// pipeline looked at the live site, so nothing failed.

import { resolve } from 'node:path'

const DEFAULT_MAX_AGE_MS = 30 * 60 * 1000
const POLL_ATTEMPTS = 10
const POLL_DELAY_MS = 15_000

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

export function parseBuildTimestamp(manifest) {
  const timestamp = manifest?.timestamp
  return typeof timestamp === 'number' ? timestamp : Number.NaN
}

export function evaluateProductionBuild({ buildTimestamp, now, maxAgeMs }) {
  if (!Number.isFinite(buildTimestamp))
    return { _tag: 'unreadable' }

  const ageMs = now - buildTimestamp
  if (ageMs > maxAgeMs)
    return { _tag: 'stale', ageMs }

  return { _tag: 'fresh', ageMs }
}

function minutes(ms) {
  return Math.round(ms / 60_000)
}

async function fetchBuildTimestamp(url) {
  const response = await fetch(new URL('/_nuxt/builds/latest.json', url), {
    headers: { 'cache-control': 'no-cache' },
  })
  if (!response.ok)
    throw new Error(`${url} returned ${response.status} for the build manifest.`)
  return parseBuildTimestamp(await response.json())
}

async function verify() {
  const { url, maxAgeMs } = parseVerifyArgs(process.argv.slice(2))
  let result = { _tag: 'unreadable' }

  for (let attempt = 1; attempt <= POLL_ATTEMPTS; attempt += 1) {
    const buildTimestamp = await fetchBuildTimestamp(url)
    result = evaluateProductionBuild({ buildTimestamp, now: Date.now(), maxAgeMs })
    if (result._tag === 'fresh') {
      console.log(`[verify-deploy] ${url} serves a build from ${minutes(result.ageMs)} minute(s) ago.`)
      return
    }
    if (attempt < POLL_ATTEMPTS)
      await new Promise(resolve => setTimeout(resolve, POLL_DELAY_MS))
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
