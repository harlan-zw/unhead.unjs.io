import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const readSource = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

describe('site metadata and crawl hygiene', () => {
  it('keeps the private admin dashboard out of search results', async () => {
    const source = await readSource('layers/admin/app/pages/admin/index.vue')

    expect(source).toMatch(/useRobotsRule\(\{\s*noindex: true,\s*nofollow: true,?\s*\}\)/)
  })

  it('gives releases a primary heading, explicit social metadata, and a bounded initial list', async () => {
    const source = await readSource('app/pages/releases.vue')

    expect(source).toContain('<h1')
    expect(source).toContain('useSeoMeta({')
    expect(source).toContain('defineOgImage(')
    expect(source).toContain('const RELEASES_PER_PAGE = 10')
    expect(source).toContain('v-for="(release, key) in visibleReleases"')
  })

  it('declares the existing favicon globally', async () => {
    const source = await readSource('nuxt.config.ts')

    expect(source).toMatch(/rel:\s*['"]icon['"][\s\S]*?href:\s*['"]\/favicon\.ico['"]/)
  })

  it('uses article frontmatter for learn-page social images with a generated fallback', async () => {
    const source = await readSource('app/pages/learn/[...slug].vue')

    expect(source).toContain('ogImage: () => page.value?.image')
    expect(source).toContain('twitterImage: () => page.value?.image')
    expect(source).toContain('defineOgImage(\'Unhead\'')
  })

  it('links to the case-sensitive license file', async () => {
    const source = await readSource('app/components/Footer.vue')

    expect(source).toContain('https://github.com/unjs/unhead/blob/main/LICENSE')
    expect(source).not.toContain('https://github.com/unjs/unhead/blob/main/license')
  })
})
