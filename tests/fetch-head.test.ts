import { describe, expect, it, vi } from 'vitest'
import {
  fetchHeadHtml,
  isFetchHeadUpstreamError,
  normalizePublicHttpUrl,
  readLimitedText,
} from '../layers/tools/server/utils/fetch-head'

function htmlResponse(body = '<html><head><title>Safe</title></head></html>'): Response {
  return new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } })
}

describe('normalizePublicHttpUrl', () => {
  it('normalizes public hostnames and strips fragments', () => {
    expect(normalizePublicHttpUrl('example.com/page#secret').href).toBe('https://example.com/page')
  })

  it.each([
    'http://localhost',
    'http://127.0.0.1',
    'http://2130706433',
    'http://10.0.0.1',
    'http://169.254.169.254/latest/meta-data',
    'http://192.168.1.1',
    'http://[::1]',
    'https://service.internal',
    'https://example.com:8443',
    'https://user:secret@example.com',
  ])('blocks unsafe target %s', (url) => {
    expect(() => normalizePublicHttpUrl(url)).toThrow()
  })
})

describe('fetchHeadHtml', () => {
  it('reads a successful HTML response', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('<html><head><title>Safe</title></head></html>', {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      }),
    )

    await expect(fetchHeadHtml('https://example.com', fetcher)).resolves.toContain('<title>Safe</title>')
    expect(fetcher).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ redirect: 'manual' }))
  })

  it('revalidates redirect targets', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/admin' } }),
    )

    await expect(fetchHeadHtml('https://example.com', fetcher)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('rejects non-HTML responses', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('{}', { headers: { 'content-type': 'application/json' } }),
    )

    await expect(fetchHeadHtml('https://example.com', fetcher)).rejects.toMatchObject({ statusCode: 415 })
  })
})

describe('isFetchHeadUpstreamError', () => {
  it('marks a non-OK upstream response as an upstream error', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 500 }))
    const error = await fetchHeadHtml('https://example.com', fetcher).catch((caught: unknown) => caught)
    expect(isFetchHeadUpstreamError(error)).toBe(true)
  })

  it('marks an aborted upstream request as an upstream error', async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new DOMException('The operation was aborted', 'AbortError'))
    const error = await fetchHeadHtml('https://example.com', fetcher).catch((caught: unknown) => caught)
    expect(isFetchHeadUpstreamError(error)).toBe(true)
  })

  it('marks empty upstream HTML as an upstream error', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('', { headers: { 'content-type': 'text/html' } }))
    const error = await fetchHeadHtml('https://example.com', fetcher).catch((caught: unknown) => caught)
    expect(isFetchHeadUpstreamError(error)).toBe(true)
  })

  it('does not mark invalid user input as an upstream error', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(htmlResponse())
    const error = await fetchHeadHtml('https://user:secret@example.com', fetcher).catch((caught: unknown) => caught)
    expect(isFetchHeadUpstreamError(error)).toBe(false)
  })

  it('does not mark an unsafe redirect target as an upstream error', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/admin' } }),
    )
    const error = await fetchHeadHtml('https://example.com', fetcher).catch((caught: unknown) => caught)
    expect(isFetchHeadUpstreamError(error)).toBe(false)
  })

  it('rejects values that are not errors', () => {
    expect(isFetchHeadUpstreamError(undefined)).toBe(false)
    expect(isFetchHeadUpstreamError('boom')).toBe(false)
  })
})

describe('readLimitedText', () => {
  it('stops streaming after the byte limit', async () => {
    const response = new Response(new Uint8Array([1, 2, 3, 4]))
    await expect(readLimitedText(response, 3)).rejects.toMatchObject({ statusCode: 413 })
  })
})
