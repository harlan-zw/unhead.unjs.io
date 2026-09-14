import { runChecks } from '@harlan-zw/nuxt-checkin/server'
import { queryCollection } from '@nuxt/content/server'
import checks from '#checkin/checks'
import { requireAdminAuth } from '../../utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const config = useRuntimeConfig(event)
  return runChecks(checks, {
    event: { context: event.context, readContent: (collection: 'docsUnhead' | 'docsUnheadV2') => queryCollection(event, collection).first() },
    required: ['unhead.docs-v3', 'unhead.docs-v2', 'unhead.ai-ready'],
    identity: { site: 'unhead.unjs.io', environment: 'production', deployment: config.checkinDeployment || 'unknown' },
    timeoutMs: 10_000,
    totalTimeoutMs: 15_000,
  })
})
