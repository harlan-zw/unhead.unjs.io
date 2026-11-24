import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// Some unit tests import app composables directly. These aliases resolve the
// Nuxt import shorthands they use without paying for a Nuxt build.
const rootDir = import.meta.dirname

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: '#unhead-cloudflare-pages-runtime', replacement: resolve(rootDir, 'node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-pages.mjs') },
      { find: /^~~(?=\/|$)/, replacement: rootDir },
      { find: /^~(?=\/|$)/, replacement: resolve(rootDir, 'app') },
      { find: /^#imports$/, replacement: resolve(rootDir, '.nuxt/imports') },
    ],
  },
  test: {
    server: { deps: { inline: [/\/nitro\//, /\/crossws\//] } },
    exclude: [
      '**/.data/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/dist/**',
      '**/node_modules/**',
      'tests/**/*.e2e.test.ts',
    ],
    include: ['tests/**/*.test.ts'],
  },
})
