import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, '..')

function read(path: string) {
  return readFileSync(resolve(root, path), 'utf8')
}

const toolPages = [
  'capo-analyzer.vue',
  'meta-tag-generator.vue',
  'og-image-generator.vue',
  'schema-generator.vue',
]

describe('tool page SEO', () => {
  it.each(toolPages)('%s uses the shared tool SEO contract', (page) => {
    const source = read(`layers/tools/app/pages/tools/${page}`)

    expect(source).toContain('useToolSeo({')
    expect(source).not.toMatch(/^useSeoMeta\(\{/m)
  })
})

describe('og image generator accessibility and loading', () => {
  const source = read('layers/tools/app/pages/tools/og-image-generator.vue')

  it('names every native color input', () => {
    const colorInputs = source.match(/<input[\s\S]*?type="color"[\s\S]*?>/g) ?? []

    expect(colorInputs).toHaveLength(3)
    expect(colorInputs.every(input => input.includes('aria-label='))).toBe(true)
  })

  it('exposes template and platform selection state', () => {
    expect(source).toContain(':aria-pressed="selectedTemplate === tmpl"')
    expect(source).toMatch(/:aria-label="`\$\{tab\.label\} preview`"/)
    expect(source).toContain(':aria-pressed="activePlatform === tab.value"')
  })

  it('defers the renderer until interaction', () => {
    expect(source).not.toContain('useTakumiRenderer()')
    expect(source).toContain('<ToolOgImageRenderer')

    const renderer = read('layers/tools/app/components/ToolOgImageRenderer.vue')
    expect(renderer).toContain('@pointerover.once="activate"')
    expect(renderer).toContain('<LazyToolOgImageRenderController')
  })

  it('reserves generated image dimensions', () => {
    const previewImages = source.match(/<img v-else-if="previewImage"[\s\S]*?>/g) ?? []

    expect(previewImages.length).toBeGreaterThan(0)
    expect(previewImages.every(image => image.includes(':width="imageWidth"') && image.includes(':height="imageHeight"'))).toBe(true)
  })

  it('shows renderer errors before loading state in every preview', () => {
    expect(source.match(/v-if="error"/g)).toHaveLength(7)
    expect(source.match(/v-else-if="!isReady"/g)).toHaveLength(7)
    expect(source).not.toContain('v-if="!isReady"')
  })
})

describe('shared tool device toggle', () => {
  const source = read('layers/tools/app/components/ToolDeviceToggle.vue')

  it('names icon-only controls and exposes their state', () => {
    expect(source).toContain('aria-label="Mobile preview"')
    expect(source).toContain(':aria-pressed="model === \'mobile\'"')
    expect(source).toContain('aria-label="Desktop preview"')
    expect(source).toContain(':aria-pressed="model === \'desktop\'"')
  })
})

describe('responsive tool controls', () => {
  it('keeps meta generator tabs named and stateful on small screens', () => {
    const source = read('layers/tools/app/pages/tools/meta-tag-generator.vue')

    expect(source).toContain(':aria-label="tab.label"')
    expect(source.match(/:aria-pressed=/g)).toHaveLength(2)
  })

  it('exposes the Capo input mode state', () => {
    const source = read('layers/tools/app/pages/tools/capo-analyzer.vue')

    expect(source).toContain(':aria-pressed="inputTab === \'paste\'"')
    expect(source).toContain(':aria-pressed="inputTab === \'url\'"')
  })

  it('names responsive copy controls', () => {
    for (const page of ['capo-analyzer.vue', 'meta-tag-generator.vue', 'schema-generator.vue']) {
      const source = read(`layers/tools/app/pages/tools/${page}`)

      expect(source).toContain(':aria-label="copied ? \'Code copied\' : \'Copy generated code\'"')
    }
  })
})

describe('tool page accessibility regressions', () => {
  const source = read('layers/tools/app/pages/tools/og-image-generator.vue')

  it('uses a sequential heading after the tool title', () => {
    expect(source).toMatch(/<h2[^>]*>\s*Social Card Preview\s*<\/h2>/)
  })

  it('uses passing dark and selected control contrast classes', () => {
    expect(source).toContain('text-purple-700 dark:text-purple-300')
    expect(source).toContain('text-xs text-neutral-600 dark:text-neutral-400 truncate')
    expect(source).toContain('Powered by Takumi')
    expect(source).toContain('class="text-xs text-muted hover:text-purple-700 dark:hover:text-purple-300')
  })

  it('provides a main landmark', () => {
    expect(read('layers/tools/app/components/ToolPageLayout.vue')).toContain('<main class="min-h-screen">')
  })

  it('lets visible link content provide accessible names', () => {
    expect(read('app/components/Header.vue')).not.toContain('aria-label="Title"')
    expect(read('layers/tools/app/components/RelatedTools.vue')).not.toContain(':aria-label="tool.title"')
  })

  it('uses visible color mode text when verbose', () => {
    expect(read('app/components/color-mode/ColorModeButton.vue')).toContain(':aria-label="verbose ? undefined')
  })

  it('gives the llms link a minimum touch height', () => {
    expect(read('app/components/Footer.vue')).toMatch(/href="\/llms\.txt" class="[^"]*min-h-6/)
  })
})
