/// <reference types="@cloudflare/workers-types" />

import type { SQLInputValue } from 'node:sqlite'
import { DatabaseSync } from 'node:sqlite'
import { setCloudflareBindings } from '@harlan-zw/nuxt-cloudflare/bindings'
import { H3, mockEvent } from 'h3'
import { afterEach, describe, expect, it, vi } from 'vitest'
import fetchHeadHandler from '../layers/tools/server/api/tools/fetch-head.get'
import trackHandler from '../layers/tools/server/api/tools/track.post'
import thumbsHandler from '../server/api/feedback-thumbs.post'
import feedbackHandler from '../server/api/feedback.post'
import worker from '../server/cloudflare-pages-worker'
import { feedback } from '../server/database/schema'
import queryHandler from '../server/handlers/content-query-cache'
import { trackToolUsage } from '../server/utils/analytics'
import { getDB } from '../server/utils/db'
import { checkFreeToolRateLimit } from '../server/utils/rate-limit'

vi.mock('cloudflare:workers', () => ({ env: {} }))
vi.mock('#nitro/virtual/polyfills', () => ({}))
vi.mock('#nitro/virtual/public-assets', () => ({
  isPublicAssetURL: () => false,
}))
vi.mock('#nitro/runtime/app', () => ({
  resolveWebsocketHooks: () => ({}),
}))
vi.mock('#nitro/runtime/task', () => ({
  runCronTasks: vi.fn(),
}))
vi.mock('nitro/app', () => ({
  useNitroApp: () => ({
    fetch: (request: Request) => {
      // Require request-scoped bindings, rather than the Worker's global fallback.
      setCloudflareBindings(undefined)
      return app.fetch(request)
    },
  }),
}))
vi.mock('#content/manifest', () => ({
  checksums: { docsUnhead: 'current-checksum' },
}))
vi.mock('#unhead-content-query-original', () => ({
  default: async () => [
    { path: '/docs/head' },
  ],
}))
vi.mock('nuxt/server', () => ({
  useRuntimeConfig: () => ({ checkinDeployment: 'runtime-regression' }),
}))

const app = new H3()
app.post('/api/feedback', feedbackHandler)
app.post('/api/feedback-thumbs', thumbsHandler)
app.post('/api/tools/track', trackHandler)
app.get('/api/tools/fetch-head', fetchHeadHandler)
app.post('/__nuxt_content/docsUnhead/query', queryHandler)

function executionContext() {
  const pending: Promise<unknown>[] = []
  return {
    context: {
      waitUntil: (promise: Promise<unknown>) => pending.push(promise),
    } as unknown as ExecutionContext,
    settle: () => Promise.all(pending),
  }
}

function feedbackDatabase() {
  const sqlite = new DatabaseSync(':memory:')
  sqlite.exec(`CREATE TABLE feedback (
    id TEXT PRIMARY KEY, path TEXT NOT NULL, thumb TEXT, comment TEXT,
    metadata TEXT, user_id TEXT, session_id TEXT, created_at INTEGER
  )`)
  sqlite.exec(`CREATE TABLE tool_lookups (
    id TEXT PRIMARY KEY, user_id TEXT, session_id TEXT, tool TEXT NOT NULL,
    action TEXT NOT NULL, label TEXT, created_at INTEGER
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
  return {
    sqlite,
    binding,
    attempts: () => attempts,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('pages request runtime', () => {
  it.each([
    [
      '/api/feedback',
      { comment: 'Useful documentation' },
    ],
    [
      '/api/feedback-thumbs',
      { thumbs: 'up' },
    ],
    [
      '/api/tools/track',
      { tool: 'capo-analyzer', action: 'use' },
    ],
    ['/api/tools/fetch-head?url=https://example.com', undefined],
  ])('rejects rate-limited Pages requests before downstream work: %s', async (path, body) => {
    const fixture = feedbackDatabase()
    const limit = vi.fn(async () => ({ success: false }))
    const writeDataPoint = vi.fn()
    const fetcher = vi.fn(async () => new Response('<head><title>Fixture</title></head>', {
      headers: { 'content-type': 'text/html' },
    }))
    vi.stubGlobal('fetch', fetcher)
    const context = executionContext()
    try {
      const response = await worker.fetch(new Request(`https://unhead.unjs.io${path}`, {
        method: body ? 'POST' : 'GET',
        headers: { 'content-type': 'application/json', 'cf-connecting-ip': '192.0.2.1' },
        body: body
          ? JSON.stringify(body)
          : undefined,
      }), {
        DB: fixture.binding,
        RL_FREE_TOOLS: { limit },
        TOOL_ANALYTICS: { writeDataPoint },
      } as unknown as Cloudflare.Env, context.context)

      expect(response.status).toBe(429)
      expect(limit).toHaveBeenCalledWith({ key: 'ip:192.0.2.1' })
      await context.settle()
      expect(fixture.attempts()).toBe(0)
      expect(writeDataPoint).not.toHaveBeenCalled()
      expect(fetcher).not.toHaveBeenCalled()
    }
    finally {
      await context.settle()
      fixture.sqlite.close()
    }
  })

  it('keeps legacy context rate limits and analytics writes', async () => {
    const event = mockEvent('https://unhead.unjs.io/api/tools/track')
    const limit = vi.fn(async () => ({ success: false }))
    const writeDataPoint = vi.fn()
    event.context.cloudflare = {
      env: {
        RL_FREE_TOOLS: { limit },
        TOOL_ANALYTICS: { writeDataPoint },
      },
    }

    await expect(checkFreeToolRateLimit(event)).rejects.toMatchObject({ status: 429 })
    trackToolUsage(event, 'capo-analyzer', 'copy', { error: true }, 'legacy-session')
    expect(writeDataPoint).toHaveBeenCalledExactlyOnceWith({
      blobs: [
        'tool',
        'capo-analyzer',
        'copy',
        'legacy-session',
        'error',
        '',
      ],
      doubles: [
        expect.any(Number),
        0,
      ],
      indexes: ['legacy-s'],
    })
  })

  it.each(['success', 'error'])('writes tool action and %s outcome through the Pages Worker', async (outcome) => {
    const fixture = feedbackDatabase()
    const context = executionContext()
    const writeDataPoint = vi.fn()
    try {
      const response = await worker.fetch(new Request('https://unhead.unjs.io/api/tools/track', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'cookie': 'analytics-session=fixture-session' },
        body: JSON.stringify({
          tool: 'capo-analyzer',
          action: 'use',
          outcome,
          label: 'fixture',
        }),
      }), {
        DB: fixture.binding,
        TOOL_ANALYTICS: { writeDataPoint },
      } as unknown as Cloudflare.Env, context.context)

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ ok: true })
      expect(writeDataPoint).toHaveBeenCalledExactlyOnceWith({
        blobs: [
          'tool',
          'capo-analyzer',
          'use',
          'fixture-session',
          outcome,
          'fixture',
        ],
        doubles: [
          expect.any(Number),
          0,
        ],
        indexes: ['fixture-'],
      })
      await context.settle()
      expect(fixture.sqlite.prepare('SELECT tool, action, label FROM tool_lookups').all()).toEqual([
        { tool: 'capo-analyzer', action: 'use', label: 'fixture' },
      ])
    }
    finally {
      await context.settle()
      fixture.sqlite.close()
    }
  })

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

      const event = mockEvent(Object.assign(new Request('https://unhead.unjs.io/admin'), {
        runtime: {
          name: 'cloudflare',
          cloudflare: {
            env: { DB: fixture.binding },
            context: context.context,
          },
        },
      }))
      const rows = await getDB(event).select({ comment: feedback.comment }).from(feedback).all()
      expect(rows).toEqual([
        { comment: 'Useful documentation' },
      ])
    }
    finally {
      fixture.sqlite.close()
    }
  })

  it('keeps the legacy event context D1 fallback', async () => {
    const fixture = feedbackDatabase()
    try {
      const event = mockEvent('https://unhead.unjs.io/admin')
      event.context.cloudflare = {
        env: { DB: fixture.binding },
      }
      expect(await getDB(event).select().from(feedback).all()).toEqual([])
    }
    finally {
      fixture.sqlite.close()
    }
  })

  it('returns a 200 MISS then a HIT after the registered cache write settles', async () => {
    const entries = new Map<string, Response>()
    vi.stubGlobal('caches', {
      open: async () => ({
        match: async (key: Request) => entries.get(key.url)?.clone(),
        put: async (key: Request, response: Response) => { entries.set(key.url, response.clone()) },
      }),
    })
    const context = executionContext()
    const dispatch = () => worker.fetch(new Request('https://unhead.unjs.io/__nuxt_content/docsUnhead/query?v=current-checksum', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sql: 'SELECT * FROM docsUnhead' }),
    }), {} as Cloudflare.Env, context.context)

    const miss = await dispatch()
    expect(miss.status).toBe(200)
    expect(miss.headers.get('x-unhead-cache')).toBe('MISS')
    expect(await miss.json()).toEqual([
      { path: '/docs/head' },
    ])
    await context.settle()
    const hit = await dispatch()
    expect(hit.status).toBe(200)
    expect(hit.headers.get('x-unhead-cache')).toBe('HIT')
    expect(await hit.json()).toEqual([
      { path: '/docs/head' },
    ])

    for (const response of entries.values())
      response.headers.set('x-unhead-cache-created-at', String(Date.now() - 25 * 60 * 60 * 1000))
    const stale = await dispatch()
    expect(stale.status).toBe(200)
    expect(stale.headers.get('x-unhead-cache')).toBe('STALE')
    expect(await stale.json()).toEqual([
      { path: '/docs/head' },
    ])
    await context.settle()
    expect((await dispatch()).headers.get('x-unhead-cache')).toBe('HIT')
  })
})
