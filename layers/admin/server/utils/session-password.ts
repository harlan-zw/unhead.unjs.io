export const SESSION_PASSWORD_MIN_LENGTH = 32

/**
 * A missing secret is a deployment choice, not a server fault. Sentry's Nitro
 * error handler reports every H3 error from 500 up, so answering a session route
 * with 503 filed a production error on every request, including bot probes for
 * paths such as `/admin/.env`. The literal type keeps this state below the
 * reporting threshold for good.
 */
export const SESSION_UNAVAILABLE_STATUS = 404

const SESSION_ENDPOINT = '/api/_auth/session'
const SESSION_ROUTE_PATTERN = /^\/(?:api\/(?:_auth|admin)|auth|admin)(?:\/|$)/

type SessionPassword
  = | { _tag: 'ready' }
    | { _tag: 'missing' }
    | { _tag: 'tooShort', length: number }

export type SessionGuard
  = | { _tag: 'pass' }
    | { _tag: 'emptySession', message: string }
    | { _tag: 'clearSession' }
    | { _tag: 'unavailable', message: string, status: typeof SESSION_UNAVAILABLE_STATUS }

export interface SessionRequest {
  method: string
  path: string
}

function parseSessionPassword(value: unknown): SessionPassword {
  if (typeof value !== 'string' || value.length === 0)
    return { _tag: 'missing' }
  if (value.length < SESSION_PASSWORD_MIN_LENGTH)
    return { _tag: 'tooShort', length: value.length }
  return { _tag: 'ready' }
}

function failureMessage(password: Exclude<SessionPassword, { _tag: 'ready' }>): string {
  const cause = password._tag === 'missing'
    ? 'NUXT_SESSION_PASSWORD is not set.'
    : `NUXT_SESSION_PASSWORD has ${password.length} characters. It needs at least ${SESSION_PASSWORD_MIN_LENGTH}.`
  return `Sessions are unavailable. ${cause}`
}

export function resolveSessionGuard(request: SessionRequest, rawPassword: unknown): SessionGuard {
  const pathname = request.path.split('?')[0] || '/'
  if (!SESSION_ROUTE_PATTERN.test(pathname))
    return { _tag: 'pass' }

  const password = parseSessionPassword(rawPassword)
  if (password._tag === 'ready')
    return { _tag: 'pass' }

  const message = failureMessage(password)
  if (pathname === SESSION_ENDPOINT) {
    if (request.method === 'DELETE')
      return { _tag: 'clearSession' }
    return { _tag: 'emptySession', message }
  }
  return { _tag: 'unavailable', message, status: SESSION_UNAVAILABLE_STATUS }
}
