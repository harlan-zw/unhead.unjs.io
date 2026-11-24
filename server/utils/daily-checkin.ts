import type { H3Event } from 'h3'
import { runChecks } from '@harlan-zw/nuxt-checkin/server'
import { queryCollection } from '@nuxt/content/server'
import { useRuntimeConfig } from 'nuxt/server'
import checks from '#checkin/checks'

export function runDailyCheckin(event: H3Event) {
  const config = useRuntimeConfig()
  // Nitro's bridge adds the request fetch that this Nuxt Content version reads.
  const contentEvent = event as unknown as Parameters<typeof queryCollection>[0]
  return runChecks(checks, {
    event: { context: event.context, readContent: (collection: 'docsUnhead' | 'docsUnheadV2') => queryCollection(contentEvent, collection).first() },
    required: ['unhead.docs-v3', 'unhead.docs-v2', 'unhead.ai-ready'],
    identity: { site: 'unhead.unjs.io', environment: 'production', deployment: config.checkinDeployment || 'unknown' },
    timeoutMs: 10_000,
    totalTimeoutMs: 15_000,
  })
}
