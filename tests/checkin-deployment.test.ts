import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

it.each([
  { deployment: 'deployed-head-a', pages: '', expected: 'deployed-head-a' },
  { deployment: 'deployed-head-a', pages: 'stale-pages-head', expected: 'deployed-head-a' },
  { deployment: '', pages: 'pages-head', expected: 'pages-head' },
  { deployment: '', pages: '', expected: '' },
])('binds report identity to the deployed checkout: $expected', async ({ deployment, pages, expected }) => {
  vi.stubEnv('NUXT_CHECKIN_DEPLOYMENT', deployment)
  vi.stubEnv('CF_PAGES_COMMIT_SHA', pages)
  vi.stubEnv('GITHUB_SHA', 'default-tip-b')
  vi.stubEnv('SENTRY_RELEASE', 'deployed-head-a')

  // Reload the actual Nuxt config because deployment identity is captured at build time.
  const { default: config } = await import('../nuxt.config')
  expect(config.runtimeConfig?.checkinDeployment).toBe(expected)
})
