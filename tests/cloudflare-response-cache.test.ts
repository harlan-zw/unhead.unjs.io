import type { CloudflareResponseCacheRule } from '../server/utils/cloudflare-response-cache'
import { describe, expect, it, vi } from 'vitest'
import {
  getCloudflareResponseCacheRule,
  handleCloudflareResponseCache,
  shouldBypassCloudflareResponseCache,
} from '../server/utils/cloudflare-response-cache'

const rule: CloudflareResponseCacheRule = {
  maxAge: 60,
  staleMaxAge: 300,
}

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
})
