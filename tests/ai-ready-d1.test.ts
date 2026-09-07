import { describe, expect, it } from 'vitest'
import { databaseNeedsCreating } from '../scripts/ensure-d1-database.mjs'

describe('ensure-d1-database', () => {
  it('creates a database the account is missing', () => {
    expect(databaseNeedsCreating([{ name: 'unhead-unjs-io' }], 'unhead-ai-ready')).toBe(true)
  })

  it('skips a database the account already has', () => {
    expect(databaseNeedsCreating([{ name: 'unhead-ai-ready' }], 'unhead-ai-ready')).toBe(false)
  })
})
