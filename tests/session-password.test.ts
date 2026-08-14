import { createServer } from 'node:http'
import { createApp, eventHandler, toNodeListener } from 'h3'
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
    const app = createApp()
    app.use(eventHandler(event => clearUnavailableSession(event, {
      cookie: {
        sameSite: 'lax',
        secure: true,
      },
    })))
    const server = createServer(toNodeListener(app))

    await new Promise<void>((resolve, reject) => {
      server.once('error', reject)
      server.listen(0, '127.0.0.1', resolve)
    })

    try {
      const address = server.address()
      if (!address || typeof address === 'string')
        throw new Error('Test server did not expose a TCP port.')

      const response = await fetch(`http://127.0.0.1:${address.port}`, {
        headers: { cookie: 'h3=existing-session' },
      })

      expect(await response.json()).toEqual({ loggedOut: true })
      expect(response.headers.get('set-cookie')).toContain('h3=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax')
    }
    finally {
      await new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve())
      })
    }
  })
})
