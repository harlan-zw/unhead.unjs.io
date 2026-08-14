import type { SessionConfig } from 'h3'
import { resolveSessionGuard } from '../utils/session-password'
import { clearUnavailableSession } from '../utils/unavailable-session'

export default defineEventHandler(async (event) => {
  const sessionConfig = useRuntimeConfig(event).session as Partial<SessionConfig> | undefined
  const guard = resolveSessionGuard({ method: event.method, path: event.path }, sessionConfig?.password)
  if (guard._tag === 'pass')
    return

  if (guard._tag === 'clearSession')
    return clearUnavailableSession(event, sessionConfig ?? {})

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
