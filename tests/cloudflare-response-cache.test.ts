import type { CloudflareResponseCacheRule } from '../server/utils/cloudflare-response-cache'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getCloudflareResponseCacheRule,
  handleCloudflareResponseCache,
  shouldBypassCloudflareResponseCache,
} from '../server/utils/cloudflare-response-cache'

const rule: CloudflareResponseCacheRule = {
  kind: 'page',
  maxAge: 60,
  staleMaxAge: 300,
}

afterEach(() => vi.restoreAllMocks())

function mockCache() {
  const entries = new Map<string, Response>()
  const keyFor = (request: RequestInfo | URL) => request instanceof Request ? request.url : String(request)
  return {
    entries,
    cache: {
      match: vi.fn(async (request: RequestInfo | URL) => entries.get(keyFor(request))?.clone()),
      put: vi.fn(async (request: RequestInfo | URL, response: Response) => {
        entries.set(keyFor(request), response.clone())
      }),
    },
  }
}

function mockContext() {
  const promises: Promise<unknown>[] = []
  return {
    context: {
      waitUntil(promise: Promise<unknown>) {
        promises.push(promise)
      },
    },
    async settle() {
      await Promise.all(promises)
    },
  }
}

describe('cloudflare response cache', () => {
  it.each(['MISS', 'HIT', 'STALE'])('preserves a nested query cache %s when POST bypasses the response cache', async (status) => {
    const { cache } = mockCache()
    const { context } = mockContext()
    const request = new Request('https://unhead.unjs.io/__nuxt_content/docsUnhead/query', { method: 'POST' })
    const render = async () => new Response('[{"path":"/docs/head"}]', {
      headers: { 'x-unhead-cache': status, 'content-type': 'application/json' },
    })

    const response = await handleCloudflareResponseCache({ cache, context, render, request, rule })

    expect(response.headers.get('x-unhead-cache')).toBe(status)
    expect(await response.json()).toEqual([{ path: '/docs/head' }])
    expect(cache.match).not.toHaveBeenCalled()
    expect(cache.put).not.toHaveBeenCalled()
  })

  it('matches only the intended public routes', () => {
    expect(getCloudflareResponseCacheRule('/docs/getting-started')).toMatchObject({ maxAge: 60 })
    expect(getCloudflareResponseCacheRule('/api/github/unjs@unhead/stars')).toMatchObject({ maxAge: 3600 })
    expect(getCloudflareResponseCacheRule('/api/admin/tool-analytics')).toBeUndefined()
    expect(getCloudflareResponseCacheRule('/tools/og-image-generator')).toBeUndefined()
  })

  it('bypasses shared caching for authenticated and cookie-bearing requests', () => {
    expect(shouldBypassCloudflareResponseCache(new Request('https://unhead.unjs.io/docs'))).toBe(false)
    expect(shouldBypassCloudflareResponseCache(new Request('https://unhead.unjs.io/docs', {
      headers: { cookie: 'session=private' },
    }))).toBe(true)
    expect(shouldBypassCloudflareResponseCache(new Request('https://unhead.unjs.io/docs', {
      headers: { authorization: 'Bearer secret' },
    }))).toBe(true)
  })

  it('fills the cache in waitUntil and restores the original cache-control header', async () => {
    const { cache } = mockCache()
    const { context, settle } = mockContext()
    const render = vi.fn(async () => new Response('fresh', {
      headers: { 'cache-control': 'public, s-maxage=60' },
    }))
    const request = new Request('https://unhead.unjs.io/docs/cache')

    const miss = await handleCloudflareResponseCache({ cache, context, render, request, rule, now: () => 1_000 })
    expect(miss.headers.get('x-unhead-cache')).toBe('MISS')
    await settle()

    const hit = await handleCloudflareResponseCache({ cache, context, render, request, rule, now: () => 30_000 })
    expect(hit.headers.get('x-unhead-cache')).toBe('HIT')
    expect(hit.headers.get('cache-control')).toBe('public, s-maxage=60')
    expect(await hit.text()).toBe('fresh')
    expect(render).toHaveBeenCalledTimes(1)
  })

  it('serves stale content while revalidating in waitUntil', async () => {
    const { cache } = mockCache()
    const firstContext = mockContext()
    const render = vi.fn()
      .mockResolvedValueOnce(new Response('stale'))
      .mockResolvedValueOnce(new Response('refreshed'))
    const request = new Request('https://unhead.unjs.io/docs/cache')

    await handleCloudflareResponseCache({ cache, context: firstContext.context, render, request, rule, now: () => 1_000 })
    await firstContext.settle()

    const staleContext = mockContext()
    const stale = await handleCloudflareResponseCache({
      cache,
      context: staleContext.context,
      render,
      request,
      rule,
      now: () => 62_000,
    })
    expect(stale.headers.get('x-unhead-cache')).toBe('STALE')
    expect(await stale.text()).toBe('stale')

    await staleContext.settle()
    const hit = await handleCloudflareResponseCache({ cache, context: mockContext().context, render, request, rule, now: () => 63_000 })
    expect(hit.headers.get('x-unhead-cache')).toBe('HIT')
    expect(await hit.text()).toBe('refreshed')
  })

  it('does not cache private or cookie-setting responses', async () => {
    const { cache } = mockCache()
    const privateContext = mockContext()
    const request = new Request('https://unhead.unjs.io/docs/private')

    await handleCloudflareResponseCache({
      cache,
      context: privateContext.context,
      render: async () => new Response('private', { headers: { 'cache-control': 'private' } }),
      request,
      rule,
    })
    await privateContext.settle()
    expect(cache.put).not.toHaveBeenCalled()

    await handleCloudflareResponseCache({
      cache,
      context: mockContext().context,
      render: async () => new Response('cookie', { headers: { 'set-cookie': 'session=secret' } }),
      request,
      rule,
    })
    expect(cache.put).not.toHaveBeenCalled()
  })

  it('logs cache failures without exposing the request or error', async () => {
    const { cache } = mockCache()
    const output = vi.spyOn(console, 'log').mockImplementation(() => {})
    cache.match.mockRejectedValueOnce(new Error('secret cache detail'))

    const response = await handleCloudflareResponseCache({
      cache,
      context: mockContext().context,
      render: async () => new Response('fresh'),
      request: new Request('https://unhead.unjs.io/docs/private-path'),
      rule,
    })

    expect(await response.text()).toBe('fresh')
    const record = JSON.parse(String(output.mock.calls[0]?.[0]))
    expect(record).toMatchObject({
      'cache.kind': 'response',
      'cache.operation': 'match',
      'cache.outcome': 'failed',
      'level': 'warn',
    })
    expect(JSON.stringify(record)).not.toContain('private-path')
    expect(JSON.stringify(record)).not.toContain('secret cache detail')
  })

  describe('markdown negotiation', () => {
    const GPTBOT = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.3; +https://openai.com/gptbot)'
    const page = (accept: string, headers: Record<string, string> = {}) => new Request('https://unhead.unjs.io/docs/head/api/use-head', {
      headers: { accept, ...headers },
    })
    const renderHtml = async () => new Response('<!doctype html>', { headers: { 'content-type': 'text/html;charset=utf-8' } })
    const renderMarkdown = async () => new Response('# useHead', { headers: { 'content-type': 'text/markdown;charset=utf-8' } })

    it('never answers a Markdown request with the cached HTML page', async () => {
      const { cache } = mockCache()
      const browser = mockContext()
      await handleCloudflareResponseCache({ cache, context: browser.context, render: renderHtml, request: page('text/html,application/xhtml+xml,*/*;q=0.8'), rule })
      await browser.settle()

      for (const accept of ['text/markdown', 'text/markdown, text/html;q=0.9, */*;q=0.8']) {
        const agent = mockContext()
        const response = await handleCloudflareResponseCache({ cache, context: agent.context, render: renderMarkdown, request: page(accept), rule })
        await agent.settle()
        expect(await response.text()).toBe('# useHead')
      }
    })

    it('never answers a browser with a Markdown body cached for an agent', async () => {
      const { cache } = mockCache()
      const agent = mockContext()
      await handleCloudflareResponseCache({ cache, context: agent.context, render: renderMarkdown, request: page('text/markdown'), rule })
      await agent.settle()

      const browser = await handleCloudflareResponseCache({ cache, context: mockContext().context, render: renderHtml, request: page('text/html'), rule })
      expect(browser.headers.get('x-unhead-cache')).toBe('MISS')
      expect(await browser.text()).toBe('<!doctype html>')

      const nextAgent = await handleCloudflareResponseCache({ cache, context: mockContext().context, render: renderHtml, request: page('text/markdown'), rule })
      expect(nextAgent.headers.get('x-unhead-cache')).toBe('HIT')
      expect(await nextAgent.text()).toBe('# useHead')
    })

    it('shares the HTML entry with a crawler whose Accept header takes anything', async () => {
      // AI Ready 3 negotiates from the Accept header alone, so GPTBot sending
      // `Accept: */*` receives the same HTML page as a browser.
      const { cache } = mockCache()
      const browser = mockContext()
      const render = vi.fn(renderHtml)
      await handleCloudflareResponseCache({ cache, context: browser.context, render, request: page('text/html'), rule })
      await browser.settle()

      const crawler = await handleCloudflareResponseCache({ cache, context: mockContext().context, render, request: page('*/*', { 'user-agent': GPTBOT }), rule })
      expect(crawler.headers.get('x-unhead-cache')).toBe('HIT')
      expect(render).toHaveBeenCalledTimes(1)
    })

    it('keys data routes on the URL alone, whatever the Accept header', async () => {
      const { cache } = mockCache()
      const first = mockContext()
      const render = vi.fn(async () => new Response('{"stars":1}', { headers: { 'content-type': 'application/json' } }))
      const data = (accept: string) => new Request('https://unhead.unjs.io/api/github/unjs@unhead/stars', { headers: { accept } })
      const dataRule: CloudflareResponseCacheRule = { kind: 'data', maxAge: 60, staleMaxAge: 300 }

      await handleCloudflareResponseCache({ cache, context: first.context, render, request: data('application/json'), rule: dataRule })
      await first.settle()
      const hit = await handleCloudflareResponseCache({ cache, context: mockContext().context, render, request: data('text/markdown'), rule: dataRule })

      expect(hit.headers.get('x-unhead-cache')).toBe('HIT')
      expect(render).toHaveBeenCalledTimes(1)
    })
  })
})
