import { describe, expect, it, vi } from 'vitest'
import {
  fetchHeadHtml,
  normalizePublicHttpUrl,
  readLimitedText,
} from '../layers/tools/server/utils/fetch-head'

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

describe('readLimitedText', () => {
  it('stops streaming after the byte limit', async () => {
    const response = new Response(new Uint8Array([1, 2, 3, 4]))
    await expect(readLimitedText(response, 3)).rejects.toMatchObject({ statusCode: 413 })
  })
})
