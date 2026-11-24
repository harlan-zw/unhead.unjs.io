import type { SessionConfig } from 'nuxt/server'
import { createError, defineHandler, useRuntimeConfig } from 'nuxt/server'
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

export default defineHandler(async (event) => {
  const { appSecret, session } = useRuntimeConfig()
  const guard = resolveSessionGuard({ method: event.req.method, path: new URL(event.req.url).pathname }, appSecret)
  if (guard._tag === 'pass')
    return

  if (guard._tag === 'clearSession')
    return clearUnavailableSession(event, session as SessionConfig)

  logOnce(guard.message)

  if (guard._tag === 'emptySession') {
    event.res.headers.set('cache-control', 'no-store')
    return {}
  }

  // Without a secret the admin area cannot exist, so say so plainly and keep the
  // reason out of the response body.
  throw createError({
    statusCode: guard.status,
    statusMessage: 'Not Found',
  })
})
