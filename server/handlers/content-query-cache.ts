/// <reference types="@cloudflare/workers-types" />

import type { H3Event } from 'h3'
import { checksums } from '#content/manifest'
import originalHandler from '#unhead-content-query-original'
import { CONTENT_QUERY_CACHE_NAME, createCachedContentQueryHandler } from '../utils/content-query-cache'

// The generated `#content/manifest` template types `checksums` from its JSON
// literal, which carries no index signature. Queries name collections
// dynamically, so widen it at this one boundary.
const contentChecksums = checksums as unknown as Record<string, string | undefined>

/**
 * Nitro handler for `/__nuxt_content/docsUnhead/query` and
 * `/__nuxt_content/docsUnheadV2/query`. nuxt.config.ts captures the Nuxt
 * Content registration, points `#unhead-content-query-original` at it, and
 * swaps both routes to this module.
 */
export default createCachedContentQueryHandler({
  original: event => originalHandler(event),
  resolveChecksum: collection => contentChecksums[collection],
  resolveDeployment: event => useRuntimeConfig(event).checkinDeployment || '',
  openCache: async () => {
    // Cloudflare Cache API. Environments without it (prerender, plain Node)
    // get no adapter and the handler delegates uncached.
    if (typeof caches === 'undefined')
      return undefined
    return caches.open(CONTENT_QUERY_CACHE_NAME)
  },
  waitUntil: (event: H3Event, promise: Promise<unknown>) => {
    const nitroWaitUntil = (event as unknown as { waitUntil?: (promise: Promise<unknown>) => void }).waitUntil
    if (nitroWaitUntil) {
      nitroWaitUntil(promise)
      return
    }
    // Nitro spreads the worker's `_platform` into the event context; the
    // Cloudflare execution context carries waitUntil there. If neither
    // exists the runtime cannot run background work, so dropping the
    // refresh is the only option.
    const cloudflareContext = (event.context.cloudflare as { context?: { waitUntil?: (promise: Promise<unknown>) => void } } | undefined)?.context
    cloudflareContext?.waitUntil?.(promise)
  },
})
