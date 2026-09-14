import { defineCheck, fail, pass, unavailable } from '@harlan-zw/nuxt-checkin/server'

export interface DocsCheckEvent {
  readContent: (collection: 'docsUnhead' | 'docsUnheadV2') => Promise<unknown>
}

export function defineDocsCheck(options: { id: string, collection: 'docsUnhead' | 'docsUnheadV2' }) {
  return defineCheck<DocsCheckEvent>({
    id: options.id,
    async run({ event, collect }) {
      if (!event)
        return unavailable('Documentation collection is unavailable.')
      const row = await collect(event, options.collection, async () => ({ value: await event.readContent(options.collection) }))
      return row ? pass({ collection: options.collection, readable: true }) : fail('Documentation collection is empty.', { collection: options.collection })
    },
  })
}
