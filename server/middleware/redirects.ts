import { defineEventHandler, getRequestURL, sendRedirect } from 'h3'

// Keep inbound links from older docs layouts pointed at their current pages.
const legacyPages: Record<string, string> = {
  '/integrations/vue/vitesse': '/docs/vue/head/guides/get-started/installation',
  '/guide/getting-started/how-it-works': '/docs/head/guides/get-started/intro-to-unhead',
  '/setup/unhead/introduction': '/docs/head/guides/get-started/intro-to-unhead',
  '/docs/head/guides/reactivity': '/docs/vue/head/guides/core-concepts/reactivity-and-context',
  '/docs/typescript/head/api/hooks/dom-rendered': '/docs/head/api/composables/use-head',
  '/v2': '/docs/releases/v2',
  '/v3': '/docs/releases/v3',
  '/setup/vue/installation': '/docs/vue/head/guides/get-started/installation',
  '/setup/unhead/installation': '/docs/typescript/head/guides/get-started/installation',
  '/usage/composables/use-script': '/docs/head/api/composables/use-script',
  '/usage/composables/use-head': '/docs/head/api/composables/use-head',
  '/usage/composables/use-seo-meta': '/docs/head/api/composables/use-seo-meta',
  '/usage/composables/use-head-safe': '/docs/head/api/composables/use-head-safe',
  '/schema-org/schema/article': '/docs/schema-org/api/schema/article',
  '/schema-org/getting-started/setup': '/docs/vue/schema-org/guides/get-started/installation',
  '/guide/getting-started/installation': '/docs/vue/head/guides/get-started/installation',
  '/guide/guides/identity': '/docs/schema-org/guides/recipes/identity',
  '/docs/api/use-head': '/docs/head/api/composables/use-head',
  '/usage/guides/sorting': '/docs/head/guides/core-concepts/positions',
  '/docs/head/guides/core-concepts/streaming': '/docs/typescript/head/guides/core-concepts/streaming',
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  const legacyTarget = legacyPages[path.replace(/\/$/, '')]
  if (legacyTarget)
    return sendRedirect(event, `${legacyTarget}${url.search}`, 301)

  // TypeScript no longer has a framework-authored upgrade page at this old
  // route. Other frameworks do, so they must be allowed through and indexed.
  const match = path.match(/^\/docs\/([\w-]+)\/head\/guides\/get-started\/migration\/?$/)
  if (match?.[1] === 'typescript') {
    return sendRedirect(event, `/docs/migration-guide/v3${url.search}`, 301)
  }

  // The v3 release notes link to a debugging guide that was never published.
  // Send readers to the closest guide page instead of a 404.
  if (/^\/docs\/head\/guides\/debugging\/?$/.test(path)) {
    return sendRedirect(event, `/docs/head/guides/get-started/overview${url.search}`, 301)
  }

  // Consolidate the duplicate trailing-slash URLs visible in Search Console.
  if (path.startsWith('/docs/') && path.endsWith('/')) {
    return sendRedirect(event, `${path.slice(0, -1)}${url.search}`, 301)
  }
})
