import { createApp, toWebHandler } from 'h3'
import { describe, expect, it } from 'vitest'
import redirects from '../server/middleware/redirects'

const app = createApp()
app.use(redirects)
const request = toWebHandler(app)

function redirectFor(path: string) {
  return request(new Request(`https://unhead.unjs.io${path}`))
}

describe('redirects middleware', () => {
  it.each([
    ['/api/use-head', '/docs/head/api/composables/use-head'],
    ['/api/use-seo-meta', '/docs/head/api/composables/use-seo-meta'],
    ['/api/use-head-safe', '/docs/head/api/composables/use-head-safe'],
    ['/api/use-script', '/docs/head/api/composables/use-script'],
    ['/integrations/vue/vitesse', '/docs/vue/head/guides/get-started/installation'],
    ['/guide/getting-started/how-it-works', '/docs/head/guides/get-started/intro-to-unhead'],
    ['/setup/unhead/introduction', '/docs/head/guides/get-started/intro-to-unhead'],
    ['/docs/head/guides/reactivity', '/docs/vue/head/guides/core-concepts/reactivity-and-context'],
    ['/docs/typescript/head/api/hooks/dom-rendered', '/docs/head/api/composables/use-head'],
    ['/v2', '/docs/releases/v2'],
    ['/v3', '/docs/releases/v3'],
    ['/setup/vue/installation', '/docs/vue/head/guides/get-started/installation'],
    ['/setup/unhead/installation', '/docs/typescript/head/guides/get-started/installation'],
    ['/usage/composables/use-script', '/docs/head/api/composables/use-script'],
    ['/usage/composables/use-head', '/docs/head/api/composables/use-head'],
    ['/usage/composables/use-seo-meta', '/docs/head/api/composables/use-seo-meta'],
    ['/usage/composables/use-head-safe', '/docs/head/api/composables/use-head-safe'],
    ['/schema-org/schema/article', '/docs/schema-org/api/schema/article'],
    ['/schema-org/getting-started/setup', '/docs/vue/schema-org/guides/get-started/installation'],
    ['/guide/getting-started/installation', '/docs/vue/head/guides/get-started/installation'],
    ['/guide/guides/identity', '/docs/schema-org/guides/recipes/identity'],
    ['/docs/api/use-head', '/docs/head/api/composables/use-head'],
    ['/usage/guides/sorting', '/docs/head/guides/core-concepts/positions'],
    ['/docs/head/guides/core-concepts/streaming', '/docs/typescript/head/guides/core-concepts/streaming'],
  ])('recovers the legacy URL %s in one permanent redirect', async (from, to) => {
    const res = await redirectFor(`${from}/?utm_source=docs`)
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe(`${to}?utm_source=docs`)
  })

  it('redirects the removed debugging guide to the guides overview', async () => {
    const res = await redirectFor('/docs/head/guides/debugging')
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('/docs/head/guides/get-started/overview')
  })

  it('redirects the trailing-slash variant of the debugging guide', async () => {
    const res = await redirectFor('/docs/head/guides/debugging/')
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('/docs/head/guides/get-started/overview')
  })

  it('preserves the query string on the debugging redirect', async () => {
    const res = await redirectFor('/docs/head/guides/debugging?utm_source=release-notes&utm_medium=docs')
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('/docs/head/guides/get-started/overview?utm_source=release-notes&utm_medium=docs')
  })

  it('still redirects the legacy typescript migration guide', async () => {
    const res = await redirectFor('/docs/typescript/head/guides/get-started/migration')
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('/docs/migration-guide/v3')
  })

  it('leaves existing docs pages alone', async () => {
    const res = await redirectFor('/docs/head/guides/get-started/overview')
    expect(res.status).toBe(404)
    expect(res.headers.get('location')).toBeNull()
  })
})
