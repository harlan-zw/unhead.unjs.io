import { describe, expect, it } from 'vitest'
import { normalizeReleaseBodyHeadings } from '../app/utils/releases'

describe('release body headings', () => {
  it('makes every release section a child of its release heading', () => {
    expect(normalizeReleaseBodyHeadings('# Major\n##### Fixes\n###### Details')).toBe('### Major\n### Fixes\n### Details')
  })

  it('does not rewrite headings inside fenced code', () => {
    const markdown = '#### Changes\n```md\n# Example\n```\n~~~md\n## Other example\n~~~'

    expect(normalizeReleaseBodyHeadings(markdown)).toBe('### Changes\n```md\n# Example\n```\n~~~md\n## Other example\n~~~')
  })

  it('demotes linked headings to avoid nested anchors', () => {
    const markdown = '##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](https://github.com/unjs/unhead)'

    expect(normalizeReleaseBodyHeadings(markdown)).toBe('[View changes on GitHub](https://github.com/unjs/unhead)')
  })
})
