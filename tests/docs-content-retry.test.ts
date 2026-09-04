import { describe, expect, it, vi } from 'vitest'
import { createResilientDocsQuery } from '../utils/docs-retry'

describe('createResilientDocsQuery', () => {
  it('retries transient failures with exponential backoff and serves fresh data', async () => {
    const sleep = vi.fn(async () => {})
    const query = createResilientDocsQuery({ retries: 2, baseDelayMs: 200, sleep })
    let attempts = 0
    const run = async () => {
      attempts++
      if (attempts < 3)
        throw new Error('D1_ERROR: requests queued too long')
      return { path: '/docs/head/getting-started' }
    }

    const result = await query('docsUnhead:page:/docs/head/getting-started', run)

    expect(result).toEqual({ data: { path: '/docs/head/getting-started' }, stale: false })
    expect(attempts).toBe(3)
    expect(sleep.mock.calls).toEqual([[200], [400]])
  })

  it('throws the last error when every attempt fails and nothing is cached', async () => {
    const sleep = vi.fn(async () => {})
    const query = createResilientDocsQuery({ retries: 1, baseDelayMs: 5, sleep })
    const run = async () => {
      throw new Error('D1_ERROR: requests queued too long')
    }

    await expect(query('docsUnhead:page:/docs/head', run))
      .rejects
      .toThrow('D1_ERROR: requests queued too long')
    expect(sleep.mock.calls).toEqual([[5]])
  })

  it('serves stale cached content when a previously fetched page starts failing', async () => {
    const sleep = vi.fn(async () => {})
    const onStaleFallback = vi.fn()
    const query = createResilientDocsQuery({ retries: 1, baseDelayMs: 5, sleep, onStaleFallback })
    const staleRun = async () => {
      throw new Error('D1_ERROR: requests queued too long')
    }

    await query('docsUnhead:page:/docs/head', async () => ({ path: '/docs/head', title: 'Introduction' }))

    const result = await query('docsUnhead:page:/docs/head', staleRun)

    expect(result).toEqual({ data: { path: '/docs/head', title: 'Introduction' }, stale: true })
    expect(onStaleFallback).toHaveBeenCalledOnce()
    expect(onStaleFallback.mock.calls[0][0]).toBeInstanceOf(Error)
    expect(onStaleFallback.mock.calls[0][1]).toBe('docsUnhead:page:/docs/head')
  })

  it('refreshes the cache so stale fallback serves the latest successful data', async () => {
    const sleep = vi.fn(async () => {})
    const query = createResilientDocsQuery({ retries: 1, baseDelayMs: 5, sleep })
    let version = 1
    const failRun = async () => {
      throw new Error('D1_ERROR')
    }

    await query('docsUnhead:page:/docs/head', async () => ({ path: '/docs/head', version: version++ }))
    await query('docsUnhead:page:/docs/head', async () => ({ path: '/docs/head', version: version++ }))

    const result = await query('docsUnhead:page:/docs/head', failRun)

    expect(result).toEqual({ data: { path: '/docs/head', version: 2 }, stale: true })
  })

  it('never caches a null miss so a not-found page cannot mask a later outage', async () => {
    const sleep = vi.fn(async () => {})
    const query = createResilientDocsQuery({ retries: 1, baseDelayMs: 5, sleep })

    const miss = await query('docsUnhead:page:/docs/missing', async () => null)
    expect(miss).toEqual({ data: null, stale: false })

    const failRun = async () => {
      throw new Error('D1_ERROR')
    }
    await expect(query('docsUnhead:page:/docs/missing', failRun)).rejects.toThrow('D1_ERROR')
  })

  it('caches empty surrounding arrays so surround queries get a stale fallback', async () => {
    const sleep = vi.fn(async () => {})
    const query = createResilientDocsQuery({ retries: 1, baseDelayMs: 5, sleep })

    await query('docsUnhead:surround:/docs/head', async () => [])

    const result = await query('docsUnhead:surround:/docs/head', async () => {
      throw new Error('D1_ERROR')
    })

    expect(result).toEqual({ data: [], stale: true })
  })

  it('evicts the oldest entries beyond the cache size limit', async () => {
    const sleep = vi.fn(async () => {})
    const query = createResilientDocsQuery({ retries: 1, baseDelayMs: 5, sleep, maxCacheEntries: 2 })
    const fail = async () => {
      throw new Error('D1_ERROR')
    }

    await query('a', async () => 'a1')
    await query('b', async () => 'b1')
    await query('a', async () => 'a2')
    await query('c', async () => 'c1')

    await expect(query('b', fail)).rejects.toThrow('D1_ERROR')
    await expect(query('a', fail)).resolves.toEqual({ data: 'a2', stale: true })
    await expect(query('c', fail)).resolves.toEqual({ data: 'c1', stale: true })
  })
})
