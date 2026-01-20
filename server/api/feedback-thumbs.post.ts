import type { ThumbsFeedbackResponse } from '~~/types/schemas'
import { sql } from 'drizzle-orm'
import { getHeader } from 'h3'
import { parseURL } from 'ufo'
import { ThumbsFeedbackSchema } from '~~/types/schemas'
import { feedback } from '../database/schema'
import { useDB } from '../utils/db'

export default defineEventHandler<Promise<ThumbsFeedbackResponse>>(async (e) => {
  const body = await readValidatedBody(e, ThumbsFeedbackSchema.safeParse)
  if (!body.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  const { thumbs, toolId } = body.data
  const referrer = parseURL(getHeader(e, 'Referer') || '').pathname
  const path = toolId ? `/tools/${toolId}` : referrer.replace(/^\/+/, '')

  const db = useDB(e)
  await db.insert(feedback).values({ path, thumb: thumbs })

  const stats = await db
    .select({
      up: sql<number>`sum(case when thumb = 'up' then 1 else 0 end)`,
      down: sql<number>`sum(case when thumb = 'down' then 1 else 0 end)`,
    })
    .from(feedback)
    .where(sql`path = ${path} and thumb is not null`)
    .get()

  return {
    thumbs,
    stats: { up: stats?.up || 0, down: stats?.down || 0 },
  }
})
