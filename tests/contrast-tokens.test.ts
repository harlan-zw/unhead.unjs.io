import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const readGlobalCss = () => readFile(new URL('../app/css/global.css', import.meta.url), 'utf8')

describe('accessible color tokens', () => {
  it('uses readable semantic colors in both color schemes', async () => {
    const css = await readGlobalCss()

    expect(css).toMatch(/:root\s*\{[^}]*--ui-primary:\s*var\(--color-amber-700\)/)
    expect(css).toMatch(/:root\s*\{[^}]*--ui-text-dimmed:\s*var\(--color-neutral-600\)/)
    expect(css).toMatch(/:root\s*\{[^}]*--ui-text-muted:\s*var\(--color-neutral-600\)/)
    expect(css).toMatch(/\.dark\s*\{[^}]*--ui-primary:\s*var\(--color-amber-300\)/)
  })
})
