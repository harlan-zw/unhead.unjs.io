import { describe, expect, it, vi } from 'vitest'
import expiringCloudflareKVDriver, { DEFAULT_CACHE_TTL_SECONDS } from '../server/utils/expiring-cloudflare-kv-driver'

function mockKV() {
  const put = vi.fn(async () => {})
  return {
    binding: {
      delete: vi.fn(async () => {}),
      get: vi.fn(async () => null),
      list: vi.fn(async () => ({ keys: [], list_complete: true, cacheStatus: null })),
      put,
    } as unknown as KVNamespace,
    put,
  }
}

describe('expiring Cloudflare KV cache driver', () => {
  it('adds the default physical TTL when a cache write omits one', async () => {
    const { binding, put } = mockKV()
    const driver = expiringCloudflareKVDriver({ binding })

    await driver.setItem?.('nitro:routes:page', 'value', {})

    expect(put).toHaveBeenCalledWith('nitro:routes:page', 'value', expect.objectContaining({
      expirationTtl: DEFAULT_CACHE_TTL_SECONDS,
      ttl: DEFAULT_CACHE_TTL_SECONDS,
    }))
  })

  it('preserves a valid explicit TTL', async () => {
    const { binding, put } = mockKV()
    const driver = expiringCloudflareKVDriver({ binding })

    await driver.setItem?.('nitro:handlers:short', 'value', { ttl: 3600 })

    expect(put).toHaveBeenCalledWith('nitro:handlers:short', 'value', expect.objectContaining({
      expirationTtl: 3600,
      ttl: 3600,
    }))
  })

  it('lets Cloudflare clamp a positive sub-minute TTL instead of using the fallback', async () => {
    const { binding, put } = mockKV()
    const driver = expiringCloudflareKVDriver({ binding })

    await driver.setItem?.('nitro:handlers:very-short', 'value', { ttl: 30 })

    expect(put).toHaveBeenCalledWith('nitro:handlers:very-short', 'value', expect.objectContaining({
      expirationTtl: 60,
      ttl: 30,
    }))
  })

  it('rejects an invalid default retention', () => {
    const { binding } = mockKV()
    expect(() => expiringCloudflareKVDriver({ binding, defaultTtl: 59 })).toThrow(/at least 60 seconds/)
  })
})
