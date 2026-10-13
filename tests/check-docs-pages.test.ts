import { describe, expect, it, vi } from 'vitest'
import { checkDocsPages } from '../scripts/check-docs-pages'

const origin = 'https://unhead.unjs.io'

function answering(...statuses: (number | Error)[]) {
  return vi.fn(async () => {
    const next = statuses.length > 1 ? statuses.shift()! : statuses[0]!
    if (next instanceof Error)
      throw next
    return { status: next }
  })
}

describe('checkDocsPages', () => {
  it('passes a page that recovers from a 5xx while the deploy propagates', async () => {
    const fetcher = answering(502, 200)
    const results = await checkDocsPages({ origin, pages: ['/docs/head/api/composables/use-head'], fetcher, delayMs: 0 })

    expect(results).toEqual([{ _tag: 'ok', path: '/docs/head/api/composables/use-head', status: 200 }])
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('fails a page that keeps answering 5xx', async () => {
    const results = await checkDocsPages({ origin, pages: ['/docs/head/guides/get-started/overview'], fetcher: answering(500), attempts: 3, delayMs: 0 })

    expect(results).toEqual([{ _tag: 'failed', path: '/docs/head/guides/get-started/overview', reason: 'answered 500' }])
  })

  it('fails a page that cannot be reached', async () => {
    const results = await checkDocsPages({ origin, pages: ['/learn/guides/what-is-capo'], fetcher: answering(new Error('fetch failed')), attempts: 2, delayMs: 0 })

    expect(results).toEqual([{ _tag: 'failed', path: '/learn/guides/what-is-capo', reason: 'fetch failed' }])
  })

  it('reports a moved page without failing the deploy', async () => {
    const results = await checkDocsPages({ origin, pages: ['/docs/old-page'], fetcher: answering(404), delayMs: 0 })

    expect(results).toEqual([{ _tag: 'ok', path: '/docs/old-page', status: 404 }])
  })

  it('asks the response cache for a fresh render', async () => {
    const fetcher = answering(200)
    await checkDocsPages({ origin, pages: ['/docs/schema-org/api/schema/article'], fetcher })

    expect(fetcher).toHaveBeenCalledWith('https://unhead.unjs.io/docs/schema-org/api/schema/article', expect.objectContaining({
      headers: expect.objectContaining({ 'cache-control': 'no-cache' }),
    }))
  })
})
