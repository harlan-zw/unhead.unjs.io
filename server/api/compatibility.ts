import { resolveCloudflareBindings } from '@harlan-zw/nuxt-cloudflare/bindings'
import { defineEventHandler } from 'h3'

export default defineEventHandler((e) => {
  return {
    ASSETS: !!resolveCloudflareBindings<{ ASSETS?: unknown }>(e)?.ASSETS,
  }
})
