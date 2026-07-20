import { describe, expect, it } from 'vitest'
import { generateUseHeadCode, parseHeadTags } from '../layers/tools/app/composables/useCapoAnalyzer'

describe('parseHeadTags', () => {
  it('handles greater-than signs and mixed quotes inside attributes', () => {
    expect(parseHeadTags(`<meta content="a > b" http-equiv='refresh'><title>A > B</title>`)).toEqual([
      {
        tag: 'meta',
        attributes: { 'content': 'a > b', 'http-equiv': 'refresh' },
        content: undefined,
        raw: `<meta content="a > b" http-equiv='refresh'>`,
      },
      {
        tag: 'title',
        attributes: {},
        content: 'A > B',
        raw: '<title>A > B</title>',
      },
    ])
  })
})

describe('generateUseHeadCode', () => {
  it('serializes attribute names and untrusted values as valid JavaScript', () => {
    const [tag] = parseHeadTags(`<meta http-equiv="refresh" content="'; globalThis.location='bad">`)
    const code = generateUseHeadCode([{ ...tag, weight: 100, weightLabel: 'Other', priority: 14 }], 'typescript')

    expect(code).toContain('"http-equiv": "refresh"')
    expect(code).toContain('"content": "\'; globalThis.location=\'bad"')
  })
})
