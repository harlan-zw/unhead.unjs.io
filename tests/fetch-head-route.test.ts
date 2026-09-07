import { createApp, toWebHandler } from 'h3'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkFreeToolRateLimit } from '~~/server/utils/rate-limit'
import fetchHeadHandler from '../layers/tools/server/api/tools/fetch-head.get'

vi.mock('~~/server/utils/rate-limit', () => ({ checkFreeToolRateLimit: vi.fn() }))

const fetcher = vi.fn<typeof fetch>()

function requestHead(url = 'https://example.com') {
  const onError = vi.fn()
  const app = createApp({ onError })
  app.use('/api/tools/fetch-head', fetchHeadHandler)
  const request = new Request(`https://unhead.unjs.io/api/tools/fetch-head?url=${encodeURIComponent(url)}`)
  return { response: toWebHandler(app)(request), onError }
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubGlobal('fetch', fetcher)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetch-head route', () => {
  it('returns the head contents on success', async () => {
    fetcher.mockResolvedValue(new Response('<html><head><title>Safe</title></head></html>', {
      headers: { 'content-type': 'text/html' },
    }))

    const { response, onError } = requestHead()
    const result = await response

    expect(result.status).toBe(200)
    expect(await result.json()).toEqual({ head: '<title>Safe</title>' })
    expect(onError).not.toHaveBeenCalled()
  })

  it.each([
    [new TypeError('fetch failed'), 502, 'Failed to fetch URL'],
    [new DOMException('The operation was aborted', 'AbortError'), 504, 'Upstream request timed out'],
  ])('answers an upstream fetch failure without invoking the error hook: %s', async (error, statusCode, statusMessage) => {
    fetcher.mockRejectedValue(error)

    const { response, onError } = requestHead()
    const result = await response

    expect(result.status).toBe(statusCode)
    expect(await result.json()).toEqual({ statusCode, statusMessage })
    expect(onError).not.toHaveBeenCalled()
  })

  it.each([
    [new TypeError('terminated'), 502, 'Failed to fetch URL'],
    [new DOMException('The operation was aborted', 'AbortError'), 504, 'Upstream request timed out'],
  ])('answers a response stream failure without invoking the error hook: %s', async (error, statusCode, statusMessage) => {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.error(error)
      },
    })
    fetcher.mockResolvedValue(new Response(body, { headers: { 'content-type': 'text/html' } }))

    const { response, onError } = requestHead()
    const result = await response

    expect(result.status).toBe(statusCode)
    expect(await result.json()).toEqual({ statusCode, statusMessage })
    expect(onError).not.toHaveBeenCalled()
  })

  it('passes unexpected infrastructure failures to the error hook', async () => {
    const error = new Error('Rate limiter unavailable')
    vi.mocked(checkFreeToolRateLimit).mockRejectedValue(error)

    const { response, onError } = requestHead()

    expect((await response).status).toBe(500)
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ cause: error }), expect.anything())
    expect(fetcher).not.toHaveBeenCalled()
  })
})
