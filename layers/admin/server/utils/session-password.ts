export const SESSION_PASSWORD_MIN_LENGTH = 32

const SESSION_ENDPOINT = '/api/_auth/session'
const SESSION_ROUTE_PATTERN = /^\/(?:api\/(?:_auth|admin)|auth|admin)(?:\/|$)/

type SessionPassword
  = | { _tag: 'ready' }
    | { _tag: 'missing' }
    | { _tag: 'tooShort', length: number }

export type SessionGuard
  = | { _tag: 'pass' }
    | { _tag: 'emptySession', message: string }
    | { _tag: 'unavailable', message: string }

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

export function resolveSessionGuard(path: string, rawPassword: unknown): SessionGuard {
  const pathname = path.split('?')[0] || '/'
  if (!SESSION_ROUTE_PATTERN.test(pathname))
    return { _tag: 'pass' }

  const password = parseSessionPassword(rawPassword)
  if (password._tag === 'ready')
    return { _tag: 'pass' }

  const message = failureMessage(password)
  if (pathname === SESSION_ENDPOINT)
    return { _tag: 'emptySession', message }
  return { _tag: 'unavailable', message }
}
