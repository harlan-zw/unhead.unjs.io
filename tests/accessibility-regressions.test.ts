import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const readSource = (path: string) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

describe('production accessibility regressions', () => {
  it('uses a valid accessible name for documentation navigation', async () => {
    const source = await readSource('app/components/DocsSidebarHeader.vue')

    expect(source).toContain('aria-label="Documentation Navigation"')
    expect(source).not.toContain('aria-title=')
  })

  it('names every icon-only documentation feedback button', async () => {
    const source = await readSource('app/components/FeedbackButtons.vue')

    expect(source).toContain('aria-label="Yes, this page helped"')
    expect(source).toContain('aria-label="No, this page did not help"')
    expect(source).toContain('aria-label="Close feedback form"')
  })

  it('uses the high contrast light syntax theme everywhere code is generated', async () => {
    const sources = await Promise.all([
      readSource('nuxt.config.ts'),
      readSource('layers/tools/app/composables/useShikiHighlighter.ts'),
      readSource('scripts/generate-magic-move.ts'),
      readSource('scripts/generate-magic-move-mount.ts'),
    ])

    expect(sources.every(source => source.includes('github-light-high-contrast'))).toBe(true)
    expect(sources.every(source => source.includes('github-dark-high-contrast'))).toBe(true)
    expect(sources.every(source => !source.includes('material-theme-palenight'))).toBe(true)
  })

  it('does not fade tool reset controls below readable contrast', async () => {
    const pages = await Promise.all([
      readSource('layers/tools/app/pages/tools/capo-analyzer.vue'),
      readSource('layers/tools/app/pages/tools/meta-tag-generator.vue'),
      readSource('layers/tools/app/pages/tools/schema-generator.vue'),
    ])

    expect(pages.every(source => !source.includes('class="opacity-60 hover:opacity-100 transition-opacity"'))).toBe(true)
  })

  it('consumes code metadata instead of leaking invalid lang attributes', async () => {
    const source = await readSource('app/components/ProsePre.vue')

    expect(source).toContain('inheritAttrs: false')
    expect(source).toContain('lang?: string')
  })

  it('requires accessible names for every code editor', async () => {
    const sources = await Promise.all([
      readSource('layers/tools/app/components/ToolCodeEditor.vue'),
      readSource('layers/tools/app/pages/tools/capo-analyzer.vue'),
      readSource('layers/tools/app/pages/tools/og-image-generator.vue'),
    ])

    expect(sources[0]).toContain('label: string')
    expect(sources[0]).toContain(':aria-label="label"')
    expect(sources[1]).toContain('label="HTML head source"')
    expect(sources[2]).toContain('label="JSX template source"')
  })

  it('keeps the author social link valid', async () => {
    const source = await readSource('app/pages/learn/[...slug].vue')

    expect(source).toContain('to="https://x.com/harlan_zw"')
    expect(source).not.toContain('to="https://x.com/harlan-zw"')
  })

  it('keeps code language labels fully readable', async () => {
    const source = await readSource('app/components/content/ModuleInstall.vue')

    expect(source).not.toContain('absolute right-3 opacity-50')
    expect(source).not.toContain('lang: \'bash\'')
  })

  it('labels repeated navigation landmarks', async () => {
    const sources = await Promise.all([
      readSource('app/components/Header.vue'),
      readSource('app/components/Footer.vue'),
    ])

    expect(sources[0]).toContain('aria-label="Primary navigation"')
    expect(sources[1]).toContain(':aria-label="`')
    expect(sources[1]).toContain('category.label} footer navigation`"')
    expect(sources[1]).toContain('<h2 class="font-bold mb-3 text-xs">')
  })

  it('preserves heading order on audited pages', async () => {
    const sources = await Promise.all([
      readSource('layers/tools/app/pages/tools/schema-generator.vue'),
      readSource('layers/tools/app/pages/tools/meta-tag-generator.vue'),
      readSource('layers/tools/app/pages/tools/capo-analyzer.vue'),
      readSource('app/pages/releases.vue'),
    ])

    expect(sources[0]).toMatch(/<h2[^>]*>\s*Schema Type/)
    expect(sources[0]).toMatch(/<h3[^>]*>\s*\{\{ currentSchemaConfig\.label \}\}/)
    expect(sources[1]).toMatch(/<h2[^>]*>\s*Google Preview/)
    expect(sources[2]).toMatch(/<h2[^>]*>\s*Paste your/)
    expect(sources[3]).toContain('<h2 class="text-xl font-bold flex items-center gap-2">')
    expect(sources[3]).toContain(':value="normalizeReleaseBodyHeadings(release.body)"')
  })

  it('does not repeat linked author text in image alt text', async () => {
    const source = await readSource('app/pages/learn/[...slug].vue')

    expect(source).toContain('<img alt="" src="https://avatars.githubusercontent.com/u/5326365?v=4"')
  })

  it('keeps highlighted code lines on a readable background', async () => {
    const source = await readSource('app/app.config.ts')

    expect(source).toContain('base: \'**:[.line.highlight]:bg-default!\'')
  })

  it('provides dark mode colors for social preview metadata', async () => {
    const sources = await Promise.all([
      readSource('layers/tools/app/pages/tools/meta-tag-generator.vue'),
      readSource('layers/tools/app/pages/tools/og-image-generator.vue'),
    ])

    expect(sources.every(source => !source.includes('text-neutral-500'))).toBe(true)
    expect(sources.every(source => !source.includes('text-[#006CE7]'))).toBe(true)
  })

  it('makes Capo result scrollers keyboard accessible', async () => {
    const source = await readSource('layers/tools/app/pages/tools/capo-analyzer.vue')

    expect(source).toContain('aria-label="Ordering issues" tabindex="0"')
    expect(source).toContain('aria-label="Current tag order" tabindex="0"')
    expect(source).toContain('aria-label="Optimal tag order" tabindex="0"')
  })

  it('uses readable Capo score colors', async () => {
    const source = await readSource('layers/tools/app/pages/tools/capo-analyzer.vue')

    expect(source).toContain('return \'text-green-800 dark:text-green-300\'')
    expect(source).toContain('return \'text-amber-800 dark:text-amber-300\'')
    expect(source).toContain('return \'text-red-700 dark:text-red-300\'')
  })
})
