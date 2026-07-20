import { createError } from 'h3'

const MAX_REDIRECTS = 5
export const MAX_HEAD_RESPONSE_BYTES = 2 * 1024 * 1024

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.').map(Number)
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255))
    return false

  const [a, b] = parts
  return a === 0
    || a === 10
    || a === 127
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && (b === 0 || b === 168))
    || (a === 198 && (b === 18 || b === 19))
    || a >= 224
}

function isPrivateIpv6(hostname: string): boolean {
  const value = hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (!value.includes(':'))
    return false

  if (value === '::' || value === '::1')
    return true

  const mappedIpv4 = value.match(/(?:^|:)ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1]
  if (mappedIpv4)
    return isPrivateIpv4(mappedIpv4)

  return /^(?:fc|fd|fe[89ab]|ff)/.test(value)
    || value.startsWith('2001:db8:')
}

export function normalizePublicHttpUrl(input: string, base?: URL): URL {
  const value = input.trim()
  const candidate = base
    ? new URL(value, base)
    : new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)

  if (!['http:', 'https:'].includes(candidate.protocol))
    throw createError({ statusCode: 400, statusMessage: 'Only HTTP/HTTPS URLs are supported' })

  if (candidate.username || candidate.password)
    throw createError({ statusCode: 400, statusMessage: 'URL credentials are not supported' })

  const expectedPort = candidate.protocol === 'http:' ? '80' : '443'
  if (candidate.port && candidate.port !== expectedPort)
    throw createError({ statusCode: 400, statusMessage: 'Non-standard ports are not supported' })

  const hostname = candidate.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  const blockedName = hostname === 'localhost'
    || hostname.endsWith('.localhost')
    || hostname.endsWith('.local')
    || hostname.endsWith('.internal')
    || hostname.endsWith('.home')
    || hostname.endsWith('.lan')
    || hostname.endsWith('.test')
    || hostname.endsWith('.invalid')

  if (blockedName || isPrivateIpv4(hostname) || isPrivateIpv6(hostname))
    throw createError({ statusCode: 400, statusMessage: 'Private and reserved network addresses are not supported' })

  candidate.hash = ''
  return candidate
}

export async function readLimitedText(response: Response, limit = MAX_HEAD_RESPONSE_BYTES): Promise<string> {
  const declaredLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > limit)
    throw createError({ statusCode: 413, statusMessage: 'Response too large' })

  if (!response.body) {
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (bytes.byteLength > limit)
      throw createError({ statusCode: 413, statusMessage: 'Response too large' })
    return new TextDecoder().decode(bytes)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let size = 0
  let body = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done)
        break
      size += value.byteLength
      if (size > limit)
        throw createError({ statusCode: 413, statusMessage: 'Response too large' })
      body += decoder.decode(value, { stream: true })
    }
    return body + decoder.decode()
  }
  finally {
    await reader.cancel().catch((error) => {
      // Cancellation can race with a stream that has already closed.
      void error
    })
  }
}

export async function fetchHeadHtml(
  input: string,
  fetcher: typeof fetch = fetch,
  timeoutMs = 10_000,
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    let url: URL
    try {
      url = normalizePublicHttpUrl(input)
    }
    catch (error) {
      if (error && typeof error === 'object' && 'statusCode' in error)
        throw error
      throw createError({ statusCode: 400, statusMessage: 'Invalid URL format' })
    }

    let response: Response | undefined
    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
      try {
        response = await fetcher(url, {
          headers: {
            'User-Agent': 'Unhead Capo.js Analyzer (https://unhead.unjs.io)',
            'Accept': 'text/html,application/xhtml+xml',
          },
          cache: 'no-store',
          credentials: 'omit',
          redirect: 'manual',
          signal: controller.signal,
        })
      }
      catch (error) {
        const timedOut = error instanceof DOMException && error.name === 'AbortError'
        throw createError({
          statusCode: timedOut ? 504 : 502,
          statusMessage: timedOut ? 'Upstream request timed out' : 'Failed to fetch URL',
        })
      }

      if (response.status < 300 || response.status >= 400)
        break

      if (redirects === MAX_REDIRECTS)
        throw createError({ statusCode: 502, statusMessage: 'Too many redirects' })

      const location = response.headers.get('location')
      if (!location)
        throw createError({ statusCode: 502, statusMessage: 'Invalid upstream redirect' })
      url = normalizePublicHttpUrl(location, url)
    }

    if (!response?.ok)
      throw createError({ statusCode: 502, statusMessage: `Upstream returned ${response?.status || 'an invalid response'}` })

    const contentType = response.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase()
    if (!contentType || !['text/html', 'application/xhtml+xml'].includes(contentType))
      throw createError({ statusCode: 415, statusMessage: 'URL did not return HTML' })

    const html = await readLimitedText(response)
    if (!html)
      throw createError({ statusCode: 502, statusMessage: 'No HTML content received' })
    return html
  }
  finally {
    clearTimeout(timeout)
  }
}
