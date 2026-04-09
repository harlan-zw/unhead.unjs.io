import { existsSync } from 'node:fs'
import { defineCollection, defineContentConfig } from '@nuxt/content'
import { defineRobotsSchema } from '@nuxtjs/robots/content'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'
import { defineOgImageSchema } from 'nuxt-og-image/content'
import { defineSchemaOrgSchema } from 'nuxt-schema-org/content'
import { relative, resolve } from 'pathe'
import { z } from 'zod'
import { logger } from './logger'

const schema = z.object({
  new: z.boolean().optional(),
  deprecated: z.boolean().optional(),
  robots: defineRobotsSchema(),
  sitemap: defineSitemapSchema(),
  ogImage: defineOgImageSchema(),
  schemaOrg: defineSchemaOrgSchema(),
})

function getSubModuleCollection(version: 'v3' | 'v2' = 'v3') {
  const isV2 = version === 'v2'
  const prefix = isV2 ? '/docs/v2' : '/docs'

  // Only check local for v3 (main development)
  if (!isV2) {
    const localDirPaths = new Set([
      resolve(__dirname, '..', '..', 'pkg', 'unhead', 'docs'),
    ])
    for (const localDirPath of localDirPaths) {
      if (existsSync(localDirPath)) {
        logger.info(`🔗 Docs source using local fs: ${relative(process.cwd(), localDirPath)}`)
        return defineCollection({
          type: 'page',
          source: {
            include: '**/*.{md,yml}',
            cwd: localDirPath,
            prefix,
          },
          schema,
        })
      }
    }
  }

  // use github source
  const repoConfig = isV2
    ? { url: 'https://github.com/unjs/unhead', tag: 'v2.1.2' }
    : { url: 'https://github.com/unjs/unhead', branch: 'main' }

  logger.info(`🔗 Docs ${version} source using GitHub (${isV2 ? 'tag: v2.1.2' : 'branch: main'})`)
  return defineCollection({
    type: 'page',
    source: {
      repository: repoConfig,
      include: 'docs/**/*.{md,yml}',
      prefix,
    },
    schema,
  })
}

export default defineContentConfig({
  collections: {
    docsUnhead: getSubModuleCollection('v3'),
    docsUnheadV2: getSubModuleCollection('v2'),
    snippets: defineCollection({
      type: 'page', // partial
      source: {
        include: '**/*.md',
        cwd: resolve('./snippets'),
      },
    }),
    learn: defineCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        cwd: resolve('./content/learn'),
        prefix: '/learn',
      },
      schema: z.object({
        icon: z.string().optional(),
        image: z.string().optional(),
        publishedAt: z.string().optional(),
        updatedAt: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        readTime: z.string(),
        robots: defineRobotsSchema(),
        sitemap: defineSitemapSchema(),
        ogImage: defineOgImageSchema(),
        schemaOrg: defineSchemaOrgSchema(),
      }),
    }),
  },
})
