import type { H3Event } from 'h3'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ContentQueryCacheAdapter, ContentQueryCacheHandlerOptions } from '../server/utils/content-query-cache'
import { EventEmitter } from 'node:events'
import { createEvent } from 'h3'
import { resolve } from 'pathe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createCachedContentQueryHandler } from '../server/utils/content-query-cache'

const ORIGINAL_QUERY_HANDLER = '/abs/node_modules/@nuxt/content/dist/runtime/api/query.post.js'
const COLLECTION = 'docsUnhead'
const CHECKSUM = 'checksum-a'
const DEPLOYMENT = 'deploy-1'
const QUERY_ROUTE = `/__nuxt_content/${COLLECTION}/query`
const SQL = 'SELECT * FROM docsUnhead'

function createQueryEvent(options: {
  method?: string
  path?: string
  body?: string
  headers?: Record<string, string>
} = {}): H3Event {
  const {
    method = 'POST',
    path = `${QUERY_ROUTE}?v=${CHECKSUM}`,
    body = JSON.stringify({ sql: SQL }),
    headers = {},
  } = options

  const req = new EventEmitter() as unknown as IncomingMessage
  req.method = method
  req.url = path
  req.headers = {
    'host': 'unhead.unjs.io',
    'content-type': 'application/json',
    ...headers,
  }
  if (body !== undefined)
    req.headers['content-length'] = String(Buffer.byteLength(body))

  const event = createEvent(req, {} as ServerResponse)
  if (body !== undefined) {
    queueMicrotask(() => {
      req.emit('data', Buffer.from(body))
      req.emit('end')
    })
  }
  return event
}

function mockCache(): { entries: Map<string, Response>, cache: ContentQueryCacheAdapter & { match: ReturnType<typeof vi.fn>, put: ReturnType<typeof vi.fn> } } {
  const entries = new Map<string, Response>()
  const keyFor = (request: RequestInfo | URL) => request instanceof Request ? request.url : String(request)
  const cache = {
    match: vi.fn(async (request: RequestInfo | URL) => entries.get(keyFor(request))?.clone()),
    put: vi.fn(async (request: RequestInfo | URL, response: Response) => {
      entries.set(keyFor(request), response.clone())
    }),
  }
  return { entries, cache }
}

function createHarness(overrides: Partial<ContentQueryCacheHandlerOptions> = {}) {
  const { cache } = mockCache()
  const waitUntilPromises: Promise<unknown>[] = []
  const clock = { now: 1_000 }
  const options: ContentQueryCacheHandlerOptions = {
    original: vi.fn(async () => [{ path: '/docs/head' }]),
    resolveChecksum: () => CHECKSUM,
    resolveDeployment: () => DEPLOYMENT,
    openCache: async () => cache,
    waitUntil: (_event, promise) => waitUntilPromises.push(promise),
    now: () => clock.now,
    ...overrides,
  }
  return {
    cache,
    handler: createCachedContentQueryHandler(options),
    options,
    async settle() {
      await Promise.all(waitUntilPromises)
    },
    travelTo(elapsedMs: number) {
      clock.now = 1_000 + elapsedMs
    },
  }
}

afterEach(() => vi.restoreAllMocks())

describe('content query cache', () => {
  it('stores a cold miss and serves fresh hits without querying again', async () => {
    const { cache, handler, options } = createHarness()

    const miss = await handler(createQueryEvent())
    expect(options.original).toHaveBeenCalledOnce()
    expect(miss.headers.get('x-unhead-cache')).toBe('MISS')
    expect(miss.headers.get('content-type')).toBe('application/json')
    expect(await miss.text()).toBe('[{"path":"/docs/head"}]')
    expect(cache.put).toHaveBeenCalledOnce()

    const stored = cache.put.mock.calls[0]![0] as Request
    expect(stored.method).toBe('GET')
    expect(stored.url).toContain(`/${COLLECTION}/`)
    expect(stored.url).toContain(CHECKSUM)
    expect(stored.url).toContain(DEPLOYMENT)
    expect(new URL(stored.url).searchParams.get('origin')).toBe('http://unhead.unjs.io')

    const hit = await handler(createQueryEvent())
    expect(options.original).toHaveBeenCalledOnce()
    expect(hit.headers.get('x-unhead-cache')).toBe('HIT')
    expect(hit.headers.get('x-unhead-cache-created-at')).toBeNull()
    expect(hit.headers.get('cache-control')).toBeNull()
    expect(await hit.text()).toBe('[{"path":"/docs/head"}]')
  })

  it('serves stale content while refreshing through waitUntil', async () => {
    let version = 0
    const harness = createHarness({
      original: vi.fn(async () => [{ path: '/docs/head', version: version++ }]),
    })
    const { cache, handler, options } = harness

    await handler(createQueryEvent())
    harness.travelTo(61_000)

    const stale = await handler(createQueryEvent())
    expect(options.original).toHaveBeenCalledTimes(2)
    expect(stale.headers.get('x-unhead-cache')).toBe('STALE')
    expect(await stale.text()).toBe('[{"path":"/docs/head","version":0}]')

    await harness.settle()
    expect(cache.put).toHaveBeenCalledTimes(2)

    harness.travelTo(62_000)
    const refreshed = await handler(createQueryEvent())
    expect(options.original).toHaveBeenCalledTimes(2)
    expect(refreshed.headers.get('x-unhead-cache')).toBe('HIT')
    expect(await refreshed.text()).toBe('[{"path":"/docs/head","version":1}]')
  })

  it('caches valid empty array results', async () => {
    const harness = createHarness({ original: async () => [] })
    const { handler } = harness

    await handler(createQueryEvent())
    await harness.settle()

    const hit = await handler(createQueryEvent())
    expect(hit.headers.get('x-unhead-cache')).toBe('HIT')
    expect(await hit.text()).toBe('[]')
  })

  it('preserves the original error contract and caches nothing on a cold failure', async () => {
    const failure = Object.assign(new Error('D1_ERROR: requests queued too long'), { statusCode: 500 })
    const original = vi.fn()
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce([{ path: '/docs/head' }])
    const { cache, handler } = createHarness({ original })

    await expect(handler(createQueryEvent())).rejects.toBe(failure)
    expect(cache.put).not.toHaveBeenCalled()

    const response = await handler(createQueryEvent())
    expect(original).toHaveBeenCalledTimes(2)
    expect(await response.text()).toBe('[{"path":"/docs/head"}]')
    expect(cache.put).toHaveBeenCalledOnce()
  })

  it('keeps serving the stale entry when refreshes fail', async () => {
    const output = vi.spyOn(console, 'log').mockImplementation(() => {})
    const failure = new Error('D1_ERROR: requests queued too long')
    const harness = createHarness({
      original: vi.fn()
        .mockResolvedValueOnce([{ path: '/docs/head', version: 0 }])
        .mockRejectedValueOnce(failure)
        .mockResolvedValueOnce([{ path: '/docs/head', version: 1 }]),
    })
    const { cache, handler } = harness

    await handler(createQueryEvent())
    await harness.settle()

    harness.travelTo(61_000)
    const stale = await handler(createQueryEvent())
    expect(stale.headers.get('x-unhead-cache')).toBe('STALE')
    await harness.settle()

    const record = JSON.parse(String(output.mock.calls.at(-1)![0]))
    expect(record).toMatchObject({
      'cache.kind': 'content-query',
      'cache.operation': 'refresh',
      'cache.outcome': 'failed',
    })

    harness.travelTo(62_000)
    const stillStale = await handler(createQueryEvent())
    expect(stillStale.headers.get('x-unhead-cache')).toBe('STALE')
    expect(await stillStale.text()).toBe('[{"path":"/docs/head","version":0}]')
    await harness.settle()
    expect(cache.put).toHaveBeenCalledTimes(2)

    const recovered = await handler(createQueryEvent())
    expect(recovered.headers.get('x-unhead-cache')).toBe('HIT')
    expect(await recovered.text()).toBe('[{"path":"/docs/head","version":1}]')
  })

  it.each([
    { name: 'a GET request', request: { method: 'GET' } },
    { name: 'a missing caller version', request: { path: QUERY_ROUTE } },
    { name: 'a mismatched caller version', request: { path: `${QUERY_ROUTE}?v=checksum-old` } },
    { name: 'a body without a single sql field', request: { body: JSON.stringify({ page: 1 }) } },
    { name: 'a body with extra fields', request: { body: JSON.stringify({ sql: SQL, version: 2 }) } },
    { name: 'an unparseable body', request: { body: 'not-json' } },
    { name: 'an oversized request body', request: { body: JSON.stringify({ sql: `SELECT ${'x'.repeat(64 * 1024)}` }) } },
    { name: 'a cookie-bearing request', request: { headers: { cookie: 'session=private' } } },
    { name: 'an authorized request', request: { headers: { authorization: 'Bearer secret' } } },
    { name: 'a range request', request: { headers: { range: 'bytes=0-1' } } },
    { name: 'a no-cache request', request: { headers: { 'cache-control': 'no-cache' } } },
  ])('bypasses caching for $name', async ({ request }) => {
    const { cache, handler, options } = createHarness()

    const response = await handler(createQueryEvent(request))
    expect(options.original).toHaveBeenCalledOnce()
    expect(response.headers.get('x-unhead-cache')).toBe('BYPASS')
    expect(await response.text()).toBe('[{"path":"/docs/head"}]')
    expect(cache.put).not.toHaveBeenCalled()
    expect(cache.match).not.toHaveBeenCalled()
  })

  it.each([
    { name: 'the content checksum is unavailable', overrides: { resolveChecksum: () => undefined } },
    { name: 'the deployment identity is unavailable', overrides: { resolveDeployment: () => '' } },
    { name: 'the cache is unavailable', overrides: { openCache: async () => undefined } },
  ])('bypasses caching when $name', async ({ overrides }) => {
    const { cache, handler, options } = createHarness(overrides)

    const response = await handler(createQueryEvent())
    expect(options.original).toHaveBeenCalledOnce()
    expect(response.headers.get('x-unhead-cache')).toBe('BYPASS')
    expect(await response.text()).toBe('[{"path":"/docs/head"}]')
    expect(cache.put).not.toHaveBeenCalled()
    expect(cache.match).not.toHaveBeenCalled()
  })

  it('delegates without caching when a result exceeds the size bound', async () => {
    const harness = createHarness({
      original: vi.fn(async () => [{ path: '/docs/head', body: 'x'.repeat(1024 * 1024) }]),
    })
    const { cache, handler, options } = harness

    const response = await handler(createQueryEvent())
    expect(options.original).toHaveBeenCalledOnce()
    expect(response.headers.get('x-unhead-cache')).toBe('MISS')
    expect(await response.text()).toContain('/docs/head')
    await harness.settle()
    expect(cache.put).not.toHaveBeenCalled()
  })

  it('delegates to the original handler when the cache read fails', async () => {
    const output = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { cache, handler, options } = createHarness()
    cache.match.mockRejectedValueOnce(new Error('cache unavailable'))

    const response = await handler(createQueryEvent())
    expect(options.original).toHaveBeenCalledOnce()
    expect(await response.text()).toBe('[{"path":"/docs/head"}]')
    expect(cache.put).not.toHaveBeenCalled()

    const record = JSON.parse(String(output.mock.calls.at(-1)![0]))
    expect(record).toMatchObject({
      'cache.kind': 'content-query',
      'cache.operation': 'match',
      'cache.outcome': 'failed',
    })
  })

  it('coalesces identical concurrent fills into one query', async () => {
    let resolveOriginal: (value: unknown) => void = () => {}
    const { cache, handler, options } = createHarness({
      original: vi.fn(() => new Promise((resolve) => {
        resolveOriginal = resolve
      })),
    })

    const first = handler(createQueryEvent())
    await vi.waitFor(() => expect(options.original).toHaveBeenCalledOnce())
    const second = handler(createQueryEvent())
    expect(options.original).toHaveBeenCalledOnce()

    resolveOriginal([{ path: '/docs/head' }])
    const [firstResponse, secondResponse] = await Promise.all([first, second])
    expect(await firstResponse.text()).toBe('[{"path":"/docs/head"}]')
    expect(await secondResponse.text()).toBe('[{"path":"/docs/head"}]')
    expect(firstResponse).not.toBe(secondResponse)
    expect(cache.put).toHaveBeenCalledOnce()
  })

  it('stops coalescing and caching once the fill bound is exhausted', async () => {
    const resolvers: ((value: unknown) => void)[] = []
    const { cache, handler, options } = createHarness({
      original: vi.fn(() => new Promise((resolve) => {
        resolvers.push(resolve)
      })),
    })

    const requests: Promise<Response>[] = []
    for (let index = 0; index < 100; index++)
      requests.push(handler(createQueryEvent({ body: JSON.stringify({ sql: `SELECT ${index}` }) })))
    await vi.waitFor(() => expect(options.original).toHaveBeenCalledTimes(100))

    const overflow = handler(createQueryEvent({ body: JSON.stringify({ sql: 'SELECT a distinct overflow query' }) }))
    await vi.waitFor(() => expect(options.original).toHaveBeenCalledTimes(101))

    for (let index = 0; index < 100; index++)
      resolvers[index]!([{ index }])
    resolvers[100]!([{ index: 0, source: 'overflow' }])

    const overflowResponse = await overflow
    expect(await overflowResponse.text()).toBe('[{"index":0,"source":"overflow"}]')
    await Promise.all(requests)
    expect(cache.put).toHaveBeenCalledTimes(100)
  })
})

describe('content query cache nitro wiring', () => {
  async function fireNitroConfigHooks(config: Record<string, unknown>) {
    const { default: nuxtConfig } = await import('../nuxt.config')
    const hooks: Record<string, ((...args: unknown[]) => unknown)[]> = {}
    const fakeNuxt = {
      hooks: {
        hook(name: string, fn: (...args: unknown[]) => unknown) {
          hooks[name] ||= []
          hooks[name].push(fn)
        },
      },
    }
    for (const module of nuxtConfig.modules ?? []) {
      if (typeof module === 'function')
        await module({}, fakeNuxt)
    }
    for (const hook of hooks['nitro:config'] ?? [])
      await hook(config)
    return hooks
  }

  function contentHandlers() {
    return [
      { route: '/__nuxt_content/docsUnhead/query', handler: ORIGINAL_QUERY_HANDLER },
      { route: '/__nuxt_content/docsUnheadV2/query', handler: ORIGINAL_QUERY_HANDLER },
      { route: '/__nuxt_content/snippets/query', handler: ORIGINAL_QUERY_HANDLER },
      { route: '/__nuxt_content/docsUnhead/sql_dump.txt', handler: '/abs/dump.js' },
    ]
  }

  it('wraps only the docs query routes and aliases the captured handler', async () => {
    const config: Record<string, unknown> = { handlers: contentHandlers() }
    await fireNitroConfigHooks(config)

    const handlers = config.handlers as { route: string, handler: string }[]
    expect(handlers.find(handler => handler.route === '/__nuxt_content/docsUnhead/query')!.handler)
      .toBe(resolveWrapperPath())
    expect(handlers.find(handler => handler.route === '/__nuxt_content/docsUnheadV2/query')!.handler)
      .toBe(resolveWrapperPath())
    expect(handlers.find(handler => handler.route === '/__nuxt_content/snippets/query')!.handler)
      .toBe(ORIGINAL_QUERY_HANDLER)
    expect(handlers.find(handler => handler.route === '/__nuxt_content/docsUnhead/sql_dump.txt')!.handler)
      .toBe('/abs/dump.js')
    expect((config.alias as Record<string, string>)['#unhead-content-query-original'])
      .toBe(ORIGINAL_QUERY_HANDLER)
  })

  it('fails the build when a docs query handler is missing', async () => {
    const config: Record<string, unknown> = {
      handlers: contentHandlers().filter(handler => handler.route !== '/__nuxt_content/docsUnheadV2/query'),
    }

    await expect(fireNitroConfigHooks(config)).rejects.toThrow('/__nuxt_content/docsUnheadV2/query')
  })

  it('fails the build when a docs query handler is ambiguous', async () => {
    const config: Record<string, unknown> = {
      handlers: [...contentHandlers(), ...contentHandlers()],
    }

    await expect(fireNitroConfigHooks(config)).rejects.toThrow('/__nuxt_content/docsUnhead/query')
  })
})

function resolveWrapperPath(): string {
  return resolve('./server/handlers/content-query-cache.ts')
}
