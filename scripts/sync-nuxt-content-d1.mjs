#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import process from 'node:process'
import { gunzipSync } from 'node:zlib'

const repoRoot = resolve(import.meta.dirname, '..')
const wranglerBin = resolve(repoRoot, `node_modules/.bin/wrangler${process.platform === 'win32' ? '.cmd' : ''}`)
const D1_MAX_STATEMENT_BYTES = 100_000
const D1_TARGET_STATEMENT_BYTES = 95_000

const HELP = `Synchronize generated Nuxt Content SQL dumps into a remote D1 database.

Usage:
  node scripts/sync-nuxt-content-d1.mjs --database unhead-unjs-io
  node scripts/sync-nuxt-content-d1.mjs --database unhead-unjs-io --source-url https://unhead.unjs.io --collection docsUnhead
  node scripts/sync-nuxt-content-d1.mjs --database unhead-unjs-io --dry-run

Options:
  --database <name>     Remote D1 database name or ID (required)
  --source-url <origin> Read dumps from a deployed origin instead of dist
  --collection <name>  Limit sync to one collection (repeatable)
  --dry-run             Print the plan without changing D1
  -h, --help            Show this help
`

function sqlString(value) {
  return `'${String(value).replaceAll('\'', '\'\'')}'`
}

function statementHash(statement) {
  return statement.match(/ -- ([\w-]+)$/)?.[1] ?? null
}

function splitSqlList(input) {
  const values = []
  let depth = 0
  let quoted = false
  let start = 0
  for (let index = 0; index < input.length; index++) {
    const character = input[index]
    if (quoted && character === '\'' && input[index + 1] === '\'') {
      index++
      continue
    }
    if (character === '\'') {
      quoted = !quoted
      continue
    }
    if (quoted)
      continue
    if (character === '(') {
      depth++
    }
    else if (character === ')') {
      depth--
    }
    else if (character === ',' && depth === 0) {
      values.push(input.slice(start, index).trim())
      start = index + 1
    }
  }
  values.push(input.slice(start).trim())
  return values
}

function parseSqlString(value) {
  if (!value.startsWith('\'') || !value.endsWith('\''))
    return null
  return value.slice(1, -1).replaceAll('\'\'', '\'')
}

function parseTableColumns(statement, table) {
  const match = statement?.match(new RegExp(`^CREATE TABLE IF NOT EXISTS ${table} \\((.*)\\); -- structure$`))
  if (!match)
    throw new Error(`Could not read columns for ${table}`)
  return splitSqlList(match[1]).map((definition) => {
    const column = definition.match(/^(?:"([^"]+)"|([a-z_]\w*))/i)
    if (!column)
      throw new Error(`Could not read column from ${definition}`)
    return column[1] ?? column[2]
  })
}

function quotedIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`
}

function takeStatementChunk(characters, buildStatement) {
  let low = 1
  let high = characters.length
  let accepted = 0
  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    if (Buffer.byteLength(buildStatement(characters.slice(0, middle).join(''))) <= D1_TARGET_STATEMENT_BYTES) {
      accepted = middle
      low = middle + 1
    }
    else {
      high = middle - 1
    }
  }
  if (!accepted)
    throw new Error('D1 statement overhead exceeds the safe byte limit')
  return characters.splice(0, accepted).join('')
}

function rechunkInsert(statement, table, columns) {
  if (Buffer.byteLength(statement) <= D1_MAX_STATEMENT_BYTES)
    return [statement]

  const match = statement.match(new RegExp(`^INSERT INTO ${table} VALUES \\((.*)\\); -- ([\\w-]+)$`, 's'))
  if (!match)
    throw new Error(`D1 statement exceeds ${D1_MAX_STATEMENT_BYTES} bytes and cannot be rechunked`)

  const values = splitSqlList(match[1])
  const hash = match[2]
  const idIndex = columns.indexOf('id')
  const hashIndex = columns.indexOf('__hash__')
  if (values.length !== columns.length || idIndex < 0 || hashIndex < 0)
    throw new Error(`Could not map oversized row for ${table}`)

  const candidates = values
    .map((value, index) => ({ index, value: parseSqlString(value) }))
    .filter(candidate => candidate.value !== null && candidate.index !== idIndex && candidate.index !== hashIndex)
    .sort((left, right) => Buffer.byteLength(right.value) - Buffer.byteLength(left.value))
  const selected = candidates[0]
  if (!selected)
    throw new Error(`Oversized row in ${table} has no splittable text column`)

  const column = quotedIdentifier(columns[selected.index])
  const id = values[idIndex]
  const provisionalHash = `${hash}-d1-sync`
  const insertValues = [...values]
  insertValues[hashIndex] = sqlString(provisionalHash)
  const buildInsert = chunk => `INSERT INTO ${table} VALUES (${insertValues.map((value, index) => index === selected.index ? sqlString(chunk) : value).join(', ')}); -- ${hash}`
  const buildUpdate = (chunk, final) => `UPDATE ${table} SET ${column} = CONCAT(${column}, ${sqlString(chunk)})${final ? `, "__hash__" = ${sqlString(hash)}` : ''} WHERE "id" = ${id} AND "__hash__" = ${sqlString(provisionalHash)}; -- ${hash}`

  if (Buffer.byteLength(buildInsert('')) > D1_TARGET_STATEMENT_BYTES)
    throw new Error(`Oversized row in ${table} has more than ${D1_TARGET_STATEMENT_BYTES} bytes outside its largest text column`)

  const characters = Array.from(selected.value)
  const chunks = [takeStatementChunk(characters, buildInsert)]
  while (characters.length)
    chunks.push(takeStatementChunk(characters, chunk => buildUpdate(chunk, true)))

  return [
    buildInsert(chunks[0]),
    ...chunks.slice(1).map((chunk, index, continuations) => buildUpdate(chunk, index === continuations.length - 1)),
  ]
}

export function parseContentDump(encoded, collectionHint) {
  const statements = JSON.parse(gunzipSync(Buffer.from(encoded.trim(), 'base64')).toString('utf8'))
  if (!Array.isArray(statements) || statements.some(statement => typeof statement !== 'string'))
    throw new TypeError(`Invalid Nuxt Content dump for ${collectionHint}`)

  const metaIndex = statements.findIndex(statement => statement.includes(`'checksum_${collectionHint}'`))
  const metaStatement = statements[metaIndex]
  const meta = metaStatement?.match(/^INSERT INTO _content_info VALUES \('checksum_([^']+)', false, '([^']+)', '([^']+)', '[^']+'\); -- meta$/)
  if (!meta || meta[1] !== collectionHint)
    throw new Error(`Could not read checksum metadata for ${collectionHint}`)

  const table = `_content_${collectionHint}`
  if (!/^_content_\w+$/.test(table))
    throw new Error(`Unsafe collection name ${JSON.stringify(collectionHint)}`)
  const tableCreateStatement = statements.find(statement => statement.startsWith(`CREATE TABLE IF NOT EXISTS ${table} `))
  const columns = parseTableColumns(tableCreateStatement, table)

  // Large serialized rows are split into one INSERT plus continuation UPDATEs.
  // Every statement in that row shares its final hash, so replay the whole group.
  const contentStatements = statements
    .filter(statement => statement.startsWith(`INSERT INTO ${table} `) || statement.startsWith(`UPDATE ${table} `))
    .flatMap(statement => statement.startsWith(`INSERT INTO ${table} `) ? rechunkInsert(statement, table, columns) : statement)
  const oversizedStatement = contentStatements.find(statement => Buffer.byteLength(statement) > D1_MAX_STATEMENT_BYTES)
  if (oversizedStatement)
    throw new Error(`D1 statement in ${collectionHint} still exceeds ${D1_MAX_STATEMENT_BYTES} bytes`)
  const contentByHash = new Map()
  for (const statement of contentStatements) {
    const hash = statementHash(statement)
    if (!hash)
      throw new Error(`Content row in ${collectionHint} has no hash`)
    contentByHash.set(hash, [...contentByHash.get(hash) ?? [], statement])
  }

  const finalStatement = statements.find(statement => statement === `UPDATE _content_info SET ready = true WHERE id = 'checksum_${collectionHint}'; -- meta`)
  if (!finalStatement)
    throw new Error(`Could not read readiness statement for ${collectionHint}`)

  return {
    collection: collectionHint,
    table,
    statements,
    infoCreateStatement: statements.find(statement => statement.startsWith('CREATE TABLE IF NOT EXISTS _content_info ')),
    metaIndex,
    metaStatement,
    finalStatement,
    structureVersion: meta[2],
    version: meta[3],
    contentByHash,
  }
}

export function planContentSync(dump, current, existingHashes = []) {
  const sameStructure = current?.structureVersion === dump.structureVersion
  const present = new Set(existingHashes)
  const wanted = new Set(dump.contentByHash.keys())
  const staleHashes = existingHashes.filter(hash => !wanted.has(hash))
  const missingGroups = [...dump.contentByHash].filter(([hash]) => !present.has(hash))

  if (sameStructure && current?.version === dump.version && Boolean(current.ready) && !missingGroups.length && !staleHashes.length)
    return { mode: 'ready', statements: [], missing: 0, stale: 0 }

  const resetInfo = `DELETE FROM _content_info WHERE id = ${sqlString(`checksum_${dump.collection}`)};`

  if (!sameStructure) {
    return {
      mode: 'rebuild',
      statements: [dump.infoCreateStatement, resetInfo, ...dump.statements.slice(dump.metaIndex)].filter(Boolean),
      missing: dump.contentByHash.size,
      stale: existingHashes.length,
    }
  }

  const missingStatements = missingGroups.flatMap(([, group]) => group)
  const deleteStale = staleHashes.length
    ? `DELETE FROM ${dump.table} WHERE "__hash__" IN (${staleHashes.map(sqlString).join(', ')});`
    : null

  return {
    mode: current?.version === dump.version ? 'resume' : 'incremental',
    statements: [
      dump.infoCreateStatement,
      resetInfo,
      dump.metaStatement,
      deleteStale,
      ...missingStatements,
      dump.finalStatement,
    ].filter(Boolean),
    missing: missingGroups.length,
    stale: staleHashes.length,
  }
}

export function missingWantedHashes(dump, hashes) {
  const present = new Set(hashes)
  return [...dump.contentByHash.keys()].filter(hash => !present.has(hash))
}

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

export async function pollMissingWantedHashes(dump, readHashes, {
  attempts = 6,
  delay = wait,
  initialDelayMs = 250,
} = {}) {
  let missing = []
  for (let attempt = 0; attempt < attempts; attempt++) {
    missing = missingWantedHashes(dump, readHashes())
    if (!missing.length)
      return []
    if (attempt + 1 < attempts)
      await delay(initialDelayMs * 2 ** attempt)
  }
  return missing
}

export function missingReadyDumps(dumps, info) {
  return dumps.filter((dump) => {
    const row = info.get(`checksum_${dump.collection}`)
    return row?.version !== dump.version || !row?.ready
  })
}

export async function pollMissingReadyDumps(dumps, readInfo, {
  attempts = 9,
  delay = wait,
  initialDelayMs = 250,
} = {}) {
  let missing = []
  for (let attempt = 0; attempt < attempts; attempt++) {
    missing = missingReadyDumps(dumps, readInfo())
    if (!missing.length)
      return []
    if (attempt + 1 < attempts)
      await delay(initialDelayMs * 2 ** attempt)
  }
  return missing
}

export function parseSyncArgs(argv) {
  const options = { collections: [], database: null, dryRun: false, help: false, sourceUrl: null }
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === '--')
      continue
    if (arg === '-h' || arg === '--help') {
      options.help = true
      continue
    }
    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }
    const readValue = (name) => {
      const value = arg === name ? argv[++index] : arg.slice(name.length + 1)
      if (!value || value.startsWith('--'))
        throw new Error(`${name} requires a value`)
      return value
    }
    if (arg === '--database' || arg.startsWith('--database=')) {
      options.database = readValue('--database')
      continue
    }
    if (arg === '--collection' || arg.startsWith('--collection=')) {
      options.collections.push(readValue('--collection'))
      continue
    }
    if (arg === '--source-url' || arg.startsWith('--source-url=')) {
      options.sourceUrl = readValue('--source-url').replace(/\/$/, '')
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }
  if (!options.help && !options.database)
    throw new Error('--database is required')
  if (options.sourceUrl && !options.collections.length)
    throw new Error('--source-url requires at least one --collection')
  return options
}

function runWrangler(database, args, { inherit = false } = {}) {
  if (!existsSync(wranglerBin))
    throw new Error('Local Wrangler binary is missing; run pnpm install --frozen-lockfile first')
  const result = spawnSync(wranglerBin, ['d1', 'execute', database, '--remote', ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 20 * 1024 * 1024,
    stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
  })
  if (result.error)
    throw result.error
  if (result.status !== 0)
    throw new Error(result.stderr?.trim() || `Wrangler exited ${result.status}`)
  return result.stdout ?? ''
}

function queryD1(database, sql) {
  const output = runWrangler(database, ['--command', sql, '--json'])
  const parsed = JSON.parse(output)
  return parsed.flatMap(entry => entry.results ?? [])
}

async function loadDumps(options) {
  if (options.sourceUrl) {
    return await Promise.all(options.collections.map(async (collection) => {
      const url = `${options.sourceUrl}/__nuxt_content/${collection}/sql_dump.txt`
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
      if (!response.ok)
        throw new Error(`Could not fetch ${url}: HTTP ${response.status}`)
      return parseContentDump(await response.text(), collection)
    }))
  }

  const contentDir = resolve(repoRoot, 'dist/__nuxt_content')
  if (!existsSync(contentDir))
    throw new Error(`Missing ${contentDir}; build the app before syncing content`)
  const wanted = new Set(options.collections)
  return readdirSync(contentDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && (!wanted.size || wanted.has(entry.name)))
    .map((entry) => {
      const path = resolve(contentDir, entry.name, 'sql_dump.txt')
      if (!existsSync(path))
        return null
      return parseContentDump(readFileSync(path, 'utf8'), entry.name)
    })
    .filter(Boolean)
}

function currentInfo(database, dumps) {
  const ids = dumps.map(dump => sqlString(`checksum_${dump.collection}`)).join(', ')
  if (!ids)
    return new Map()
  return new Map(
    queryD1(database, `SELECT id, ready, structureVersion, version FROM _content_info WHERE id IN (${ids})`)
      .map(row => [row.id, row]),
  )
}

function existingHashes(database, dump, current) {
  if (current?.structureVersion !== dump.structureVersion)
    return []
  return queryD1(database, `SELECT "__hash__" AS hash FROM ${dump.table} ORDER BY "__hash__" ASC`)
    .map(row => row.hash)
}

export async function main(argv = process.argv.slice(2)) {
  let tempDir
  try {
    const options = parseSyncArgs(argv)
    if (options.help) {
      process.stdout.write(HELP)
      return 0
    }

    const dumps = await loadDumps(options)
    if (!dumps.length)
      throw new Error('No Nuxt Content dumps found')
    const before = currentInfo(options.database, dumps)

    tempDir = mkdtempSync(resolve(tmpdir(), 'nuxt-content-sync-'))
    for (const dump of dumps) {
      const current = before.get(`checksum_${dump.collection}`)
      const hashes = existingHashes(options.database, dump, current)
      const plan = planContentSync(dump, current, hashes)
      console.log(`[nuxt-content-sync] ${dump.collection}: ${plan.mode} (${plan.missing} missing, ${plan.stale} stale)`)
      if (!plan.statements.length || options.dryRun)
        continue

      const sqlPath = resolve(tempDir, `${dump.collection}.sql`)
      writeFileSync(sqlPath, `${plan.statements.join('\n')}\n`, { mode: 0o600 })
      runWrangler(options.database, ['--file', sqlPath, '--yes', '--json'], { inherit: true })

      const missingAfterApply = await pollMissingWantedHashes(
        dump,
        () => existingHashes(options.database, dump, { structureVersion: dump.structureVersion }),
      )
      if (missingAfterApply.length)
        throw new Error(`${dump.collection}: ${missingAfterApply.length} row(s) missing after import (${missingAfterApply.slice(0, 5).join(', ')})`)
    }

    if (options.dryRun)
      return 0

    const failures = await pollMissingReadyDumps(
      dumps,
      () => currentInfo(options.database, dumps),
    )
    if (failures.length)
      throw new Error(`D1 content readiness failed for: ${failures.map(dump => dump.collection).join(', ')}`)

    console.log(`[nuxt-content-sync] ${dumps.length} collection(s) ready`)
    return 0
  }
  catch (error) {
    console.error(`[nuxt-content-sync] ${error instanceof Error ? error.message : String(error)}`)
    return 1
  }
  finally {
    if (tempDir)
      rmSync(tempDir, { force: true, recursive: true })
  }
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename)
  process.exitCode = await main()
