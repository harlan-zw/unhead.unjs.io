import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      '**/.data/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/dist/**',
      '**/node_modules/**',
    ],
    include: ['tests/**/*.e2e.test.ts'],
  },
})
