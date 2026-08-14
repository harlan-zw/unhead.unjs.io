import { resolveSessionGuard } from '../utils/session-password'

export default defineEventHandler((event) => {
  const guard = resolveSessionGuard(event.path, useRuntimeConfig(event).session?.password)
  if (guard._tag === 'pass')
    return

  if (guard._tag === 'emptySession') {
    setResponseHeader(event, 'cache-control', 'no-store')
    return {}
  }

  throw createError({
    statusCode: 503,
    statusMessage: 'Sessions are unavailable',
    message: guard.message,
  })
})
