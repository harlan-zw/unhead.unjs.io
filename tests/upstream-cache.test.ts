import type { UpstreamCacheStore } from '../server/utils/upstream-cache'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { readThroughUpstreamCache } from '../server/utils/upstream-cache'

const schema = z.object({ value: z.string() })

function createStore() {
  const values = new Map<string, unknown>()
  const store: UpstreamCacheStore = {
    async get(key) {
      return values.get(key) ?? null
    },
    async put(key, value) {
      values.set(key, JSON.parse(value))
    },
  }
  return { store, values }
}

function createWaitUntil() {
  const promises: Promise<unknown>[] = []
  return {
    waitUntil(promise: Promise<unknown>) {
      promises.push(promise)
    },
    async settle() {
      await Promise.all(promises)
    },
  }
}

function options(store: UpstreamCacheStore, waitUntil: (promise: Promise<unknown>) => void, now: number) {
  return {
    cacheKey: 'upstream:v1:test:key',
    key: 'source-key',
    maxAge: 60,
    name: 'test:data',
    now: () => now,
    schema,
    staleMaxAge: 300,
    store,
    waitUntil,
  }
}

describe('upstream KV cache', () => {
  it('writes misses in waitUntil and serves fresh hits', async () => {
    const { store } = createStore()
    const context = createWaitUntil()
    const fetcher = vi.fn(async () => ({ value: 'fresh' }))

    expect(await readThroughUpstreamCache(options(store, context.waitUntil, 1_000), fetcher)).toEqual({ value: 'fresh' })
    await context.settle()

    expect(await readThroughUpstreamCache(options(store, createWaitUntil().waitUntil, 30_000), fetcher)).toEqual({ value: 'fresh' })
    expect(fetcher).toHaveBeenCalledOnce()
  })

  it('refreshes stale entries and replaces them asynchronously', async () => {
    const { store } = createStore()
    const initialContext = createWaitUntil()
    await readThroughUpstreamCache(
      options(store, initialContext.waitUntil, 1_000),
      async () => ({ value: 'old' }),
    )
    await initialContext.settle()

    const refreshContext = createWaitUntil()
    expect(await readThroughUpstreamCache(
      options(store, refreshContext.waitUntil, 62_000),
      async () => ({ value: 'new' }),
    )).toEqual({ value: 'new' })
    await refreshContext.settle()

    expect(await readThroughUpstreamCache(
      options(store, createWaitUntil().waitUntil, 63_000),
      async () => ({ value: 'unexpected' }),
    )).toEqual({ value: 'new' })
  })

  it('serves stale data only when refresh fails inside the stale window', async () => {
    const { store, values } = createStore()
    values.set('upstream:v1:test:key', {
      cachedAt: 1_000,
      value: { value: 'stale' },
      version: 1,
    })

    expect(await readThroughUpstreamCache(
      options(store, createWaitUntil().waitUntil, 62_000),
      async () => { throw new Error('upstream unavailable') },
    )).toEqual({ value: 'stale' })

    await expect(readThroughUpstreamCache(
      options(store, createWaitUntil().waitUntil, 400_000),
      async () => { throw new Error('upstream unavailable') },
    )).rejects.toThrow('upstream unavailable')
  })

  it('ignores cached values that fail runtime validation', async () => {
    const { store, values } = createStore()
    values.set('upstream:v1:test:key', {
      cachedAt: 1_000,
      value: { value: 42 },
      version: 1,
    })

    expect(await readThroughUpstreamCache(
      options(store, createWaitUntil().waitUntil, 2_000),
      async () => ({ value: 'validated' }),
    )).toEqual({ value: 'validated' })
  })
})
