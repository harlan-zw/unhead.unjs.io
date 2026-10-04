import type { EventHandler, H3Event } from 'h3'
import { createWideEvent } from '@harlan-zw/nuxt-wide-events/standalone'
import { defineEventHandler, getRequestHeaders, getRequestURL, readRawBody } from 'h3'

export const CONTENT_QUERY_CACHE_NAME = 'unhead:content-queries:v1'

const CACHE_SCHEMA_VERSION = 'v1'
const CACHE_KEY_ORIGIN = 'https://content-query.cache.unhead.internal'
const CACHE_CREATED_AT_HEADER = 'x-unhead-cache-created-at'
const CACHE_STATUS_HEADER = 'x-unhead-cache'

const minute = 60
const day = 24 * 60 * minute
const FRESH_MAX_AGE_SECONDS = minute
const STALE_MAX_AGE_SECONDS = day
const STORED_CACHE_CONTROL = `public, max-age=${FRESH_MAX_AGE_SECONDS + STALE_MAX_AGE_SECONDS}`
const MAX_REQUEST_BODY_BYTES = 64 * 1024
const MAX_CACHED_RESULT_BYTES = 1024 * 1024
const MAX_CONCURRENT_FILLS = 100

const textEncoder = new TextEncoder()

/**
 * Per-isolate in-flight fills, keyed by the complete cache identity. Entries
 * are removed on both success and failure so a settled fill never serves
 * again. Coordination exists only within one isolate.
 */
const activeFills = new Map<string, Promise<FillOutcome>>()

export interface ContentQueryCacheAdapter {
  match: (request: Request) => Promise<Response | undefined>
  put: (request: Request, response: Response) => Promise<void>
}

export interface ContentQueryCacheIdentity {
  collection: string
  checksum: string
  deployment: string
  origin: string
  sqlHash: string
}

interface FillOutcome {
  body: string
}

type ContentQueryEligibility
  = | { tag: 'eligible', callerChecksum: string | undefined, sql: string }
    | { tag: 'ineligible' }

export interface ContentQueryCacheHandlerOptions {
  /** The captured Nuxt Content query handler. Owns SQL validation and database access. */
  original: (event: H3Event) => Promise<unknown>
  /** The build-generated content checksum for a collection, from `#content/manifest`. */
  resolveChecksum: (collection: string) => string | undefined
  /** The deployed build identity; a new deployment must start a new key namespace. */
  resolveDeployment: (event: H3Event) => string
  /** Resolves the Cloudflare Cache adapter, or undefined when the runtime has none. */
  openCache: () => Promise<ContentQueryCacheAdapter | undefined>
  waitUntil: (event: H3Event, promise: Promise<unknown>) => void
  now?: () => number
}

export function createCachedContentQueryHandler(options: ContentQueryCacheHandlerOptions): EventHandler {
  const now = options.now ?? Date.now

  return defineEventHandler(async (event) => {
    // Development runs against a local database with changing content, so the
    // query cache stays out of the path entirely.
    if (isDevRuntime())
      return serveUncached(event, options)

    const eligibility = await parseContentQueryEligibility(event)
    if (eligibility.tag === 'ineligible')
      return serveUncached(event, options)

    const requestUrl = getRequestURL(event)
    const collection = requestUrl.pathname.split('/')[2] || ''
    const checksum = options.resolveChecksum(collection)
    const deployment = options.resolveDeployment(event)
    if (!collection || !checksum || !deployment || eligibility.callerChecksum !== checksum)
      return serveUncached(event, options)

    if (requiresFreshResponse(event))
      return serveUncached(event, options)

    let cache: ContentQueryCacheAdapter | undefined
    try {
      cache = await options.openCache()
    }
    catch {
      logContentQueryCacheError('open')
      return serveUncached(event, options)
    }
    if (!cache)
      return serveUncached(event, options)

    const identity: ContentQueryCacheIdentity = {
      collection,
      checksum,
      deployment,
      origin: requestUrl.origin,
      sqlHash: await sha256Hex(eligibility.sql),
    }
    const cacheKey = createContentQueryCacheKey(identity)

    let cached: Response | undefined
    try {
      cached = await cache.match(cacheKey)
    }
    catch {
      logContentQueryCacheError('match')
      return serveUncached(event, options)
    }

    if (cached) {
      const age = getCacheAgeSeconds(cached, now)
      if (age <= FRESH_MAX_AGE_SECONDS)
        return restoreCachedResponse(cached, 'HIT')

      if (age <= FRESH_MAX_AGE_SECONDS + STALE_MAX_AGE_SECONDS) {
        options.waitUntil(
          event,
          runCoalescedFill(identity, cacheKey, cache, event, options, now)
            .catch(() => logContentQueryCacheError('refresh')),
        )
        return restoreCachedResponse(cached, 'STALE')
      }
    }

    const outcome = await runCoalescedFill(identity, cacheKey, cache, event, options, now)
    return buildJsonResponse(outcome.body, 'MISS')
  })
}

export function createContentQueryCacheKey(identity: ContentQueryCacheIdentity): Request {
  const url = new URL(`${CACHE_KEY_ORIGIN}/${CACHE_SCHEMA_VERSION}/${encodeURIComponent(identity.deployment)}/${encodeURIComponent(identity.collection)}/${encodeURIComponent(identity.checksum)}/${identity.sqlHash}`)
  url.searchParams.set('origin', identity.origin)
  return new Request(url, { method: 'GET' })
}

async function parseContentQueryEligibility(event: H3Event): Promise<ContentQueryEligibility> {
  if (event.method !== 'POST')
    return { tag: 'ineligible' }

  const body = await readRawBody(event, 'utf8')
  if (body === undefined || byteLength(body) > MAX_REQUEST_BODY_BYTES)
    return { tag: 'ineligible' }

  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  }
  catch {
    return { tag: 'ineligible' }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    return { tag: 'ineligible' }

  const record = parsed as Record<string, unknown>
  const keys = Object.keys(record)
  if (keys.length !== 1 || keys[0] !== 'sql' || typeof record.sql !== 'string')
    return { tag: 'ineligible' }

  const callerChecksum = getRequestURL(event).searchParams.get('v') ?? undefined
  return { tag: 'eligible', callerChecksum, sql: record.sql }
}

function requiresFreshResponse(event: H3Event): boolean {
  const headers = getRequestHeaders(event)
  if (headers.cookie || headers.authorization || headers.range)
    return true
  const cacheControl = headers['cache-control'] || ''
  return /(?:^|,)\s*(?:no-cache|no-store)\b/i.test(cacheControl)
}

async function serveUncached(event: H3Event, options: ContentQueryCacheHandlerOptions): Promise<Response> {
  const value = await options.original(event)
  return buildJsonResponse(JSON.stringify(value), 'BYPASS')
}

function runCoalescedFill(
  identity: ContentQueryCacheIdentity,
  cacheKey: Request,
  cache: ContentQueryCacheAdapter,
  event: H3Event,
  options: ContentQueryCacheHandlerOptions,
  now: () => number,
): Promise<FillOutcome> {
  const identityKey = cacheKey.url
  const existing = activeFills.get(identityKey)
  if (existing)
    return existing

  // Bound exceeded: delegate without caching and without coalescing, so a
  // burst of distinct queries cannot grow the map without limit.
  if (activeFills.size >= MAX_CONCURRENT_FILLS)
    return fillWithoutCaching(event, options)

  const fill = (async () => {
    const value = await options.original(event)
    const body = JSON.stringify(value)
    if (byteLength(body) <= MAX_CACHED_RESULT_BYTES) {
      options.waitUntil(
        event,
        storeResponse(cache, cacheKey, body, now).catch(() => logContentQueryCacheError('put')),
      )
    }
    return { body }
  })()

  const tracked = fill.finally(() => {
    activeFills.delete(identityKey)
  })
  // Coalesced callers hold the only references to `tracked`, so every failure
  // is already surfaced through it. Marking the underlying fill as handled
  // only prevents a duplicate unhandled-rejection report when the shared
  // entry is referenced by other requests.
  fill.catch(() => {
    // handled through `tracked`
  })
  activeFills.set(identityKey, tracked)
  return tracked
}

async function fillWithoutCaching(event: H3Event, options: ContentQueryCacheHandlerOptions): Promise<FillOutcome> {
  const value = await options.original(event)
  return { body: JSON.stringify(value) }
}

async function storeResponse(
  cache: ContentQueryCacheAdapter,
  cacheKey: Request,
  body: string,
  now: () => number,
): Promise<void> {
  const headers = new Headers({ 'content-type': 'application/json' })
  headers.set(CACHE_CREATED_AT_HEADER, String(now()))
  headers.set('cache-control', STORED_CACHE_CONTROL)

  await cache.put(cacheKey, new Response(body, { status: 200, headers }))
}

function restoreCachedResponse(cached: Response, status: 'HIT' | 'STALE'): Response {
  const headers = new Headers(cached.headers)
  headers.delete(CACHE_CREATED_AT_HEADER)
  headers.delete('cache-control')
  headers.set(CACHE_STATUS_HEADER, status)

  return new Response(cached.body, {
    headers,
    status: cached.status,
    statusText: cached.statusText,
  })
}

function buildJsonResponse(body: string, status: 'BYPASS' | 'MISS'): Response {
  const headers = new Headers({ 'content-type': 'application/json' })
  headers.set(CACHE_STATUS_HEADER, status)

  return new Response(body, { status: 200, headers })
}

function getCacheAgeSeconds(cached: Response, now: () => number): number {
  const createdAt = Number(cached.headers.get(CACHE_CREATED_AT_HEADER))
  return Number.isFinite(createdAt)
    ? Math.max(0, (now() - createdAt) / 1000)
    : Number.POSITIVE_INFINITY
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(input))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

function byteLength(input: string): number {
  return textEncoder.encode(input).length
}

function isDevRuntime(): boolean {
  return Boolean((import.meta as unknown as { dev?: boolean }).dev)
}

function logContentQueryCacheError(operation: string) {
  const event = createWideEvent({
    'cache.kind': 'content-query',
    'cache.name': CONTENT_QUERY_CACHE_NAME,
    'cache.operation': operation,
    'cache.outcome': 'failed',
  })
  event.setLevel('warn')
  event.emit()
}
