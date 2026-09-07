/// <reference types="@cloudflare/workers-types" />

import { setCloudflareBindings } from '@harlan-zw/nuxt-cloudflare/bindings'
import { createWideEvent } from '@harlan-zw/nuxt-wide-events/standalone'
import wsAdapter from 'crossws/adapters/cloudflare'
import { useNitroApp } from 'nitropack/runtime'
import { requestHasBody, runCronTasks } from 'nitropack/runtime/internal'
import { isPublicAssetURL } from '#nitro-internal-virtual/public-assets'
import {
  CLOUDFLARE_RESPONSE_CACHE_NAME,
  getCloudflareResponseCacheRule,
  handleCloudflareResponseCache,
} from './utils/cloudflare-response-cache'
import { wrapD1WithRetry } from './utils/d1-retry'
import '#nitro-internal-pollyfills'

const nitroApp = useNitroApp()
const ws = import.meta._websocket ? wsAdapter(nitroApp.h3App.websocket) : undefined

function withD1Retry(env: Cloudflare.Env): Cloudflare.Env {
  const db = (env as { DB?: D1Database }).DB
  if (!db)
    return env
  return { ...env, DB: wrapD1WithRetry(db) } as Cloudflare.Env
}

export default {
  async fetch(request: Request, env: Cloudflare.Env, context: ExecutionContext) {
    if (import.meta._websocket && request.headers.get('upgrade') === 'websocket')
      return ws!.handleUpgrade(request, env, context)

    const url = new URL(request.url)
    if (env.ASSETS && isPublicAssetURL(url.pathname))
      return env.ASSETS.fetch(request)

    let body: Buffer | undefined
    if (requestHasBody(request))
      body = Buffer.from(await request.arrayBuffer())

    const bindings = withD1Retry(env)
    setCloudflareBindings(bindings)
    const render = () => nitroApp.localFetch(url.pathname + url.search, {
      body,
      context: {
        waitUntil: (promise: Promise<unknown>) => context.waitUntil(promise),
        _platform: {
          cf: request.cf,
          cloudflare: { request, env: bindings, context },
        },
      },
      headers: request.headers,
      host: url.hostname,
      method: request.method,
      protocol: url.protocol,
    })

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
    if (import.meta._tasks) {
      const bindings = withD1Retry(env)
      setCloudflareBindings(bindings)
      context.waitUntil(
        runCronTasks(event.cron, {
          context: {
            cloudflare: { env: bindings, context },
          },
          payload: {},
        }),
      )
    }
  },
} satisfies ExportedHandler<Cloudflare.Env>
