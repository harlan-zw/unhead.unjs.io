import { desc, sql } from 'drizzle-orm'
import { toolLookups } from '~~/server/database/schema'
import { getDB } from '~~/server/utils/db'
import { requireAdminAuth } from '../../utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)
  const db = getDB(event)

  const [lookups, stats, total] = await Promise.all([
    db.select().from(toolLookups).orderBy(desc(toolLookups.createdAt)).limit(100),
    db.select({
      tool: toolLookups.tool,
      count: sql<number>`count(*)`.as('count'),
    }).from(toolLookups).groupBy(toolLookups.tool),
    db.select({ count: sql<number>`count(*)`.as('count') }).from(toolLookups).get(),
  ])

  const statsByTool = Object.fromEntries(
    stats.map(s => [s.tool, s.count]),
  ) as Record<string, number>

  return {
    lookups,
    stats: statsByTool,
    total: total?.count || 0,
  }
})
