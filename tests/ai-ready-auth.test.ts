import { hkdfSync } from 'node:crypto'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createRuntimeSyncToken } from '../scripts/ai-ready-auth'

describe('scheduler authentication', () => {
  it('uses the package CLI to derive the production runtime token', () => {
    const root = 'unhead-ai-ready-test-application-secret'
    const expected = Buffer.from(hkdfSync('sha256', root, 'nuxt', 'nuxt-ai-ready:runtime-sync', 32)).toString('hex')
    const result = createRuntimeSyncToken(root, { cwd: resolve(import.meta.dirname, '..'), env: process.env })
    expect(result).toEqual({ _tag: 'Ok', token: expected })
  })

  it.each([undefined, '', 'short'])('rejects an absent or short application secret', (root) => {
    const result = createRuntimeSyncToken(root, { cwd: resolve(import.meta.dirname, '..'), env: process.env })
    expect(result).toEqual({ _tag: 'Err', message: 'Set NUXT_APP_SECRET to the existing production application secret, with at least 32 characters.' })
  })
})
