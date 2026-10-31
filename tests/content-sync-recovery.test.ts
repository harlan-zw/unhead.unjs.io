import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { gzipSync } from 'node:zlib'
import { afterEach, expect, it, vi } from 'vitest'
import { main } from '../scripts/sync-nuxt-content-d1.mjs'

vi.mock('node:child_process', () => ({ spawnSync: vi.fn() }))

const databases: DatabaseSync[] = []

afterEach(() => {
  vi.mocked(spawnSync).mockReset()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  databases.splice(0).forEach(database => database.close())
})

function statements(collection: string) {
  return [
    'CREATE TABLE IF NOT EXISTS _content_info (id TEXT PRIMARY KEY, "ready" BOOLEAN, "structureVersion" VARCHAR, "version" VARCHAR, "__hash__" TEXT UNIQUE); -- structure',
    `INSERT INTO _content_info VALUES ('checksum_${collection}', false, 'structure-a', 'v3--version-a', 'meta-${collection}'); -- meta`,
    `DROP TABLE IF EXISTS _content_${collection}; -- structure`,
    `CREATE TABLE IF NOT EXISTS _content_${collection} (id TEXT PRIMARY KEY, "path" VARCHAR, "__hash__" TEXT UNIQUE); -- structure`,
    `INSERT INTO _content_${collection} VALUES ('a', '/a', 'hash-a'); -- hash-a`,
    `UPDATE _content_info SET ready = true WHERE id = 'checksum_${collection}'; -- meta`,
  ]
}

function fixture() {
  const database = new DatabaseSync(':memory:')
  databases.push(database)
  const writes: string[] = []
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const collection = new URL(url).pathname.split('/')[2]!
    return new Response(gzipSync(JSON.stringify(statements(collection))).toString('base64'))
  }))
  vi.mocked(spawnSync).mockImplementation((_command, args = []) => {
    const commandIndex = args.indexOf('--command')
    let results: unknown[] = []
    if (commandIndex >= 0) {
      results = database.prepare(args[commandIndex + 1]!).all()
    }
    else {
      const path = args[args.indexOf('--file') + 1]!
      writes.push(basename(path, '.sql'))
      database.exec(readFileSync(path, 'utf8'))
    }
    return { pid: 1, output: [null, '', ''], stdout: JSON.stringify([{ results }]), stderr: '', status: 0, signal: null }
  })
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  return { database, writes }
}

const args = ['--database', 'content-fixture', '--source-url', 'https://fixtures.example', '--collection', 'docs']

it('imports content into an empty database', async () => {
  const { database } = fixture()

  expect(await main(args)).toBe(0)
  expect(database.prepare('SELECT id, path FROM _content_docs').all()).toEqual([{ id: 'a', path: '/a' }])
  expect(database.prepare('SELECT ready FROM _content_info').get()).toEqual({ ready: 1 })
})

it('rebuilds a missing table despite metadata claiming that it is ready', async () => {
  const { database } = fixture()
  database.exec(statements('docs').join('\n'))
  database.exec('DROP TABLE _content_docs')

  expect(await main(args)).toBe(0)
  expect(database.prepare('SELECT id, path FROM _content_docs').all()).toEqual([{ id: 'a', path: '/a' }])
  expect(database.prepare('SELECT ready FROM _content_info').get()).toEqual({ ready: 1 })
})

it('restores only the missing collection in a partial schema', async () => {
  const { database, writes } = fixture()
  database.exec(statements('docs').join('\n'))
  database.exec(statements('snippets').join('\n'))
  database.exec('DROP TABLE _content_snippets')

  expect(await main([...args, '--collection', 'snippets'])).toBe(0)
  expect(writes).toEqual(['snippets'])
  expect(database.prepare('SELECT id, path FROM _content_docs').all()).toEqual([{ id: 'a', path: '/a' }])
  expect(database.prepare('SELECT id, path FROM _content_snippets').all()).toEqual([{ id: 'a', path: '/a' }])
})

it('keeps a healthy collection unchanged', async () => {
  const { database, writes } = fixture()
  database.exec(statements('docs').join('\n'))

  expect(await main(args)).toBe(0)
  expect(writes).toEqual([])
  expect(database.prepare('SELECT id, path FROM _content_docs').all()).toEqual([{ id: 'a', path: '/a' }])
})

it('plans a missing-table rebuild without changing D1 during preflight', async () => {
  const { database, writes } = fixture()
  database.exec(statements('docs').join('\n'))
  database.exec('DROP TABLE _content_docs')

  expect(await main([...args, '--dry-run'])).toBe(0)
  expect(writes).toEqual([])
  expect(database.prepare('SELECT name FROM sqlite_schema WHERE name = ?').get('_content_docs')).toBeUndefined()
  expect(database.prepare('SELECT ready FROM _content_info').get()).toEqual({ ready: 1 })
})
