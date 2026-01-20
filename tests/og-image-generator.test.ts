import { describe, expect, it } from 'vitest'
import { useOgImageGenerator } from '../app/composables/useOgImageGenerator'

describe('useOgImageGenerator', () => {
  it('initializes with default values', () => {
    const { title, selectedTemplate } = useOgImageGenerator()
    expect(title.value).toBe('Unhead')
    expect(selectedTemplate.value).toBe('simple')
  })

  it('generates code for simple template', () => {
    const { code } = useOgImageGenerator()
    expect(code.value).toContain('export default function OgImage()')
    expect(code.value).toContain('Unhead')
  })

  it('switches to custom code mode and preserves previous code', async () => {
    const { selectedTemplate, code, customCode } = useOgImageGenerator()

    // Initial state
    const initialCode = code.value
    expect(selectedTemplate.value).toBe('simple')

    // Switch to custom
    selectedTemplate.value = 'custom'

    // Wait for watcher (synchronous in this setup with ref/watch? No, likely need a tick)
    // Using a small timeout to let the watcher run
    await new Promise(resolve => setTimeout(resolve, 10))

    // Verify custom code was populated
    expect(customCode.value).toBe(initialCode)
    expect(code.value).toBe(initialCode)

    // Modify custom code
    customCode.value = 'custom content'
    expect(code.value).toBe('custom content')
  })
})
