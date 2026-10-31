import { spawnSync } from 'node:child_process'
import { gzipSync } from 'node:zlib'
import { afterEach, expect, it, vi } from 'vitest'
import { main } from '../scripts/sync-nuxt-content-d1.mjs'

vi.mock('node:child_process', () => ({ spawnSync: vi.fn() }))

afterEach(() => {
  vi.mocked(spawnSync).mockReset()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function contentResponse() {
  const statements = [
    'CREATE TABLE IF NOT EXISTS _content_info (id TEXT PRIMARY KEY, "ready" BOOLEAN, "structureVersion" VARCHAR, "version" VARCHAR, "__hash__" TEXT UNIQUE); -- structure',
    'INSERT INTO _content_info VALUES (\'checksum_docs\', false, \'structure-a\', \'version-a\', \'meta-hash\'); -- meta',
    'CREATE TABLE IF NOT EXISTS _content_docs (id TEXT PRIMARY KEY, "__hash__" TEXT UNIQUE); -- structure',
    'UPDATE _content_info SET ready = true WHERE id = \'checksum_docs\'; -- meta',
  ]
  return new Response(gzipSync(JSON.stringify(statements)).toString('base64'))
}

it.each([
  { name: 'sync', flags: [] },
  { name: 'dry run', flags: ['--dry-run'] },
])('reports a failed remote query during $name', async ({ flags }) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(contentResponse()))
  vi.mocked(spawnSync).mockReturnValue({
    pid: 1,
    output: [null, '', ''],
    stdout: JSON.stringify({ error: { text: 'D1 API query denied (7403)' } }),
    stderr: '',
    status: 1,
    signal: null,
  })
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})

  const status = await main(['--database', 'content-fixture', '--source-url', 'https://fixtures.example', '--collection', 'docs', ...flags])

  expect(status).toBe(1)
  expect(spawnSync).toHaveBeenCalledWith(expect.any(String), expect.arrayContaining([
    'd1',
    'execute',
    'content-fixture',
    '--remote',
    '--command',
    expect.stringContaining('FROM sqlite_schema'),
    '--json',
  ]), expect.any(Object))
  expect(error).toHaveBeenCalledWith(expect.stringContaining('D1 API query denied (7403)'))
})

it('checks remote metadata during a successful dry run without applying SQL', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(contentResponse()))
  vi.mocked(spawnSync).mockReturnValue({
    pid: 1,
    output: [null, '', ''],
    stdout: JSON.stringify([{ results: [] }]),
    stderr: '',
    status: 0,
    signal: null,
  })
  vi.spyOn(console, 'log').mockImplementation(() => {})

  const status = await main(['--database', 'content-fixture', '--source-url', 'https://fixtures.example', '--collection', 'docs', '--dry-run'])

  expect(status).toBe(0)
  const commands = vi.mocked(spawnSync).mock.calls.map(([, args]) => args)
  expect(commands).toContainEqual(expect.arrayContaining([
    '--remote',
    '--command',
    expect.stringContaining('FROM sqlite_schema'),
  ]))
  expect(commands.some(args => args?.includes('--file'))).toBe(false)
})
