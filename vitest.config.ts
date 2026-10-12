import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

// Some unit tests import app composables directly. These aliases resolve the
// Nuxt import shorthands they use without paying for a Nuxt build.
const rootDir = import.meta.dirname

export default defineConfig({
  resolve: {
    alias: [
      { find: /^~~(?=\/|$)/, replacement: rootDir },
      { find: /^~(?=\/|$)/, replacement: resolve(rootDir, 'app') },
      { find: /^#imports$/, replacement: resolve(rootDir, '.nuxt/imports') },
    ],
  },
  test: {
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
