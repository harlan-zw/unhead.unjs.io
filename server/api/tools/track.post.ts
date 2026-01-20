import { z } from 'zod'
import { trackToolLookup, trackToolUsage } from '~~/server/utils/analytics'

const schema = z.object({
  tool: z.enum(['meta-tag-generator', 'schema-generator']),
  action: z.enum(['view', 'use', 'copy', 'reset', 'preset']),
  label: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid request' })
  }

  const { tool, action, label } = parsed.data

  // Set session cookie if not exists
  if (!getCookie(event, 'analytics-session')) {
    setCookie(event, 'analytics-session', crypto.randomUUID(), {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    })
  }

  // Track to Analytics Engine (real-time)
  trackToolUsage(event, tool, action, { label })

  // Track to D1 database (queryable)
  trackToolLookup(event, tool, action, label).catch(() => {})

  return { ok: true }
})
