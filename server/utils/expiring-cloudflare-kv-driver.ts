import type { TransactionOptions } from 'unstorage'
import type { KVOptions } from 'unstorage/drivers/cloudflare-kv-binding'
import { defineDriver } from 'unstorage'
import cloudflareKVBindingDriver from 'unstorage/drivers/cloudflare-kv-binding'

export const DEFAULT_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30

export interface ExpiringCloudflareKVOptions extends KVOptions {
  /** Physical retention ceiling for cache writes that do not provide a TTL. */
  defaultTtl?: number
}

/**
 * Cloudflare KV cache driver with a physical default expiration.
 *
 * Nitro intentionally omits the storage TTL for stale-while-revalidate writes;
 * that is useful for serving stale data, but permanent KV objects accumulate as
 * routes and module cache-key formats change. This wrapper retains SWR while
 * ensuring every cache write eventually expires from the backing namespace.
 */
export default defineDriver((options: ExpiringCloudflareKVOptions) => {
  const {
    defaultTtl = DEFAULT_CACHE_TTL_SECONDS,
    ...kvOptions
  } = options

  if (!Number.isSafeInteger(defaultTtl) || defaultTtl < 60)
    throw new Error('defaultTtl must be an integer of at least 60 seconds')

  const driver = cloudflareKVBindingDriver(kvOptions)
  const setItem = driver.setItem
  if (!setItem)
    throw new Error('cloudflare-kv-binding driver does not support writes')

  return {
    ...driver,
    name: 'expiring-cloudflare-kv-binding',
    options,
    setItem(key: string, value: string, transactionOptions: TransactionOptions = {}) {
      const requestedTtl = Number(transactionOptions.ttl)
      const ttl = Number.isSafeInteger(requestedTtl) && requestedTtl > 0
        ? requestedTtl
        : defaultTtl
      return setItem(key, value, { ...transactionOptions, ttl })
    },
  }
})
