import { DatabaseSync } from 'node:sqlite'
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { parseContentDump, planContentSync } from '../scripts/sync-nuxt-content-d1.mjs'

const PATH_LOOKUP = '/docs/api/use-head'
const EXPECTED_LOOKUP_ROW = [{ id: 'b', path: PATH_LOOKUP, title: 'useHead()' }]

function docsDump(collection = 'docs') {
  const rows = [
    ['a', '/docs/getting-started', 'Getting Started'],
    ['b', '/docs/api/use-head', 'useHead()'],
    ['c', '/docs/api/unhead', 'createUnhead()'],
    ['d', '/docs/head/guide/installation', 'Installation'],
    ['e', '/docs/head/guide/routing', 'Routing'],
    ['f', '/docs/head/api/composables', 'Composables'],
  ]
  const statements = [
    'CREATE TABLE IF NOT EXISTS _content_info (id TEXT PRIMARY KEY, "ready" BOOLEAN, "structureVersion" VARCHAR, "version" VARCHAR, "__hash__" TEXT UNIQUE); -- structure',
    `INSERT INTO _content_info VALUES ('checksum_${collection}', false, 'structure-a', 'v3--version-a', 'meta-hash'); -- meta`,
    `DROP TABLE IF EXISTS _content_${collection}; -- structure`,
    `CREATE TABLE IF NOT EXISTS _content_${collection} (id TEXT PRIMARY KEY, "path" TEXT, "title" VARCHAR, "body" TEXT, "__hash__" TEXT UNIQUE); -- structure`,
    ...rows.map(([id, path, title]) => `INSERT INTO _content_${collection} VALUES ('${id}', '${path}', '${title}', 'body-${id}', 'hash-${id}'); -- hash-${id}`),
    `UPDATE _content_info SET ready = true WHERE id = 'checksum_${collection}'; -- meta`,
  ]
  return parseContentDump(gzipSync(JSON.stringify(statements)).toString('base64'), collection)
}

function pathlessDump(collection = 'docs') {
  const statements = [
    'CREATE TABLE IF NOT EXISTS _content_info (id TEXT PRIMARY KEY, "ready" BOOLEAN, "structureVersion" VARCHAR, "version" VARCHAR, "__hash__" TEXT UNIQUE); -- structure',
    `INSERT INTO _content_info VALUES ('checksum_${collection}', false, 'structure-a', 'v3--version-a', 'meta-hash'); -- meta`,
    `DROP TABLE IF EXISTS _content_${collection}; -- structure`,
    `CREATE TABLE IF NOT EXISTS _content_${collection} (id TEXT PRIMARY KEY, "stem" VARCHAR, "__hash__" TEXT UNIQUE); -- structure`,
    `INSERT INTO _content_${collection} VALUES ('a', 'a', 'hash-a'); -- hash-a`,
    `UPDATE _content_info SET ready = true WHERE id = 'checksum_${collection}'; -- meta`,
  ]
  return parseContentDump(gzipSync(JSON.stringify(statements)).toString('base64'), collection)
}

function queryPlan(database: InstanceType<typeof DatabaseSync>, lookup: string) {
  return database.prepare(`EXPLAIN QUERY PLAN ${lookup}`)
    .all(PATH_LOOKUP)
    .map(row => row.detail)
    .join('\n')
}

describe('nuxt content D1 path index', () => {
  const docs = docsDump()
  const lookup = `SELECT id, path, title FROM ${docs.table} WHERE path = ?`
  const pathIndex = `${docs.table}_path_idx`
  const allHashes = ['hash-a', 'hash-b', 'hash-c', 'hash-d', 'hash-e', 'hash-f']

  it('moves the by-path lookup from a scan to the index on rebuilds', () => {
    const plan = planContentSync(docs, {
      ready: 0,
      structureVersion: 'structure-old',
      version: 'v3--older',
    }, ['hash-old'])
    expect(plan).toMatchObject({ mode: 'rebuild', missing: 6 })

    const database = new DatabaseSync(':memory:')
    for (const statement of plan.statements)
      database.exec(statement)

    expect(queryPlan(database, lookup)).toContain(`SEARCH ${docs.table} USING INDEX ${pathIndex}`)
    expect(database.prepare(lookup).all(PATH_LOOKUP)).toEqual(EXPECTED_LOOKUP_ROW)
  })

  it('indexes per-render path lookups on tables a pre-index sync left scanning', () => {
    const database = new DatabaseSync(':memory:')
    for (const statement of docs.statements)
      database.exec(statement)

    expect(queryPlan(database, lookup)).toContain(`SCAN ${docs.table}`)
    const beforeRows = database.prepare(lookup).all(PATH_LOOKUP)

    const plan = planContentSync(docs, {
      ready: 1,
      structureVersion: docs.structureVersion,
      version: 'v3--older',
    }, allHashes)
    expect(plan).toMatchObject({ mode: 'incremental', missing: 0, stale: 0 })

    // A crashed apply can stop between statements, so replaying the same plan
    // again must keep working and must keep the index creation idempotent.
    for (const statement of plan.statements)
      database.exec(statement)
    for (const statement of plan.statements)
      database.exec(statement)

    expect(queryPlan(database, lookup)).toContain(`SEARCH ${docs.table} USING INDEX ${pathIndex}`)
    expect(database.prepare(lookup).all(PATH_LOOKUP)).toEqual(beforeRows)
    expect(database.prepare(`SELECT ready FROM _content_info WHERE id = 'checksum_docs'`).get())
      .toEqual({ ready: 1 })
  })

  it('places index creation before the ready flag flips on resume', () => {
    const plan = planContentSync(docs, {
      ready: 0,
      structureVersion: docs.structureVersion,
      version: docs.version,
    }, allHashes.filter(hash => hash !== 'hash-b'))
    expect(plan).toMatchObject({ mode: 'resume', missing: 1 })

    const database = new DatabaseSync(':memory:')
    for (const statement of docs.statements)
      database.exec(statement)
    for (const statement of plan.statements)
      database.exec(statement)

    expect(plan.statements.at(-1)).toContain('ready = true')
    expect(plan.statements.at(-2)).toContain(`CREATE INDEX IF NOT EXISTS ${pathIndex}`)
    expect(queryPlan(database, lookup)).toContain(`SEARCH ${docs.table} USING INDEX ${pathIndex}`)
    expect(database.prepare(lookup).all(PATH_LOOKUP)).toEqual(EXPECTED_LOOKUP_ROW)
  })

  it('skips the index when the collection table has no path column', () => {
    const dump = pathlessDump()
    const plan = planContentSync(dump, {
      ready: 1,
      structureVersion: dump.structureVersion,
      version: 'v3--older',
    }, ['hash-a'])
    expect(plan.mode).toBe('incremental')
    expect(plan.statements.some(statement => statement.includes('CREATE INDEX'))).toBe(false)

    const database = new DatabaseSync(':memory:')
    expect(() => {
      for (const statement of plan.statements)
        database.exec(statement)
    }).not.toThrow()
  })
})
