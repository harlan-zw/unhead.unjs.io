/// <reference types="@cloudflare/workers-types" />
import type { H3Event } from 'h3'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../database/schema'

export { schema }

export function useDB(event: H3Event) {
  const db = (event.context.cloudflare?.env as { DB?: D1Database } | undefined)?.DB

  if (!db) {
    throw new Error('D1 database binding not available')
  }

  return drizzle(db, { schema })
}
