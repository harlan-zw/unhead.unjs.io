/// <reference types="@cloudflare/workers-types" />

export const CLOUDFLARE_RESPONSE_CACHE_NAME = 'unhead:responses:v1'

const CACHE_CREATED_AT_HEADER = 'x-unhead-cache-created-at'
const CACHE_CONTROL_PRESENT_HEADER = 'x-unhead-cache-control-present'
const CACHE_CONTROL_VALUE_HEADER = 'x-unhead-cache-control-value'
const CACHE_STATUS_HEADER = 'x-unhead-cache'

export interface CloudflareResponseCacheRule {
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
  { matches: path => path === '/api/_mdc/highlight', maxAge: minute, staleMaxAge: day },
  { matches: path => path.startsWith('/__nuxt_content/'), maxAge: minute, staleMaxAge: day },
  { matches: path => path === '/api/_nuxt_icon', maxAge: 7 * day, staleMaxAge: 7 * day },

  // Public data endpoints.
  { matches: path => /^\/api\/npm\/[^/]+\/downloads$/.test(path), maxAge: day, staleMaxAge: 7 * day },
  { matches: path => /^\/api\/get-tweet\/[^/]+$/.test(path), maxAge: day, staleMaxAge: 7 * day },
  { matches: path => path === '/api/stats.json', maxAge: day, staleMaxAge: 7 * day },
  { matches: path => path === '/api/github/sponsors.json', maxAge: day, staleMaxAge: 7 * day },
  { matches: path => /^\/api\/github\/[^/]+\/commit-count$/.test(path), maxAge: 7 * day, staleMaxAge: 7 * day },
  { matches: path => /^\/api\/github\/[^/]+\/contributors$/.test(path), maxAge: hour, staleMaxAge: day },
  { matches: path => /^\/api\/github\/[^/]+\/issues-closed$/.test(path), maxAge: 7 * day, staleMaxAge: 7 * day },
  { matches: path => /^\/api\/github\/[^/]+\/last-file-commit$/.test(path), maxAge: day, staleMaxAge: 7 * day },
  { matches: path => /^\/api\/github\/[^/]+\/releases$/.test(path), maxAge: hour, staleMaxAge: day },
  { matches: path => /^\/api\/github\/[^/]+\/stars$/.test(path), maxAge: hour, staleMaxAge: day },

  // Public SSR pages. Authenticated requests bypass the shared cache below.
  { matches: path => path === '/', maxAge: minute, staleMaxAge: day },
  { matches: path => path === '/docs' || path.startsWith('/docs/'), maxAge: minute, staleMaxAge: day },
  { matches: path => path === '/learn' || path.startsWith('/learn/'), maxAge: minute, staleMaxAge: day },
  { matches: path => path === '/tools/meta-tag-generator', maxAge: minute, staleMaxAge: day },
  { matches: path => path === '/tools/schema-generator', maxAge: minute, staleMaxAge: day },
]

export function getCloudflareResponseCacheRule(pathname: string): CloudflareResponseCacheRule | undefined {
  return routeCacheRules.find(rule => rule.matches(pathname))
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

  const cacheKey = new Request(request.url, { method: 'GET' })
  let cachedResponse: Response | undefined

  try {
    cachedResponse = await cache.match(cacheKey)
  }
  catch (error) {
    logCacheError('match', request, error)
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
          .catch(error => logCacheError('revalidate', request, error)),
      )
      return restoreClientResponse(cachedResponse, 'STALE')
    }
  }

  const response = await render()
  if (isCacheableResponse(response)) {
    context.waitUntil(
      storeResponse(cache, cacheKey, response.clone(), rule, now)
        .catch(error => logCacheError('put', request, error)),
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
  const headers = new Headers(response.headers)
  headers.set(CACHE_STATUS_HEADER, status)
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}

function logCacheError(operation: string, request: Request, error: unknown) {
  console.warn(JSON.stringify({
    message: 'Cloudflare response cache operation failed',
    operation,
    path: new URL(request.url).pathname,
    error: error instanceof Error ? error.message : String(error),
  }))
}
