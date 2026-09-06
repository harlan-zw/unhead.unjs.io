import { describe, expect, it } from 'vitest'
import nuxtConfig from '../nuxt.config'

const routeRules = nuxtConfig.routeRules ?? {}

describe('docs SSR cache', () => {
  it('serves docs renders from a stale-while-revalidate cache', () => {
    const rule = routeRules['/docs/**']
    expect(typeof rule?.swr).toBe('number')
    expect(rule?.swr).toBeGreaterThan(0)
  })

  it('keeps the D1 content query route out of the URL-keyed route cache', () => {
    // Nitro caches route rules by URL alone, and the content query endpoint is
    // a POST whose SQL sits in the body. Caching it would serve one query's
    // rows for every other query to the same collection.
    expect(routeRules['/__nuxt_content/**']?.cache).toBe(false)
  })
})
