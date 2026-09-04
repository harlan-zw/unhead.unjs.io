/// <reference types="@cloudflare/workers-types" />
import { describe, expect, it, vi } from 'vitest'
import { wrapD1WithRetry } from '../server/utils/d1-retry'

const OVERLOADED = 'D1_ERROR: D1 DB is overloaded and unable to accept additional requests'

type StatementMethod = 'all' | 'first' | 'raw' | 'run'

function createStatement(outcomes: Array<() => Promise<unknown>>) {
  let index = 0
  const next = () => outcomes[Math.min(index++, outcomes.length - 1)]()
  const all = vi.fn(next)
  return {
    all,
    bind: vi.fn(() => ({ all, first: vi.fn(), run: vi.fn(), raw: vi.fn() })),
    first: vi.fn(next),
    raw: vi.fn(next),
    run: vi.fn(next),
  }
}

function createDatabase(
  statement: ReturnType<typeof createStatement>,
  overrides: {
    batch?: (statements: D1PreparedStatement[]) => Promise<unknown>
    exec?: () => Promise<unknown>
  } = {},
) {
  return {
    batch: vi.fn(overrides.batch ?? (async () => [])),
    dump: vi.fn(async () => new ArrayBuffer(0)),
    exec: vi.fn(overrides.exec ?? (async () => ({ count: 0, duration: 0 }))),
    prepare: vi.fn(() => statement),
    withSession: vi.fn(),
  }
}

describe('d1 retry wrapper', () => {
  it('retries transient overload errors until the query succeeds', async () => {
    const statement = createStatement([
      () => { throw new Error(OVERLOADED) },
      () => { throw new Error(OVERLOADED) },
      async () => ({ results: [{ id: 1 }], success: true }),
    ])
    const sleep = vi.fn(async () => {})
    const db = wrapD1WithRetry(createDatabase(statement) as unknown as D1Database, { sleep })

    const result = await db.prepare('SELECT * FROM content').bind('docs').all()

    expect(result.results).toEqual([{ id: 1 }])
    expect(statement.bind).toHaveBeenCalledWith('docs')
    expect(statement.all).toHaveBeenCalledTimes(3)
    expect(sleep.mock.calls).toEqual([[100], [200]])
  })

  it('gives up after the retry cap and rethrows the transient error', async () => {
    const statement = createStatement([
      () => { throw new Error(OVERLOADED) },
    ])
    const sleep = vi.fn(async () => {})
    const db = wrapD1WithRetry(createDatabase(statement) as unknown as D1Database, { sleep, maxRetries: 2 })

    await expect(db.prepare('SELECT 1').bind().all()).rejects.toThrow(OVERLOADED)
    expect(statement.all).toHaveBeenCalledTimes(3)
    expect(sleep.mock.calls).toEqual([[100], [200]])
  })

  it('does not retry permanent D1 errors', async () => {
    const statement = createStatement([
      () => { throw new Error('D1_ERROR: UNIQUE constraint failed: content.id') },
      async () => ({ results: [], success: true }),
    ])
    const sleep = vi.fn(async () => {})
    const db = wrapD1WithRetry(createDatabase(statement) as unknown as D1Database, { sleep })

    await expect(db.prepare('SELECT 1').bind().all()).rejects.toThrow('UNIQUE constraint failed')
    expect(statement.all).toHaveBeenCalledTimes(1)
    expect(sleep).not.toHaveBeenCalled()
  })

  it('does not retry unexpected non-D1 errors', async () => {
    const statement = createStatement([
      () => { throw new Error('something else broke') },
    ])
    const sleep = vi.fn(async () => {})
    const db = wrapD1WithRetry(createDatabase(statement) as unknown as D1Database, { sleep })

    await expect(db.prepare('SELECT 1').bind().all()).rejects.toThrow('something else broke')
    expect(statement.all).toHaveBeenCalledTimes(1)
    expect(sleep).not.toHaveBeenCalled()
  })

  it.each(['all', 'first', 'raw', 'run'] as const satisfies StatementMethod[])('retries transient failures on %s', async (method) => {
    const statement = createStatement([
      () => { throw new Error(OVERLOADED) },
      async () => ({ results: [], success: true }),
    ])
    const sleep = vi.fn(async () => {})
    const db = wrapD1WithRetry(createDatabase(statement) as unknown as D1Database, { sleep })

    const proxied = db.prepare('SELECT 1') as unknown as Record<StatementMethod, () => Promise<unknown>>
    await proxied[method]()

    expect(statement[method]).toHaveBeenCalledTimes(2)
    expect(sleep).toHaveBeenCalledTimes(1)
  })

  it('retries batch and passes the original statements to the binding', async () => {
    const statement = createStatement([async () => ({ results: [], success: true })])
    let batchAttempts = 0
    const rawDatabase = createDatabase(statement, {
      batch: async (statements) => {
        batchAttempts++
        if (batchAttempts === 1)
          throw new Error(OVERLOADED)
        return statements.map(() => ({ results: [], success: true }))
      },
    })
    const sleep = vi.fn(async () => {})
    const db = wrapD1WithRetry(rawDatabase as unknown as D1Database, { sleep })

    const results = await db.batch([db.prepare('SELECT 1')])

    expect(results).toHaveLength(1)
    expect(rawDatabase.batch).toHaveBeenCalledTimes(2)
    expect(rawDatabase.batch.mock.calls[1]![0]![0]).toBe(statement)
  })

  it('retries transient failures on raw SQL exec', async () => {
    const statement = createStatement([async () => ({ results: [], success: true })])
    let execAttempts = 0
    const rawDatabase = createDatabase(statement, {
      exec: async () => {
        execAttempts++
        if (execAttempts === 1)
          throw new Error(OVERLOADED)
        return { count: 1, duration: 1 }
      },
    })
    const sleep = vi.fn(async () => {})
    const db = wrapD1WithRetry(rawDatabase as unknown as D1Database, { sleep })

    expect(await db.exec('DROP TABLE IF EXISTS outdated')).toEqual({ count: 1, duration: 1 })
    expect(rawDatabase.exec).toHaveBeenCalledTimes(2)
    expect(sleep).toHaveBeenCalledTimes(1)
  })
})
