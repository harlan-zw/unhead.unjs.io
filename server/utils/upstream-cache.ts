/// <reference types="@cloudflare/workers-types" />

import type { H3Event } from 'h3'
import type { ZodType } from 'zod'
import { z } from 'zod'

const CACHE_KEY_PREFIX = 'upstream:v1'
const CACHE_ENTRY_VERSION = 1
const KV_EDGE_CACHE_TTL_SECONDS = 60

const CacheEnvelopeSchema = z.object({
  cachedAt: z.number().finite().nonnegative(),
  value: z.unknown(),
  version: z.literal(CACHE_ENTRY_VERSION),
})

export const upstreamCacheTtl = {
  hour: 60 * 60,
  day: 60 * 60 * 24,
  week: 60 * 60 * 24 * 7,
} as const

export interface UpstreamCacheStore {
  get: (key: string) => Promise<unknown | null>
  put: (key: string, value: string, expirationTtl: number) => Promise<void>
}

interface UpstreamCacheOptions<T> {
  key: string
  maxAge: number
  name: string
  schema: ZodType<T>
  staleMaxAge: number
}

interface ReadThroughUpstreamCacheOptions<T> extends UpstreamCacheOptions<T> {
  cacheKey: string
  now?: () => number
  store: UpstreamCacheStore
  waitUntil: (promise: Promise<unknown>) => void
}

/**
 * Global L2 for small, read-heavy upstream API results.
 *
 * The Worker Cache remains the response-level L1. KV is only consulted when a
 * handler runs, which protects rate-limited upstream APIs across data centers.
 */
export async function withUpstreamCache<T>(
  event: H3Event,
  options: UpstreamCacheOptions<T>,
  fetcher: () => Promise<unknown>,
): Promise<T> {
  validateCachePolicy(options)

  const namespace = getUpstreamCacheNamespace(event)
  if (!namespace)
    return fetchAndValidate(options, fetcher)

  const cacheKey = await createUpstreamCacheKey(options.name, options.key)
  const store: UpstreamCacheStore = {
    get: key => namespace.get<unknown>(key, { type: 'json', cacheTtl: KV_EDGE_CACHE_TTL_SECONDS }),
    put: (key, value, expirationTtl) => namespace.put(key, value, { expirationTtl }),
  }

  return readThroughUpstreamCache({
    ...options,
    cacheKey,
    store,
    waitUntil: promise => event.waitUntil(promise),
  }, fetcher)
}

export async function readThroughUpstreamCache<T>(
  options: ReadThroughUpstreamCacheOptions<T>,
  fetcher: () => Promise<unknown>,
): Promise<T> {
  validateCachePolicy(options)

  const now = options.now || Date.now
  let staleValue: T | undefined

  try {
    const envelopeResult = CacheEnvelopeSchema.safeParse(await options.store.get(options.cacheKey))
    if (envelopeResult.success) {
      const valueResult = options.schema.safeParse(envelopeResult.data.value)
      if (valueResult.success) {
        const age = Math.max(0, (now() - envelopeResult.data.cachedAt) / 1000)
        if (age <= options.maxAge)
          return valueResult.data

        if (age <= options.maxAge + options.staleMaxAge)
          staleValue = valueResult.data
      }
    }
  }
  catch (error) {
    logUpstreamCacheError('get', options.name, error)
  }

  try {
    const value = await fetchAndValidate(options, fetcher)
    scheduleCacheWrite(options, value, now())
    return value
  }
  catch (error) {
    if (staleValue !== undefined) {
      console.warn(JSON.stringify({
        message: 'Serving stale upstream cache after refresh failure',
        cache: options.name,
        error: error instanceof Error ? error.message : String(error),
      }))
      return staleValue
    }
    throw error
  }
}

async function fetchAndValidate<T>(
  options: Pick<UpstreamCacheOptions<T>, 'name' | 'schema'>,
  fetcher: () => Promise<unknown>,
): Promise<T> {
  const result = options.schema.safeParse(await fetcher())
  if (result.success)
    return result.data

  throw new Error(`Upstream response for ${options.name} did not match its cache schema`)
}

function scheduleCacheWrite<T>(
  options: ReadThroughUpstreamCacheOptions<T>,
  value: T,
  cachedAt: number,
) {
  let serialized: string
  try {
    serialized = JSON.stringify({
      cachedAt,
      value,
      version: CACHE_ENTRY_VERSION,
    })
  }
  catch (error) {
    logUpstreamCacheError('serialize', options.name, error)
    return
  }

  const write = options.store.put(
    options.cacheKey,
    serialized,
    options.maxAge + options.staleMaxAge,
  ).catch(error => logUpstreamCacheError('put', options.name, error))

  options.waitUntil(write)
}

async function createUpstreamCacheKey(name: string, key: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key))
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
  return `${CACHE_KEY_PREFIX}:${name}:${hash}`
}

function getUpstreamCacheNamespace(event: H3Event): KVNamespace | undefined {
  const contextualEnv: unknown = event.context.cloudflare?.env
  const globalEnv: unknown = Reflect.get(globalThis, '__env__')

  return findKVNamespace(contextualEnv) || findKVNamespace(globalEnv)
}

function findKVNamespace(env: unknown): KVNamespace | undefined {
  if (!env || typeof env !== 'object')
    return undefined

  const namedCache = Reflect.get(env, 'UPSTREAM_CACHE')
  if (isKVNamespace(namedCache))
    return namedCache

  // Transition path for the existing Pages dashboard binding.
  const legacyCache = Reflect.get(env, 'KV')
  return isKVNamespace(legacyCache) ? legacyCache : undefined
}

function isKVNamespace(value: unknown): value is KVNamespace {
  return Boolean(
    value
    && typeof value === 'object'
    && typeof Reflect.get(value, 'get') === 'function'
    && typeof Reflect.get(value, 'put') === 'function',
  )
}

function validateCachePolicy(options: Pick<UpstreamCacheOptions<unknown>, 'maxAge' | 'name' | 'staleMaxAge'>) {
  if (!/^[a-z0-9:-]+$/.test(options.name))
    throw new Error('Upstream cache names may only contain lowercase letters, numbers, colons, and hyphens')
  if (!Number.isSafeInteger(options.maxAge) || options.maxAge < 60)
    throw new Error('Upstream cache maxAge must be an integer of at least 60 seconds')
  if (!Number.isSafeInteger(options.staleMaxAge) || options.staleMaxAge < 0)
    throw new Error('Upstream cache staleMaxAge must be a non-negative integer')
}

function logUpstreamCacheError(operation: string, cache: string, error: unknown) {
  console.warn(JSON.stringify({
    message: 'Upstream KV cache operation failed',
    operation,
    cache,
    error: error instanceof Error ? error.message : String(error),
  }))
}
