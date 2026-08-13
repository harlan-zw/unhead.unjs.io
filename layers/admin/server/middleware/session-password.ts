import { resolveSessionGuard } from '../utils/session-password'

let reported = false

function reportOnce(message: string) {
  if (reported)
    return
  reported = true
  console.error(`[session-password] ${message}`)
}

export default defineEventHandler((event) => {
  const guard = resolveSessionGuard(event.path, useRuntimeConfig(event).session?.password)
  if (guard._tag === 'pass')
    return

  reportOnce(guard.message)

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
