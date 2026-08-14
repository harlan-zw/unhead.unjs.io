import type { H3Event, SessionConfig } from 'h3'
import { deleteCookie } from 'h3'

export type SessionCookieConfig = Pick<Partial<SessionConfig>, 'cookie' | 'name'>

export async function clearUnavailableSession(
  event: H3Event,
  config: SessionCookieConfig,
): Promise<{ loggedOut: true }> {
  if (config.cookie !== false) {
    deleteCookie(event, config.name ?? 'h3', {
      httpOnly: true,
      path: '/',
      secure: true,
      ...config.cookie,
    })
  }
  return { loggedOut: true }
}
