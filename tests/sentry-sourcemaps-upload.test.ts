import type { Nuxt } from '@nuxt/schema'
import { loadNuxt } from '@nuxt/kit'
import { beforeAll, describe, expect, it } from 'vitest'

// Every Sentry release for this site held zero artifacts because the upload
// plugins never ran: @sentry/nuxt/module installs them only when a
// sentry.client.config.* file exists, and only receives org, project, release,
// and the auth token when @harlan-zw/nuxt-sentry has already written
// nuxt.options.sentry. Load the real app the way a production build does and
// assert that wiring, so the deploy uploads maps again.
let nuxt: Nuxt

beforeAll(async () => {
  const saved = {
    token: process.env.SENTRY_AUTH_TOKEN,
    release: process.env.SENTRY_RELEASE,
  }
  process.env.SENTRY_AUTH_TOKEN = 'source-map-wiring-test-token'
  process.env.SENTRY_RELEASE = 'source-map-wiring-test-release'
  try {
    nuxt = await loadNuxt({ cwd: process.cwd(), dev: false, ready: true })
  }
  finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined)
        delete process.env[key === 'token' ? 'SENTRY_AUTH_TOKEN' : 'SENTRY_RELEASE']
      else if (key === 'token')
        process.env.SENTRY_AUTH_TOKEN = value
      else
        process.env.SENTRY_RELEASE = value
    }
  }
}, 240_000)

// Deliberately no nuxt.close(): its Sentry hook deletes files matching
// sourcemaps.filesToDeleteAfterUpload from the working directory, and no build
// ran here that produced artifacts worth deleting.

// addVitePlugin registers a vite:extend hook rather than writing
// nuxt.options.vite.plugins, so the plugin only exists once that hook runs
// against a config. Invoke it the way the Vite builder does, with the config
// sections other registered handlers expect to find.
async function vitePluginNames(app: Nuxt): Promise<string[]> {
  const config = {
    plugins: [] as unknown[],
    vue: { template: { compilerOptions: {} } },
  }
  await app.callHook('vite:extend', { config })
  const names: string[] = []
  function walk(plugins: unknown[]): void {
    for (const plugin of plugins) {
      if (Array.isArray(plugin))
        walk(plugin)
      else if (plugin && typeof plugin === 'object' && typeof (plugin as { name?: unknown }).name === 'string')
        names.push((plugin as { name: string }).name)
    }
  }
  walk(config.plugins)
  return names
}

describe('sentry source map upload wiring', () => {
  it('registers the Sentry vite plugin that uploads build artifacts', async () => {
    expect(await vitePluginNames(nuxt)).toContain('sentry-vite-plugin')
  })

  it('keeps the client release maps hidden so they are uploaded, not shipped', () => {
    expect(nuxt.options.sourcemap.client).toBe('hidden')
  })

  it('installs @harlan-zw/nuxt-sentry before @sentry/nuxt/module so the upload receives org, project, and release', () => {
    const modules = nuxt.options.modules.map(module => Array.isArray(module) ? module[0] : module)
    const nuxtSentry = modules.indexOf('@harlan-zw/nuxt-sentry')
    const sentryModule = modules.indexOf('@sentry/nuxt/module')
    expect(nuxtSentry).toBeGreaterThan(-1)
    expect(sentryModule).toBeGreaterThan(-1)
    expect(nuxtSentry).toBeLessThan(sentryModule)
  })
})
