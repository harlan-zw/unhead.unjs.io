import { getHeader } from 'h3'
import { parseURL } from 'ufo'
import { z } from 'zod'
import { CommentFeedbackSchema } from '~~/types/schemas'
import { feedback } from '../database/schema'
import { getDB } from '../utils/db'

const BodySchema = CommentFeedbackSchema.extend({
  toolId: z.string().optional(),
})

const LeadingSlashPattern = /^\/+/

export default defineEventHandler(async (e) => {
  const body = await readValidatedBody(e, BodySchema.safeParse)
  if (!body.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  const { comment, toolId } = body.data
  const referrer = parseURL(getHeader(e, 'Referer') || '').pathname
  const path = toolId ? `/tools/${toolId}` : referrer.replace(LeadingSlashPattern, '')

  const db = getDB(e)
  await db.insert(feedback).values({ path, comment })

  return { ok: true }
})
