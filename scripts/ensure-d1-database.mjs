#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

const repoRoot = resolve(import.meta.dirname, '..')
const wranglerBin = resolve(repoRoot, `node_modules/.bin/wrangler${process.platform === 'win32' ? '.cmd' : ''}`)

export function databaseNeedsCreating(databases, name) {
  return !databases.some(database => database.name === name)
}

function runWrangler(args, { inherit = false } = {}) {
  if (!existsSync(wranglerBin))
    throw new Error('Local Wrangler binary is missing; run pnpm install --frozen-lockfile first')
  const result = spawnSync(wranglerBin, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
    stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
  })
  if (result.error)
    throw result.error
  if (result.status !== 0)
    throw new Error(result.stderr?.trim() || `Wrangler exited ${result.status}`)
  return result.stdout ?? ''
}

export async function main(argv = process.argv.slice(2)) {
  try {
    const nameIndex = argv.indexOf('--name')
    const name = nameIndex > -1 ? argv[nameIndex + 1] : null
    if (!name || name.startsWith('--'))
      throw new Error('--name requires a value')

    const databases = JSON.parse(runWrangler(['d1', 'list', '--json']))
    if (!Array.isArray(databases))
      throw new Error('Unexpected `wrangler d1 list` output; expected a JSON array')

    if (!databaseNeedsCreating(databases, name)) {
      console.log(`[ensure-d1] ${name} exists`)
      return 0
    }

    runWrangler(['d1', 'create', name], { inherit: true })
    console.log(`[ensure-d1] created ${name}`)
    return 0
  }
  catch (error) {
    console.error(`[ensure-d1] ${error instanceof Error ? error.message : String(error)}`)
    return 1
  }
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename)
  process.exitCode = await main()
