import { describe, expect, it } from 'vitest'

const origin = process.env.MARKDOWN_BASE_URL || 'http://127.0.0.1:3457'

describe('public Markdown representations', () => {
  it.each([
    ['/learn/research/capo-performance-research', [
      'Impact of Head Ordering',
      'Heavy Head (30+ tags)',
      'The Nuxt Paradox: LCP vs Head Optimization',
      'LCP Trend: 8 Months',
      '522.5',
      '3051',
      '1608',
    ]],
    ['/learn/research/state-of-head-2026', [
      'Framework Head Health (2026 Audit)',
      'Open Graph Tag Presence by Framework',
      'The Head-Breaker Prevalence',
      '37.5',
      '73.3',
      '54.9',
    ]],
  ])('includes rendered research data at %s', async (path, values) => {
    const response = await fetch(`${origin}${path}.md`)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/markdown')
    const markdown = await response.text()
    for (const value of values)
      expect(markdown).toContain(value)
  })

  it('preserves installation commands from every documentation tab', async () => {
    const response = await fetch(`${origin}/docs/vue/schema-org/guides/get-started/installation.md`)
    expect(response.status).toBe(200)
    const markdown = await response.text()
    for (const command of ['npm install', 'pnpm add', 'yarn add'])
      expect(markdown).toContain(`${command} @unhead/schema-org`)
  })
})
