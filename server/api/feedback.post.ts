import { getHeader } from 'h3'
import { parseURL } from 'ufo'
import { CommentFeedbackSchema, FeedbackContextSchema, ToolIdSchema } from '~~/types/schemas'
import { feedback } from '../database/schema'
import { getOrCreateAnalyticsSession } from '../utils/analytics'
import { getDB } from '../utils/db'
import { checkFreeToolRateLimit } from '../utils/rate-limit'

const BodySchema = CommentFeedbackSchema.extend({
  toolId: ToolIdSchema.optional(),
  context: FeedbackContextSchema.optional(),
})

const LeadingSlashPattern = /^\/+/

export default defineEventHandler(async (e) => {
  await checkFreeToolRateLimit(e)
  const body = await readValidatedBody(e, BodySchema.safeParse)
  if (!body.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  const { comment, toolId, context } = body.data
  const referrer = parseURL(getHeader(e, 'Referer') || '').pathname
  const path = (toolId ? `/tools/${toolId}` : referrer.replace(LeadingSlashPattern, '')).slice(0, 500)
  const sessionId = getOrCreateAnalyticsSession(e)

  const db = getDB(e)
  await db.insert(feedback).values({ path, comment, metadata: context, sessionId })

  return { ok: true }
})
