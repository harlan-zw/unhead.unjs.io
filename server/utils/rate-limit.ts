import type { H3Event } from 'h3'

const FREE_TOOL_MINUTE_LIMIT = 10

export async function checkFreeToolRateLimit(event: H3Event) {
  if (import.meta.dev)
    return

  const ip = getHeader(event, 'cf-connecting-ip')
    || getRequestIP(event)
    || 'unknown'
  const key = `ip:${ip}`

  // Per-minute check (native Cloudflare binding)
  const limiter = getRateLimiter(event)

  if (limiter) {
    const { success } = await limiter.limit({ key })
    if (!success) {
      setResponseHeaders(event, {
        'X-RateLimit-Limit': String(FREE_TOOL_MINUTE_LIMIT),
        'Retry-After': '60',
      })
      throw createError({
        statusCode: 429,
        message: 'Rate limit exceeded. Please wait before making more requests.',
      })
    }
  }
}

function getRateLimiter(event: H3Event): RateLimit | undefined {
  const env: unknown = event.context.cloudflare?.env
  if (!env || typeof env !== 'object')
    return undefined

  const limiter = Reflect.get(env, 'RL_FREE_TOOLS')
  return isRateLimiter(limiter) ? limiter : undefined
}

function isRateLimiter(value: unknown): value is RateLimit {
  return Boolean(
    value
    && typeof value === 'object'
    && typeof Reflect.get(value, 'limit') === 'function',
  )
}
