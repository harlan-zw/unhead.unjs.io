import type { H3Event } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { stringify } from 'minimark/stringify'

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
  const page = await queryCollection(event, collection).path(route).first()
  if (!page)
    return null
  return {
    markdown: stringify({ ...page.body, type: 'minimark' }, { format: 'markdown/html' }),
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
