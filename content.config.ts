import { existsSync } from 'node:fs'
import { defineCollection, defineContentConfig } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'
import { relative, resolve } from 'pathe'
import { logger } from './logger'

function getSubModuleCollection() {
  const localDirPaths = new Set([
    resolve(__dirname, '..', 'unhead', 'docs'),
  ])
  for (const localDirPath of localDirPaths) {
    if (existsSync(localDirPath)) {
      logger.info(`🔗 Docs source using local fs: ${relative(process.cwd(), localDirPath)}`)
      return defineCollection(asSeoCollection({
        type: 'page',
        source: {
          include: '**/*.md',
          cwd: localDirPath,
          prefix: '/docs',
        },
      }))
    }
  }
  // use github source
  logger.info(`🔗 Docs source using GitHub`)
  return defineCollection(asSeoCollection({
    type: 'page',
    source: {
      repository: `https://github.com/unjs/unhead`,
      include: 'docs/**/*.md',
      prefix: `/docs`,
    },
  }))
}

export default defineContentConfig({
  collections: {
    docsUnhead: getSubModuleCollection(),
    snippets: defineCollection({
      type: 'page', // partial
      source: {
        include: '**/*.md',
        cwd: resolve('./snippets'),
      },
    }),
  },
})
