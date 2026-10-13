/// <reference types="@cloudflare/workers-types" />

import { createWideEvent } from '@harlan-zw/nuxt-wide-events/standalone'
import { negotiateContent } from '@mdream/js/negotiate'

// v3 keys pages on their negotiated representation. v2 entries were keyed on
// the URL alone, so they could hand cached HTML to a Markdown request, and they
// hold OG image URLs signed with the OG Image v6 key. Renaming the cache drops
// them all at once.
export const CLOUDFLARE_RESPONSE_CACHE_NAME = 'unhead:responses:v3'

const CACHE_CREATED_AT_HEADER = 'x-unhead-cache-created-at'
const CACHE_CONTROL_PRESENT_HEADER = 'x-unhead-cache-control-present'
const CACHE_CONTROL_VALUE_HEADER = 'x-unhead-cache-control-value'
const CACHE_STATUS_HEADER = 'x-unhead-cache'

export interface CloudflareResponseCacheRule {
  /**
   * A `page` runs AI Ready's Markdown negotiation, so one URL answers HTML or
   * Markdown depending on the request. A `data` route has one representation.
   */
  kind: 'page' | 'data'
  maxAge: number
  staleMaxAge: number
}

interface CloudflareResponseCacheOptions {
  cache: Pick<Cache, 'match' | 'put'>
  context: Pick<ExecutionContext, 'waitUntil'>
  now?: () => number
  render: () => Promise<Response>
  request: Request
  rule: CloudflareResponseCacheRule
}

interface RouteCacheRule extends CloudflareResponseCacheRule {
  matches: (pathname: string) => boolean
}

const minute = 60
const hour = 60 * minute
const day = 24 * hour

const routeCacheRules: RouteCacheRule[] = [
  // Framework-generated data endpoints.
  { kind: 'data', matches: path => path === '/api/_mdc/highlight', maxAge: minute, staleMaxAge: day },
  { kind: 'data', matches: path => path.startsWith('/__nuxt_content/'), maxAge: minute, staleMaxAge: day },
  { kind: 'data', matches: path => path === '/api/_nuxt_icon', maxAge: 7 * day, staleMaxAge: 7 * day },

  // Public data endpoints.
  { kind: 'data', matches: path => /^\/api\/npm\/[^/]+\/downloads$/.test(path), maxAge: day, staleMaxAge: 7 * day },
  { kind: 'data', matches: path => /^\/api\/get-tweet\/[^/]+$/.test(path), maxAge: day, staleMaxAge: 7 * day },
  { kind: 'data', matches: path => path === '/api/stats.json', maxAge: day, staleMaxAge: 7 * day },
  { kind: 'data', matches: path => /^\/api\/github\/[^/]+\/commit-count$/.test(path), maxAge: 7 * day, staleMaxAge: 7 * day },
  { kind: 'data', matches: path => /^\/api\/github\/[^/]+\/contributors$/.test(path), maxAge: hour, staleMaxAge: day },
  { kind: 'data', matches: path => /^\/api\/github\/[^/]+\/issues-closed$/.test(path), maxAge: 7 * day, staleMaxAge: 7 * day },
  { kind: 'data', matches: path => /^\/api\/github\/[^/]+\/last-file-commit$/.test(path), maxAge: day, staleMaxAge: 7 * day },
  { kind: 'data', matches: path => /^\/api\/github\/[^/]+\/releases$/.test(path), maxAge: hour, staleMaxAge: day },
  { kind: 'data', matches: path => /^\/api\/github\/[^/]+\/stars$/.test(path), maxAge: hour, staleMaxAge: day },

  // Public SSR pages. Authenticated requests bypass the shared cache below.
  { kind: 'page', matches: path => path === '/', maxAge: minute, staleMaxAge: day },
  { kind: 'page', matches: path => path === '/docs' || path.startsWith('/docs/'), maxAge: minute, staleMaxAge: day },
  { kind: 'page', matches: path => path === '/learn' || path.startsWith('/learn/'), maxAge: minute, staleMaxAge: day },
  { kind: 'page', matches: path => path === '/tools/meta-tag-generator', maxAge: minute, staleMaxAge: day },
  { kind: 'page', matches: path => path === '/tools/schema-generator', maxAge: minute, staleMaxAge: day },
]

export function getCloudflareResponseCacheRule(pathname: string): CloudflareResponseCacheRule | undefined {
  return routeCacheRules.find(rule => rule.matches(pathname))
}

const REPRESENTATION_KEY_PARAM = '__unhead_representation'

/**
 * The cache key for a request. The Cache API ignores `Vary`, so a page that
 * negotiates Markdown carries its representation in the key. The decision is
 * AI Ready's own: it negotiates with `negotiateContent()` on the Accept header
 * alone while `aiReady.botNegotiation` is off. Turning bot negotiation on
 * would make the User-Agent an input too, and this key would need it.
 */
export function getCloudflareResponseCacheKey(request: Request, rule: Pick<CloudflareResponseCacheRule, 'kind'>): Request {
  const url = new URL(request.url)
  if (rule.kind === 'page' && !url.pathname.endsWith('.md')) {
    const representation = negotiateContent(request.headers.get('accept') ?? undefined)
    if (representation !== 'html')
      url.searchParams.set(REPRESENTATION_KEY_PARAM, representation)
  }
  return new Request(url, { method: 'GET' })
}

export function shouldBypassCloudflareResponseCache(request: Request): boolean {
  if (request.method !== 'GET')
    return true

  if (request.headers.has('authorization') || request.headers.has('cookie'))
    return true

  const cacheControl = request.headers.get('cache-control') || ''
  return /(?:^|,)\s*(?:no-cache|no-store)\b/i.test(cacheControl)
}

export async function handleCloudflareResponseCache(options: CloudflareResponseCacheOptions): Promise<Response> {
  const {
    cache,
    context,
    now = Date.now,
    render,
    request,
    rule,
  } = options

  if (shouldBypassCloudflareResponseCache(request))
    return withCacheStatus(await render(), 'BYPASS')

  const cacheKey = getCloudflareResponseCacheKey(request, rule)
  let cachedResponse: Response | undefined

  try {
    cachedResponse = await cache.match(cacheKey)
  }
  catch {
    logCacheError('match')
    return withCacheStatus(await render(), 'BYPASS')
  }

  if (cachedResponse) {
    const createdAt = Number(cachedResponse.headers.get(CACHE_CREATED_AT_HEADER))
    const age = Number.isFinite(createdAt)
      ? Math.max(0, (now() - createdAt) / 1000)
      : Number.POSITIVE_INFINITY

    if (age <= rule.maxAge)
      return restoreClientResponse(cachedResponse, 'HIT')

    if (age <= rule.maxAge + rule.staleMaxAge) {
      context.waitUntil(
        renderAndStore(cache, cacheKey, render, rule, now)
          .catch(() => logCacheError('revalidate')),
      )
      return restoreClientResponse(cachedResponse, 'STALE')
    }
  }

  const response = await render()
  if (isCacheableResponse(response)) {
    context.waitUntil(
      storeResponse(cache, cacheKey, response.clone(), rule, now)
        .catch(() => logCacheError('put')),
    )
  }

  return withCacheStatus(response, 'MISS')
}

async function renderAndStore(
  cache: Pick<Cache, 'put'>,
  cacheKey: Request,
  render: () => Promise<Response>,
  rule: CloudflareResponseCacheRule,
  now: () => number,
) {
  const response = await render()
  if (isCacheableResponse(response))
    await storeResponse(cache, cacheKey, response, rule, now)
}

async function storeResponse(
  cache: Pick<Cache, 'put'>,
  cacheKey: Request,
  response: Response,
  rule: CloudflareResponseCacheRule,
  now: () => number,
) {
  const headers = new Headers(response.headers)
  const cacheControl = headers.get('cache-control')

  headers.set(CACHE_CREATED_AT_HEADER, String(now()))
  headers.set(CACHE_CONTROL_PRESENT_HEADER, cacheControl === null ? '0' : '1')
  headers.set(CACHE_CONTROL_VALUE_HEADER, cacheControl || '')
  headers.set('cache-control', `public, max-age=${rule.maxAge + rule.staleMaxAge}`)
  headers.delete(CACHE_STATUS_HEADER)

  await cache.put(cacheKey, new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  }))
}

function isCacheableResponse(response: Response): boolean {
  if (response.status !== 200 || response.headers.has('set-cookie'))
    return false

  const cacheControl = response.headers.get('cache-control') || ''
  if (/(?:^|,)\s*(?:no-cache|no-store|private)\b/i.test(cacheControl))
    return false

  return response.headers.get('vary') !== '*'
}

function restoreClientResponse(response: Response, status: 'HIT' | 'STALE'): Response {
  const headers = new Headers(response.headers)
  const hadCacheControl = headers.get(CACHE_CONTROL_PRESENT_HEADER) === '1'
  const cacheControl = headers.get(CACHE_CONTROL_VALUE_HEADER) || ''

  headers.delete(CACHE_CREATED_AT_HEADER)
  headers.delete(CACHE_CONTROL_PRESENT_HEADER)
  headers.delete(CACHE_CONTROL_VALUE_HEADER)
  if (hadCacheControl)
    headers.set('cache-control', cacheControl)
  else
    headers.delete('cache-control')
  headers.set(CACHE_STATUS_HEADER, status)

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}

function withCacheStatus(response: Response, status: 'BYPASS' | 'MISS'): Response {
  // POST queries can use Nitro's content cache while bypassing this GET cache.
  if (status === 'BYPASS' && response.headers.has(CACHE_STATUS_HEADER))
    return response

  const headers = new Headers(response.headers)
  headers.set(CACHE_STATUS_HEADER, status)
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}

function logCacheError(operation: string) {
  const event = createWideEvent({
    'cache.kind': 'response',
    'cache.operation': operation,
    'cache.outcome': 'failed',
  })
  event.setLevel('warn')
  event.emit()
}
