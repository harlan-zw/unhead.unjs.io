import type { RequestEvent, SessionConfig } from 'nuxt/server'
import { deleteCookie } from 'nuxt/server'

export type SessionCookieConfig = Pick<Partial<SessionConfig>, 'cookie' | 'name'>

export async function clearUnavailableSession(
  event: RequestEvent,
  config: SessionCookieConfig,
): Promise<{ loggedOut: true }> {
  deleteCookie(event, config.name ?? 'nuxt-auth-session', {
    httpOnly: true,
    path: '/',
    secure: true,
    ...config.cookie,
  })
  return { loggedOut: true }
}
