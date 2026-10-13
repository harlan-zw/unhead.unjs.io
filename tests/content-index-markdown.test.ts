import { beforeEach, describe, expect, it, vi } from 'vitest'

const { query } = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock('@nuxt/content/server', () => ({ queryCollection: query }))
vi.stubGlobal('defineNitroPlugin', (plugin: unknown) => plugin)
const { default: install } = await import('../server/plugins/ai-ready-content-source')

describe('ordinary Content bodies during page indexing', () => {
  beforeEach(() => {
    query.mockReset()
    query.mockReturnValue({ path: () => ({ first: async () => ({
      title: 'Installation',
      description: 'Install Schema.org',
      body: { value: [['p', {}, 'npm install @unhead/schema-org'], ['p', {}, 'pnpm add @unhead/schema-org']] },
    }) }) })
  })

  async function convert(route: string, event: unknown = {}) {
    const hooks = new Map<string, (context: any) => Promise<void>>()
    install({ hooks: { hook: (name: string, callback: (context: any) => Promise<void>) => hooks.set(name, callback) } } as any)
    const context = { route, event, markdown: 'Only the visible installation tab' }
    await hooks.get('ai-ready:page:markdown')?.(context)
    return context.markdown
  }

  it('stores installation commands from hidden tabs too', async () => {
    expect(await convert('/docs/vue/schema-org/guides/get-started/installation')).toContain('pnpm add @unhead/schema-org')
  })

  it('keeps rendered research tables instead of raw component references', async () => {
    expect(await convert('/learn/research/state-of-head-2026')).toBe('Only the visible installation tab')
  })

  it('preserves HTML conversion when Content cannot use a request event', async () => {
    expect(await convert('/docs/vue/schema-org/guides/get-started/installation', null)).toBe('Only the visible installation tab')
  })
})
