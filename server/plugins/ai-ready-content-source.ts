import type { H3Event } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { stringify } from 'minimark/stringify'
import { modifyRelativeDocLinksWithFramework, replaceImportSpecifier } from '~~/utils/content'
import { getPathFramework, getPathWithoutFramework } from '~~/utils/urls'

async function getContentSource(event: H3Event, route: string) {
  const collection = /^\/docs\/v2(?:\/|$)/.test(route)
    ? 'docsUnheadV2'
    : route.startsWith('/docs/')
      ? 'docsUnhead'
      : route.startsWith('/learn/') && !route.startsWith('/learn/research/')
        ? 'learn'
        : null
  if (!collection)
    return null
  let page = await queryCollection(event, collection).path(route).first()
  if (!page && route.startsWith('/docs/') && getPathFramework(route))
    page = await queryCollection(event, collection).path(getPathWithoutFramework(route)).first()
  if (!page)
    return null
  const body = structuredClone(page.body)
  if (route.startsWith('/docs/')) {
    const framework = getPathFramework(route) || 'typescript'
    const specifier = framework === 'nuxt' ? '#imports' : framework === 'typescript' ? 'unhead' : `@unhead/${framework}`
    replaceImportSpecifier(body.value, {
      '@unhead/dynamic-import': specifier,
      '@unhead/schema-org/@framework': framework === 'nuxt' ? '#imports' : framework === 'typescript' ? '@unhead/schema-org' : `@unhead/schema-org/${framework}`,
    }, !page.stem?.includes('typescript/'))
    modifyRelativeDocLinksWithFramework(body.value, framework)
  }
  return {
    markdown: stringify({ ...body, type: 'minimark' }, { format: 'markdown/html' }),
    title: page.title,
    description: page.description,
    updatedAt: page.seo?.articleModifiedTime || page.updatedAt,
  }
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('ai-ready:markdown:source', async (context) => {
    const source = await getContentSource(context.event, context.route)
    if (source)
      context.source = source
  })
  nitroApp.hooks.hook('ai-ready:page:markdown', async (context) => {
    if (!context.event)
      return
    const source = await getContentSource(context.event, context.route)
    if (source)
      context.markdown = source.markdown
  })
})
