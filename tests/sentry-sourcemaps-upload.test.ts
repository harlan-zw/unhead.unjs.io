import type { Nuxt } from '@nuxt/schema'
import type { Plugin, PluginOption } from 'vite'
import { runInNewContext } from 'node:vm'
import { loadNuxt } from '@nuxt/kit'
import { build } from 'vite'
import { beforeAll, describe, expect, it } from 'vitest'

let nuxt: Nuxt

beforeAll(async () => {
  const saved = {
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_RELEASE: process.env.SENTRY_RELEASE,
  }
  process.env.SENTRY_AUTH_TOKEN = 'source-map-wiring-test-token'
  process.env.SENTRY_RELEASE = 'source-map-wiring-test-release'
  try {
    nuxt = await loadNuxt({
      cwd: process.cwd(),
      dev: false,
      ready: true,
    })
  }
  finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined)
        delete process.env[key]
      else
        process.env[key] = value
    }
  }
}, 240_000)

// No Nuxt build ran. Its close hook would delete existing app source maps.
async function clientChunkTransforms(app: Nuxt): Promise<Plugin[]> {
  const config = {
    plugins: [] as PluginOption[],
    vue: {
      template: { compilerOptions: {} },
    },
  }
  await app.callHook('vite:extend', { nuxt: app, config })
  await app.callHook('vite:extendConfig', config, { isClient: true, isServer: false })
  const transforms: Plugin[] = []
  async function collect(plugins: PluginOption[]): Promise<void> {
    for (const option of plugins) {
      const plugin = await option
      if (Array.isArray(plugin)) {
        await collect(plugin)
      }
      else if (plugin && 'renderChunk' in plugin && plugin.renderChunk) {
        // Run the registered chunk transforms through Vite on a tiny fixture.
        // Exclude upload and cleanup hooks, which need real deployment credentials.
        transforms.push({
          name: `fixture-transform-${transforms.length}`,
          renderChunk: plugin.renderChunk,
          generateBundle: 'generateBundle' in plugin
            ? plugin.generateBundle
            : undefined,
        })
      }
    }
  }
  await collect(config.plugins)
  return transforms
}

describe('sentry source map upload wiring', () => {
  it('instruments client artifacts for Sentry source map uploads', async () => {
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      plugins: [
        {
          name: 'client-fixture',
          resolveId: id => id === 'client-fixture'
            ? '\0client-fixture'
            : undefined,
          load: id => id === '\0client-fixture'
            ? 'globalThis.fixtureValue = 42'
            : undefined,
        },
        ...await clientChunkTransforms(nuxt),
      ],
      build: {
        write: false,
        minify: false,
        sourcemap: 'hidden',
        rollupOptions: { input: 'client-fixture' },
      },
    })
    if ('close' in result)
      throw new Error('Expected client fixture output.')
    const outputs = Array.isArray(result)
      ? result
      : [result]
    const runtime = { fixtureValue: 0, _sentryDebugIds: {} }
    for (const output of outputs) {
      for (const artifact of output.output) {
        if (artifact.type === 'chunk')
          runInNewContext(artifact.code, runtime)
      }
    }
    expect(runtime.fixtureValue).toBe(42)
    expect(Object.values(runtime._sentryDebugIds)).toEqual(expect.arrayContaining([
      expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
    ]))
  })
})
