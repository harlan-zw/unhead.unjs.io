import { describe, expect, it } from 'vitest'
import { renderPlainCode } from '../layers/tools/app/utils/code'

describe('renderPlainCode', () => {
  it('escapes untrusted code before it reaches v-html', () => {
    expect(renderPlainCode('<img src=x onerror=alert(1)> & text')).toBe(
      '<pre><code>&lt;img src=x onerror=alert(1)&gt; &amp; text</code></pre>',
    )
  })
})
