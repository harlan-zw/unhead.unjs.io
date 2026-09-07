export interface DocsQueryResult<T> {
  data: T
  stale: boolean
}

export interface ResilientDocsQueryOptions {
  /**
   * Number of retries after the first attempt fails.
   */
  retries?: number
  /**
   * Delay before the first retry. Doubles on every further retry.
   */
  baseDelayMs?: number
  /**
   * Maximum number of cached entries. Oldest entries are evicted first.
   */
  maxCacheEntries?: number
  sleep?: (ms: number) => Promise<void>
  now?: () => number
  onStaleFallback?: (error: unknown, key: string) => void
}

const defaultSleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

function isTransientDocsError(error: unknown): boolean {
  if (!error || typeof error !== 'object')
    return false

  const failure = error as Record<string, unknown>
  const details = [failure, failure.cause, failure.data]
    .filter((value): value is Record<string, unknown> => value !== null && typeof value === 'object')
  const message = details.flatMap(detail => [detail.message, detail.statusMessage])
    .filter(value => typeof value === 'string')
    .join(' ')

  if (details.some(detail => detail.name === 'AbortError'))
    return false
  if (/SQLITE_(?:ERROR|CONSTRAINT|MISMATCH|TOOBIG)|D1_(?:TYPE_ERROR|COLUMN_NOTFOUND)|syntax error|constraint failed|no such (?:table|column)|has no column named/i.test(message))
    return false

  const status = failure.statusCode ?? failure.status
  if (typeof status === 'number')
    return [500, 502, 503, 504].includes(status)
  if (/requests queued too long|too many requests queued|overloaded/i.test(message))
    return true

  return failure.name === 'FetchError'
    && /failed to fetch|fetch failed|networkerror|network request failed|load failed/i.test(message)
}

/**
 * Wraps docs content queries with bounded retries and a stale cache fallback.
 * Successful results are cached per key. When transient failures exhaust retries,
 * the cached value for that key is served stale instead of failing the page.
 */
export function createResilientDocsQuery(options: ResilientDocsQueryOptions = {}) {
  const retries = options.retries ?? 2
  const baseDelayMs = options.baseDelayMs ?? 200
  const maxCacheEntries = options.maxCacheEntries ?? 100
  const sleep = options.sleep ?? defaultSleep
  const now = options.now ?? (() => Date.now())
  const cache = new Map<string, { data: unknown, cachedAt: number }>()

  function setCached(key: string, data: unknown) {
    cache.delete(key)
    cache.set(key, { data, cachedAt: now() })
    while (cache.size > maxCacheEntries) {
      const oldest = cache.keys().next().value
      if (oldest === undefined)
        break
      cache.delete(oldest)
    }
  }

  return async function query<T>(key: string, run: () => Promise<T>): Promise<DocsQueryResult<T>> {
    let lastError: unknown
    for (let attempt = 0; attempt <= retries; attempt++) {
      if (attempt > 0)
        await sleep(baseDelayMs * 2 ** (attempt - 1))
      try {
        const data = await run()
        // Only cache real content: a null page miss must not serve as a
        // stale fallback, while empty surround arrays still count.
        if (data)
          setCached(key, data)
        else
          cache.delete(key)
        return { data, stale: false }
      }
      catch (error) {
        if (!isTransientDocsError(error))
          throw error
        lastError = error
      }
    }

    const cached = cache.get(key)
    if (cached) {
      options.onStaleFallback?.(lastError, key)
      return { data: cached.data as T, stale: true }
    }
    throw lastError
  }
}
