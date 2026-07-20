/// <reference types="@cloudflare/workers-types" />

import wsAdapter from 'crossws/adapters/cloudflare'
import { useNitroApp } from 'nitropack/runtime'
import { requestHasBody, runCronTasks } from 'nitropack/runtime/internal'
import { isPublicAssetURL } from '#nitro-internal-virtual/public-assets'
import {
  CLOUDFLARE_RESPONSE_CACHE_NAME,
  getCloudflareResponseCacheRule,
  handleCloudflareResponseCache,
} from './utils/cloudflare-response-cache'
import '#nitro-internal-pollyfills'

const nitroApp = useNitroApp()
const ws = import.meta._websocket ? wsAdapter(nitroApp.h3App.websocket) : undefined

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

    globalThis.__env__ = env
    const render = () => nitroApp.localFetch(url.pathname + url.search, {
      body,
      context: {
        waitUntil: (promise: Promise<unknown>) => context.waitUntil(promise),
        _platform: {
          cf: request.cf,
          cloudflare: { request, env, context },
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
    catch (error) {
      console.warn(JSON.stringify({
        message: 'Cloudflare response cache unavailable',
        path: new URL(request.url).pathname,
        error: error instanceof Error ? error.message : String(error),
      }))
      return render()
    }
  },
  scheduled(event: ScheduledController, env: Cloudflare.Env, context: ExecutionContext) {
    if (import.meta._tasks) {
      globalThis.__env__ = env
      context.waitUntil(
        runCronTasks(event.cron, {
          context: {
            cloudflare: { env, context },
          },
          payload: {},
        }),
      )
    }
  },
} satisfies ExportedHandler<Cloudflare.Env>
