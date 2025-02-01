import { defineCollection, defineContentConfig } from '@nuxt/content'
import { resolve } from 'pathe'

export default defineContentConfig({
  collections: {
    docsUnhead: defineCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        cwd: resolve('../unhead/docs'),
        prefix: '/docs',
      },
    }),
    snippets: defineCollection({
      type: 'page', // partial
      source: {
        include: '**/*.md',
        cwd: resolve('./snippets'),
      },
    }),
  },
})
