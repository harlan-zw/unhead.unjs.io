import type { RequestEvent } from 'nuxt/server'
import { describe, expect, it } from 'vitest'
import {
  resolveSessionGuard,
  SESSION_PASSWORD_MIN_LENGTH,
} from '../layers/admin/server/utils/session-password'
import { clearUnavailableSession } from '../layers/admin/server/utils/unavailable-session'

const validPassword = 'a'.repeat(SESSION_PASSWORD_MIN_LENGTH)

describe('resolveSessionGuard', () => {
  it('keeps public pages available when the session secret is missing', () => {
    expect(resolveSessionGuard({ method: 'GET', path: '/docs/vue/head' }, '')).toEqual({ _tag: 'pass' })
  })

  it('returns an empty session instead of sealing a cookie with an empty password', () => {
    expect(resolveSessionGuard({ method: 'GET', path: '/api/_auth/session' }, '')._tag).toBe('emptySession')
  })

  it('clears the session cookie when logout cannot read the session', () => {
    expect(resolveSessionGuard({ method: 'DELETE', path: '/api/_auth/session' }, '')).toEqual({ _tag: 'clearSession' })
  })

  it('makes sign-in unavailable when the session secret is missing', () => {
    expect(resolveSessionGuard({ method: 'GET', path: '/auth/github' }, '')._tag).toBe('unavailable')
  })

  it.each([
    '/admin',
    '/api/admin/tool-analytics',
  ])('protects session-consuming admin route %s', (path) => {
    expect(resolveSessionGuard({ method: 'GET', path }, '')._tag).toBe('unavailable')
  })

  // A missing secret is a deployment choice, not a server fault. Sentry's Nitro
  // handler reports any H3 error from 500 up, so a scanner hitting /admin/.env
  // used to file a production error on every probe.
  it.each([
    '/admin/.env',
    '/admin',
    '/auth/github',
    '/api/admin/tool-analytics',
  ])('answers %s with a status Sentry does not report', (path) => {
    const guard = resolveSessionGuard({ method: 'GET', path }, '')
    if (guard._tag !== 'unavailable')
      throw new Error(`expected ${path} to be unavailable`)
    expect(guard.status).toBe(404)
  })

  it('passes session requests when the secret meets the encryption minimum', () => {
    expect(resolveSessionGuard({ method: 'GET', path: '/api/_auth/session' }, validPassword)).toEqual({ _tag: 'pass' })
  })

  it('rejects a configured secret that is too short', () => {
    const guard = resolveSessionGuard({ method: 'GET', path: '/auth/github' }, 'short')
    expect(guard._tag).toBe('unavailable')
    if (guard._tag === 'unavailable')
      expect(guard.message).toContain('5 characters')
  })
})

describe('clearUnavailableSession', () => {
  it('expires the configured session cookie without reading the password', async () => {
    const responseHeaders = new Headers()
    const event = {
      req: new Request('https://unhead.unjs.io/api/_auth/session', {
        method: 'DELETE',
        headers: { cookie: 'nuxt-auth-session=existing-session' },
      }),
      res: { headers: responseHeaders },
    } as RequestEvent
    const result = await clearUnavailableSession(event, {
      cookie: {
        sameSite: 'lax',
        secure: true,
      },
    })
    expect(result).toEqual({ loggedOut: true })
    expect(responseHeaders.get('set-cookie')).toContain('nuxt-auth-session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax')
  })
})
