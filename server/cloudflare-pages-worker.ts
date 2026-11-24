/// <reference types="@cloudflare/workers-types" />

import { setCloudflareBindings } from '@harlan-zw/nuxt-cloudflare/bindings'
import { createWideEvent } from '@harlan-zw/nuxt-wide-events/standalone'
import { isPublicAssetURL } from '#nitro/virtual/public-assets'
import nitroWorker from '#unhead-cloudflare-pages-runtime'
import {
  CLOUDFLARE_RESPONSE_CACHE_NAME,
  getCloudflareResponseCacheRule,
  handleCloudflareResponseCache,
} from './utils/cloudflare-response-cache'
import { wrapD1WithRetry } from './utils/d1-retry'
import { extendRenderLifetime, getLeadingSlashRedirect } from './utils/worker-request'

function withD1Retry(env: Cloudflare.Env): Cloudflare.Env {
  const db = (env as { DB?: D1Database }).DB
  if (!db)
    return env
  return { ...env, DB: wrapD1WithRetry(db) } as Cloudflare.Env
}

export default {
  async fetch(request: Request, env: Cloudflare.Env, context: ExecutionContext) {
    if (import.meta._websocket && request.headers.get('upgrade') === 'websocket')
      return nitroWorker.fetch(request, env, context)

    const url = new URL(request.url)
    const canonical = getLeadingSlashRedirect(url)
    if (canonical)
      return Response.redirect(canonical.href, 301)

    if (env.ASSETS && isPublicAssetURL(url.pathname))
      return nitroWorker.fetch(request, env, context)

    const bindings = withD1Retry(env)
    setCloudflareBindings(bindings)
    const render = () => extendRenderLifetime(context, () => nitroWorker.fetch(request, bindings, context))

    const rule = getCloudflareResponseCacheRule(url.pathname)
    if (!rule || typeof caches === 'undefined')
      return render()

    try {
      const cache = await caches.open(CLOUDFLARE_RESPONSE_CACHE_NAME)
      return handleCloudflareResponseCache({ cache, context, render, request, rule })
    }
    catch {
      const event = createWideEvent({
        'cache.kind': 'response',
        'cache.operation': 'open',
        'cache.outcome': 'unavailable',
      })
      event.setLevel('warn')
      event.emit()
      return render()
    }
  },
  scheduled(event: ScheduledController, env: Cloudflare.Env, context: ExecutionContext) {
    const bindings = withD1Retry(env)
    setCloudflareBindings(bindings)
    return nitroWorker.scheduled(event, bindings, context)
  },
} satisfies ExportedHandler<Cloudflare.Env>
