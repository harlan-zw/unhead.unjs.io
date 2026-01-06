import { existsSync } from 'node:fs'
import { defineCollection, defineContentConfig } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'
import { relative, resolve } from 'pathe'
import { z } from 'zod'
import { logger } from './logger'

const schema = z.object({
  new: z.boolean().optional(),
  deprecated: z.boolean().optional(),
})

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
          include: '**/*.{md,yml}',
          cwd: localDirPath,
          prefix: '/docs',
        },
        schema,
      }))
    }
  }
  // use github source
  logger.info(`🔗 Docs source using GitHub`)
  return defineCollection(asSeoCollection({
    type: 'page',
    source: {
      repository: {
        url: 'https://github.com/unjs/unhead',
        branch: 'v3',
      },
      include: 'docs/**/*.{md,yml}',
      prefix: `/docs`,
    },
    schema,
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
    root: defineCollection(asSeoCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        cwd: resolve('./docs'),
      },
      schema: z.object({
        icon: z.string().optional(),
        publishedAt: z.string().optional(),
        updatedAt: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        readTime: z.string(),
        ogImageComponent: z.string().optional(),
      }),
    })),
  },
})
