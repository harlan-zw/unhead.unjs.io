import { describe, expect, it } from 'vitest'
import {
  resolveSessionGuard,
  SESSION_PASSWORD_MIN_LENGTH,
} from '../layers/admin/server/utils/session-password'

const validPassword = 'a'.repeat(SESSION_PASSWORD_MIN_LENGTH)

describe('resolveSessionGuard', () => {
  it('keeps public pages available when the session secret is missing', () => {
    expect(resolveSessionGuard('/docs/vue/head', '')).toEqual({ _tag: 'pass' })
  })

  it('returns an empty session instead of sealing a cookie with an empty password', () => {
    expect(resolveSessionGuard('/api/_auth/session', '')._tag).toBe('emptySession')
  })

  it('makes sign-in unavailable when the session secret is missing', () => {
    expect(resolveSessionGuard('/auth/github', '')._tag).toBe('unavailable')
  })

  it.each([
    '/admin',
    '/api/admin/tool-analytics',
  ])('protects session-consuming admin route %s', (path) => {
    expect(resolveSessionGuard(path, '')._tag).toBe('unavailable')
  })

  it('passes session requests when the secret meets the encryption minimum', () => {
    expect(resolveSessionGuard('/api/_auth/session', validPassword)).toEqual({ _tag: 'pass' })
  })

  it('rejects a configured secret that is too short', () => {
    const guard = resolveSessionGuard('/auth/github', 'short')
    expect(guard._tag).toBe('unavailable')
    if (guard._tag === 'unavailable')
      expect(guard.message).toContain('5 characters')
  })
})
