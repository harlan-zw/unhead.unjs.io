const ProtocolPattern = /^https?:\/\//i
const HeadPattern = /<head[^>]*>([\s\S]*?)<\/head>/i

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url)
    throw createError({ statusCode: 400, statusMessage: 'Missing url parameter' })

  // Prepend https:// if no protocol provided
  const normalizedUrl = ProtocolPattern.test(url) ? url : `https://${url}`

  // Validate URL format
  let parsed: URL
  try {
    parsed = new URL(normalizedUrl)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid URL format' })
  }

  if (!['http:', 'https:'].includes(parsed.protocol))
    throw createError({ statusCode: 400, statusMessage: 'Only HTTP/HTTPS URLs are supported' })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  const response = await fetch(normalizedUrl, {
    headers: {
      'User-Agent': 'Unhead Capo.js Analyzer (https://unhead.unjs.io)',
      'Accept': 'text/html',
    },
    redirect: 'follow',
    signal: controller.signal,
  }).catch((err) => {
    throw createError({ statusCode: 502, statusMessage: `Failed to fetch URL: ${err.message}` })
  }).finally(() => clearTimeout(timeout))

  const html = await response.text()
  if (!html)
    throw createError({ statusCode: 502, statusMessage: 'No HTML content received' })

  // Size limit: 2MB
  if (html.length > 2 * 1024 * 1024)
    throw createError({ statusCode: 413, statusMessage: 'Response too large' })

  // Extract <head> content
  const headMatch = html.match(HeadPattern)
  if (!headMatch)
    throw createError({ statusCode: 422, statusMessage: 'No <head> tag found in response' })

  return { head: headMatch[1] }
})
