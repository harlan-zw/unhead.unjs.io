/// <reference types="@cloudflare/workers-types" />

import type { H3Event as LegacyH3Event } from 'h3'
import type { SQLInputValue } from 'node:sqlite'
import { DatabaseSync } from 'node:sqlite'
import { H3, H3Event } from 'nitro/h3'
import { afterEach, describe, expect, it, vi } from 'vitest'
import feedbackHandler from '../server/api/feedback.post'
import worker from '../server/cloudflare-pages-worker'
import { feedback } from '../server/database/schema'
import queryHandler from '../server/handlers/content-query-cache'
import { getDB } from '../server/utils/db'

// Exercise handlers with Nitro 3's H3 APIs, rather than the root H3 v1 package.
vi.mock('h3', async () => import('nitro/h3'))
vi.mock('cloudflare:workers', () => ({ env: {} }))
vi.mock('#nitro/virtual/polyfills', () => ({}))
vi.mock('#nitro/virtual/public-assets', () => ({ isPublicAssetURL: () => false }))
vi.mock('#nitro/runtime/app', () => ({ resolveWebsocketHooks: () => ({}) }))
vi.mock('#nitro/runtime/task', () => ({ runCronTasks: vi.fn() }))
vi.mock('nitro/app', () => ({ useNitroApp: () => ({ fetch: (request: Request) => app.fetch(request) }) }))
vi.mock('#content/manifest', () => ({ checksums: { docsUnhead: 'current-checksum' } }))
vi.mock('#unhead-content-query-original', () => ({ default: async () => [{ path: '/docs/head' }] }))
vi.mock('nitropack/runtime', () => ({ useRuntimeConfig: () => ({ checkinDeployment: 'runtime-regression' }) }))

const app = new H3()
app.post('/api/feedback', event => feedbackHandler(event as unknown as LegacyH3Event))
app.post('/__nuxt_content/docsUnhead/query', event => queryHandler(event as unknown as LegacyH3Event))

function executionContext() {
  const pending: Promise<unknown>[] = []
  return {
    context: { waitUntil: (promise: Promise<unknown>) => pending.push(promise) } as unknown as ExecutionContext,
    settle: () => Promise.all(pending),
  }
}

function feedbackDatabase() {
  const sqlite = new DatabaseSync(':memory:')
  sqlite.exec(`CREATE TABLE feedback (
    id TEXT PRIMARY KEY, path TEXT NOT NULL, thumb TEXT, comment TEXT,
    metadata TEXT, user_id TEXT, session_id TEXT, created_at INTEGER
  )`)
  let attempts = 0
  const binding = {
    prepare(sql: string) {
      const statement = sqlite.prepare(sql)
      return {
        bind(...values: SQLInputValue[]) {
          return {
            async run() {
              if (++attempts === 1)
                throw new Error('D1_ERROR: database is overloaded')
              statement.run(...values)
              return { success: true, results: [] }
            },
            async raw() {
              statement.setReturnArrays(true)
              return statement.all(...values)
            },
          }
        },
      }
    },
  } as unknown as D1Database
  return { sqlite, binding, attempts: () => attempts }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('pages request runtime', () => {
  it('retries a transient D1 failure and persists valid feedback through the Pages Worker', async () => {
    const fixture = feedbackDatabase()
    const context = executionContext()
    try {
      const response = await worker.fetch(new Request('https://unhead.unjs.io/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'referer': 'https://unhead.unjs.io/docs/head' },
        body: JSON.stringify({ comment: 'Useful documentation' }),
      }), { DB: fixture.binding } as unknown as Cloudflare.Env, context.context)

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ ok: true })
      await context.settle()
      expect(fixture.attempts()).toBe(2)
      expect(fixture.sqlite.prepare('SELECT path, comment FROM feedback').all()).toEqual([
        { path: 'docs/head', comment: 'Useful documentation' },
      ])

      const event = new H3Event(Object.assign(new Request('https://unhead.unjs.io/admin'), {
        runtime: { name: 'cloudflare', cloudflare: { env: { DB: fixture.binding }, context: context.context } },
      }))
      const rows = await getDB(event as unknown as LegacyH3Event).select({ comment: feedback.comment }).from(feedback).all()
      expect(rows).toEqual([{ comment: 'Useful documentation' }])
    }
    finally {
      fixture.sqlite.close()
    }
  })

  it('keeps the legacy event context D1 fallback', async () => {
    const fixture = feedbackDatabase()
    try {
      const event = new H3Event(new Request('https://unhead.unjs.io/admin'), { cloudflare: { env: { DB: fixture.binding } } })
      expect(await getDB(event as unknown as LegacyH3Event).select().from(feedback).all()).toEqual([])
    }
    finally {
      fixture.sqlite.close()
    }
  })

  it('returns a 200 MISS then a HIT after the registered cache write settles', async () => {
    const entries = new Map<string, Response>()
    vi.stubGlobal('caches', { open: async () => ({
      match: async (key: Request) => entries.get(key.url)?.clone(),
      put: async (key: Request, response: Response) => { entries.set(key.url, response.clone()) },
    }) })
    const context = executionContext()
    const dispatch = () => worker.fetch(new Request('https://unhead.unjs.io/__nuxt_content/docsUnhead/query?v=current-checksum', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sql: 'SELECT * FROM docsUnhead' }),
    }), {} as Cloudflare.Env, context.context)

    const miss = await dispatch()
    expect(miss.status).toBe(200)
    expect(miss.headers.get('x-unhead-cache')).toBe('MISS')
    expect(await miss.json()).toEqual([{ path: '/docs/head' }])
    await context.settle()
    const hit = await dispatch()
    expect(hit.status).toBe(200)
    expect(hit.headers.get('x-unhead-cache')).toBe('HIT')
    expect(await hit.json()).toEqual([{ path: '/docs/head' }])

    for (const response of entries.values())
      response.headers.set('x-unhead-cache-created-at', String(Date.now() - 25 * 60 * 60 * 1000))
    const stale = await dispatch()
    expect(stale.status).toBe(200)
    expect(stale.headers.get('x-unhead-cache')).toBe('STALE')
    expect(await stale.json()).toEqual([{ path: '/docs/head' }])
    await context.settle()
    expect((await dispatch()).headers.get('x-unhead-cache')).toBe('HIT')
  })
})
