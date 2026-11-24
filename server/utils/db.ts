/// <reference types="@cloudflare/workers-types" />
import type { H3Event } from 'h3'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../database/schema'

export { schema }

export function getDB(event: H3Event) {
  const request = (event as H3Event & {
    req?: { runtime?: { cloudflare?: { env?: { DB?: D1Database } } } }
  }).req
  const legacyContext = event.context.cloudflare as { env?: { DB?: D1Database } } | undefined
  const db = request?.runtime?.cloudflare?.env?.DB ?? legacyContext?.env?.DB

  if (!db) {
    throw new Error('D1 database binding not available')
  }

  return drizzle(db)
}
