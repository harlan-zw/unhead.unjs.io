/// <reference types="@cloudflare/workers-types" />
import type { RequestEvent } from 'nuxt/server'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../database/schema'

export { schema }

export function getDB(event: Pick<RequestEvent, 'context'> & { req?: object }) {
  const request = event.req as { runtime?: { cloudflare?: { env?: { DB?: D1Database } } } } | undefined
  const legacyContext = event.context.cloudflare as { env?: { DB?: D1Database } } | undefined
  const db = request?.runtime?.cloudflare?.env?.DB ?? legacyContext?.env?.DB

  if (!db) {
    throw new Error('D1 database binding not available')
  }

  return drizzle(db)
}
