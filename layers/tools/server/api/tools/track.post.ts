import { createWideEvent } from '@harlan-zw/nuxt-wide-events/standalone'
import { z } from 'zod'
import { getOrCreateAnalyticsSession, trackToolLookup, trackToolUsage } from '~~/server/utils/analytics'
import { checkFreeToolRateLimit } from '~~/server/utils/rate-limit'

const schema = z.object({
  tool: z.enum(['meta-tag-generator', 'schema-generator', 'og-image-generator', 'capo-analyzer']),
  action: z.enum(['view', 'use', 'copy', 'reset', 'preset', 'download']),
  label: z.string().trim().max(100).optional(),
  outcome: z.enum(['success', 'error']).optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    throw createError({ statusCode: 400, message: 'Invalid request' })
  }

  await checkFreeToolRateLimit(event)
  const { tool, action, label, outcome } = parsed.data
  const sessionId = getOrCreateAnalyticsSession(event)

  // Track to Analytics Engine (real-time)
  try {
    trackToolUsage(event, tool, action, { label, error: outcome === 'error' }, sessionId)
  }
  catch {
    addWideEventFields(event, {
      'toolTracking.analyticsEngineWriteFailed': true,
    })
  }

  // Track to D1 database (queryable)
  event.waitUntil(trackToolLookup(event, tool, action, label, sessionId).catch(() => {
    const failure = createWideEvent({
      'toolTracking.d1WriteFailed': true,
    })
    failure.setLevel('error')
    failure.emit()
  }))

  return { ok: true }
})
