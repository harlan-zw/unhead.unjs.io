import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import {
  missingReadyDumps,
  missingWantedHashes,
  parseContentDump,
  parseSyncArgs,
  planContentSync,
  pollMissingReadyDumps,
  pollMissingWantedHashes,
} from '../scripts/sync-nuxt-content-d1.mjs'

function dump(collection = 'docs') {
  const rows = [
    'CREATE TABLE IF NOT EXISTS _content_info (id TEXT PRIMARY KEY, "ready" BOOLEAN, "structureVersion" VARCHAR, "version" VARCHAR, "__hash__" TEXT UNIQUE); -- structure',
    `INSERT INTO _content_info VALUES ('checksum_${collection}', false, 'structure-a', 'v3--version-a', 'meta-hash'); -- meta`,
    `DROP TABLE IF EXISTS _content_${collection}; -- structure`,
    `CREATE TABLE IF NOT EXISTS _content_${collection} (id TEXT PRIMARY KEY, "stem" VARCHAR, "__hash__" TEXT UNIQUE); -- structure`,
    `INSERT INTO _content_${collection} VALUES ('a', 'a', 'hash-a'); -- hash-a`,
    `INSERT INTO _content_${collection} VALUES ('b', 'b', 'hash-b'); -- hash-b`,
    `INSERT INTO _content_${collection} VALUES ('c', 'c-part-1', 'hash-c-70000'); -- hash-c`,
    `UPDATE _content_${collection} SET stem = CONCAT(stem, '-part-2'), "__hash__" = 'hash-c' WHERE id = 'c' AND "__hash__" = 'hash-c-70000'; -- hash-c`,
    `UPDATE _content_info SET ready = true WHERE id = 'checksum_${collection}'; -- meta`,
  ]
  return parseContentDump(gzipSync(JSON.stringify(rows)).toString('base64'), collection)
}

function oversizedDump(collection = 'docs') {
  const body = `😀'content`.repeat(12_000)
  const rows = [
    'CREATE TABLE IF NOT EXISTS _content_info (id TEXT PRIMARY KEY, "ready" BOOLEAN, "structureVersion" VARCHAR, "version" VARCHAR, "__hash__" TEXT UNIQUE); -- structure',
    `INSERT INTO _content_info VALUES ('checksum_${collection}', false, 'structure-a', 'v3--version-a', 'meta-hash'); -- meta`,
    `DROP TABLE IF EXISTS _content_${collection}; -- structure`,
    `CREATE TABLE IF NOT EXISTS _content_${collection} (id TEXT PRIMARY KEY, "body" TEXT, "__hash__" TEXT UNIQUE); -- structure`,
    `INSERT INTO _content_${collection} VALUES ('large', '${body.replaceAll('\'', '\'\'')}', 'hash-large'); -- hash-large`,
    `UPDATE _content_info SET ready = true WHERE id = 'checksum_${collection}'; -- meta`,
  ]
  return parseContentDump(gzipSync(JSON.stringify(rows)).toString('base64'), collection)
}

describe('nuxt content D1 sync planning', () => {
  it('does nothing when the expected checksum and hashes are ready', () => {
    expect(planContentSync(dump(), {
      ready: 1,
      structureVersion: 'structure-a',
      version: 'v3--version-a',
    }, ['hash-a', 'hash-b', 'hash-c'])).toMatchObject({ mode: 'ready', statements: [] })
  })

  it('resumes an abandoned import with only missing rows', () => {
    const plan = planContentSync(dump(), {
      ready: 0,
      structureVersion: 'structure-a',
      version: 'v3--version-a',
    }, ['hash-a', 'hash-c'])

    expect(plan).toMatchObject({ mode: 'resume', missing: 1, stale: 0 })
    expect(plan.statements.some(statement => statement.includes(`VALUES ('a'`))).toBe(false)
    expect(plan.statements.some(statement => statement.includes(`VALUES ('b'`))).toBe(true)
    expect(plan.statements.at(-1)).toContain('ready = true')
  })

  it('replays every statement in a split content row', () => {
    const plan = planContentSync(dump(), {
      ready: 0,
      structureVersion: 'structure-a',
      version: 'v3--version-a',
    }, ['hash-a', 'hash-b'])

    const insertAt = plan.statements.findIndex(statement => statement.includes(`VALUES ('c'`))
    const continuationAt = plan.statements.findIndex(statement => statement.includes(`CONCAT(stem, '-part-2')`))
    expect(insertAt).toBeGreaterThan(-1)
    expect(continuationAt).toBe(insertAt + 1)
  })

  it('rechunks generated statements below the D1 byte limit', () => {
    const statements = oversizedDump().contentByHash.get('hash-large') ?? []

    expect(statements.length).toBeGreaterThan(1)
    expect(statements.every(statement => Buffer.byteLength(statement) <= 100_000)).toBe(true)
    expect(statements.at(1)).toContain('CONCAT("body"')
  })

  it('removes a provisional split hash and imports the final row', () => {
    const plan = planContentSync(dump(), {
      ready: 0,
      structureVersion: 'structure-a',
      version: 'v3--version-a',
    }, ['hash-a', 'hash-b', 'hash-c-70000'])

    expect(plan).toMatchObject({ mode: 'resume', missing: 1, stale: 1 })
    expect(plan.statements.join('\n')).toContain(`WHERE "__hash__" IN ('hash-c-70000')`)
  })

  it('rebuilds when the table structure changed', () => {
    const plan = planContentSync(dump(), {
      ready: 0,
      structureVersion: 'structure-old',
      version: 'v3--older',
    }, ['hash-old'])

    expect(plan).toMatchObject({ mode: 'rebuild', missing: 3 })
    expect(plan.statements.join('\n')).toContain('DROP TABLE IF EXISTS _content_docs')
  })

  it('detects missing final hashes after import', () => {
    expect(missingWantedHashes(dump(), ['hash-a', 'hash-b', 'hash-c-70000'])).toEqual(['hash-c'])
    expect(missingWantedHashes(dump(), ['hash-a', 'hash-b', 'hash-c'])).toEqual([])
  })

  it('retries hash reads until D1 exposes committed rows', async () => {
    const observations = [
      ['hash-a', 'hash-b'],
      ['hash-a', 'hash-b', 'hash-c'],
    ]
    const delays: number[] = []

    await expect(pollMissingWantedHashes(
      dump(),
      () => observations.shift() ?? [],
      {
        attempts: 3,
        initialDelayMs: 25,
        delay: async milliseconds => void delays.push(milliseconds),
      },
    )).resolves.toEqual([])
    expect(delays).toEqual([25])
  })

  it('retries readiness metadata until D1 exposes the checksum', async () => {
    const docs = dump()
    const stale = new Map([
      ['checksum_docs', {
        ready: 0,
        structureVersion: docs.structureVersion,
        version: 'v3--older',
      }],
    ])
    const ready = new Map([
      ['checksum_docs', {
        ready: 1,
        structureVersion: docs.structureVersion,
        version: docs.version,
      }],
    ])
    const observations = [stale, ready]
    const delays: number[] = []

    expect(missingReadyDumps([docs], stale)).toEqual([docs])
    await expect(pollMissingReadyDumps(
      [docs],
      () => observations.shift() ?? new Map(),
      {
        attempts: 3,
        initialDelayMs: 25,
        delay: async milliseconds => void delays.push(milliseconds),
      },
    )).resolves.toEqual([])
    expect(delays).toEqual([25])
  })

  it('requires an explicit production database', () => {
    expect(() => parseSyncArgs([])).toThrow('--database is required')
    expect(parseSyncArgs(['--database=unhead-unjs-io', '--dry-run']))
      .toMatchObject({ database: 'unhead-unjs-io', dryRun: true })
  })
})
