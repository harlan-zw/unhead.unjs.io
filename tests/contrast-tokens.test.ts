import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const readGlobalCss = () => readFile(new URL('../app/css/global.css', import.meta.url), 'utf8')

describe('accessible color tokens', () => {
  it('uses readable semantic colors in both color schemes', async () => {
    const css = await readGlobalCss()

    expect(css).toMatch(/:root\s*\{[^}]*--ui-primary:\s*var\(--color-amber-800\)/)
    expect(css).toMatch(/:root\s*\{[^}]*--ui-success:\s*var\(--color-green-800\)/)
    expect(css).toMatch(/:root\s*\{[^}]*--ui-info:\s*var\(--color-blue-800\)/)
    expect(css).toMatch(/:root\s*\{[^}]*--ui-warning:\s*var\(--color-amber-800\)/)
    expect(css).toMatch(/:root\s*\{[^}]*--ui-color-success-600:\s*var\(--color-green-800\)/)
    expect(css).toMatch(/:root\s*\{[^}]*--ui-color-info-600:\s*var\(--color-blue-800\)/)
    expect(css).toMatch(/:root\s*\{[^}]*--ui-color-warning-600:\s*var\(--color-amber-800\)/)
    expect(css).toMatch(/:root\s*\{[^}]*--ui-text-dimmed:\s*var\(--color-neutral-600\)/)
    expect(css).toMatch(/:root\s*\{[^}]*--ui-text-muted:\s*var\(--color-neutral-600\)/)
    expect(css).toMatch(/\.dark\s*\{[^}]*--ui-primary:\s*var\(--color-amber-300\)/)
    expect(css).toMatch(/\.dark\s*\{[^}]*--ui-success:\s*var\(--color-green-300\)/)
    expect(css).toMatch(/\.dark\s*\{[^}]*--ui-info:\s*var\(--color-blue-300\)/)
    expect(css).toMatch(/\.dark\s*\{[^}]*--ui-warning:\s*var\(--color-amber-300\)/)
    expect(css).toMatch(/\.dark\s*\{[^}]*--ui-text-dimmed:\s*var\(--color-neutral-300\)/)
    expect(css).toMatch(/\.dark\s*\{[^}]*--ui-text-muted:\s*var\(--color-neutral-300\)/)
    expect(css).toMatch(/\.shiki span\.line\.highlight\s*\{[^}]*background-color:\s*var\(--ui-bg\) !important/)
  })
})
