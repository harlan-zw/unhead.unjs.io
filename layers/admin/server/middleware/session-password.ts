import type { SessionConfig } from 'h3'
import { resolveSessionGuard } from '../utils/session-password'
import { clearUnavailableSession } from '../utils/unavailable-session'

let logged = false

/**
 * The route answers 404, so the diagnostic has to reach the operator somewhere
 * else. Workers Logs keep this line, and once per isolate is enough to see it
 * without one entry per bot probe.
 */
function logOnce(message: string) {
  if (logged)
    return
  logged = true
  console.error(`[session-password] ${message}`)
}

export default defineEventHandler(async (event) => {
  const sessionConfig = useRuntimeConfig(event).session as Partial<SessionConfig> | undefined
  const guard = resolveSessionGuard({ method: event.method, path: event.path }, sessionConfig?.password)
  if (guard._tag === 'pass')
    return

  if (guard._tag === 'clearSession')
    return clearUnavailableSession(event, sessionConfig ?? {})

  logOnce(guard.message)

  if (guard._tag === 'emptySession') {
    setResponseHeader(event, 'cache-control', 'no-store')
    return {}
  }

  // Without a secret the admin area cannot exist, so say so plainly and keep the
  // reason out of the response body.
  throw createError({
    statusCode: guard.status,
    statusMessage: 'Not Found',
  })
})
