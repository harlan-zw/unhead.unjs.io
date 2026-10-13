import { queryCollection } from '@nuxt/content/server'
import { stringify } from 'minimark/stringify'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('ai-ready:markdown:source', async (context) => {
    const collection = /^\/docs\/v2(?:\/|$)/.test(context.route)
      ? 'docsUnheadV2'
      : context.route.startsWith('/docs/')
        ? 'docsUnhead'
        : context.route.startsWith('/learn/') && !context.route.startsWith('/learn/research/')
          ? 'learn'
          : null
    if (!collection)
      return
    const page = await queryCollection(context.event, collection).path(context.route).first()
    if (!page)
      return
    context.source = {
      markdown: stringify({ ...page.body, type: 'minimark' }, { format: 'markdown/html' }),
      title: page.title,
      description: page.description,
      updatedAt: page.seo?.articleModifiedTime || page.updatedAt,
    }
  })
})
