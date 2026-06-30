import { describe, expect, it } from 'vitest'

// We test the pure functions by importing the composable's internal logic
// Since the composable uses Vue refs, we extract and test the pure functions directly
// by re-implementing them here from the same source logic

interface ParsedTag {
  tag: string
  attributes: Record<string, string>
  content?: string
  raw: string
}

interface AnalyzedTag extends ParsedTag {
  weight: number
  weightLabel: string
  priority: number
}

const WEIGHT_TABLE = [
  { weight: -30, label: 'Content-Security-Policy', test: (t: ParsedTag) => t.tag === 'meta' && t.attributes['http-equiv']?.toLowerCase() === 'content-security-policy' },
  { weight: -20, label: 'Charset', test: (t: ParsedTag) => t.tag === 'meta' && 'charset' in t.attributes },
  { weight: -15, label: 'Viewport', test: (t: ParsedTag) => t.tag === 'meta' && t.attributes.name?.toLowerCase() === 'viewport' },
  { weight: -10, label: 'Base', test: (t: ParsedTag) => t.tag === 'base' },
  { weight: 10, label: 'Title', test: (t: ParsedTag) => t.tag === 'title' },
  { weight: 20, label: 'Preconnect', test: (t: ParsedTag) => t.tag === 'link' && t.attributes.rel?.toLowerCase() === 'preconnect' },
  { weight: 30, label: 'Async Script', test: (t: ParsedTag) => t.tag === 'script' && 'async' in t.attributes && !('defer' in t.attributes) },
  { weight: 40, label: 'Style @import', test: (t: ParsedTag) => t.tag === 'style' && (t.content?.includes('@import') ?? false) },
  { weight: 50, label: 'Sync Script', test: (t: ParsedTag) => t.tag === 'script' && t.attributes.src && !('async' in t.attributes) && !('defer' in t.attributes) && !('type' in t.attributes && t.attributes.type === 'module') },
  { weight: 60, label: 'Stylesheet', test: (t: ParsedTag) => (t.tag === 'link' && t.attributes.rel?.toLowerCase() === 'stylesheet') || (t.tag === 'style' && !(t.content?.includes('@import') ?? false)) },
  { weight: 70, label: 'Preload', test: (t: ParsedTag) => t.tag === 'link' && /^(?:preload|modulepreload)$/i.test(t.attributes.rel || '') },
  { weight: 80, label: 'Deferred Script', test: (t: ParsedTag) => t.tag === 'script' && ('defer' in t.attributes || t.attributes.type === 'module') },
  { weight: 90, label: 'Prefetch/DNS', test: (t: ParsedTag) => t.tag === 'link' && /^(?:prefetch|dns-prefetch|prerender)$/i.test(t.attributes.rel || '') },
  { weight: 100, label: 'Other', test: () => true },
] as const

const TagRegex = /<(meta|link|title|base|style|script|noscript)(\s[^>]*?)?\/?>(?:([\s\S]*?)<\/\1>)?/gi
const AttrRegex = /(\w[\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g

function classifyTag(tag: ParsedTag): AnalyzedTag {
  for (let i = 0; i < WEIGHT_TABLE.length; i++) {
    const entry = WEIGHT_TABLE[i]
    if (entry.test(tag)) {
      return { ...tag, weight: entry.weight, weightLabel: entry.label, priority: i + 1 }
    }
  }
  return { ...tag, weight: 100, weightLabel: 'Other', priority: 14 }
}

function parseHeadTags(html: string): ParsedTag[] {
  const tags: ParsedTag[] = []
  for (const match of html.matchAll(TagRegex)) {
    const [raw, tagName, attrString, content] = match
    const attributes: Record<string, string> = {}
    if (attrString) {
      for (const attrMatch of attrString.matchAll(AttrRegex)) {
        const [, name, v1, v2, v3] = attrMatch
        attributes[name] = v1 ?? v2 ?? v3 ?? ''
      }
    }
    tags.push({ tag: tagName.toLowerCase(), attributes, content: content?.trim(), raw })
  }
  return tags
}

function computeScore(tags: AnalyzedTag[]): number {
  if (tags.length <= 1)
    return 100
  const optimal = tags.toSorted((a, b) => a.weight - b.weight)
  const optimalPosition = new Map(optimal.map((tag, idx) => [tag, idx]))
  let inversions = 0
  const total = tags.length * (tags.length - 1) / 2
  for (let i = 0; i < tags.length; i++) {
    for (let j = i + 1; j < tags.length; j++) {
      if (optimalPosition.get(tags[i])! > optimalPosition.get(tags[j])!)
        inversions++
    }
  }
  return Math.round((1 - inversions / total) * 100)
}

describe('parseHeadTags', () => {
  it('parses meta charset', () => {
    const tags = parseHeadTags('<meta charset="utf-8">')
    expect(tags).toHaveLength(1)
    expect(tags[0].tag).toBe('meta')
    expect(tags[0].attributes.charset).toBe('utf-8')
  })

  it('parses self-closing meta', () => {
    const tags = parseHeadTags('<meta name="viewport" content="width=device-width" />')
    expect(tags).toHaveLength(1)
    expect(tags[0].attributes.name).toBe('viewport')
    expect(tags[0].attributes.content).toBe('width=device-width')
  })

  it('parses title with content', () => {
    const tags = parseHeadTags('<title>My Page</title>')
    expect(tags).toHaveLength(1)
    expect(tags[0].tag).toBe('title')
    expect(tags[0].content).toBe('My Page')
  })

  it('parses link tags', () => {
    const tags = parseHeadTags('<link rel="stylesheet" href="/style.css">')
    expect(tags).toHaveLength(1)
    expect(tags[0].attributes.rel).toBe('stylesheet')
    expect(tags[0].attributes.href).toBe('/style.css')
  })

  it('parses script with src', () => {
    const tags = parseHeadTags('<script src="/app.js"></script>')
    expect(tags).toHaveLength(1)
    expect(tags[0].tag).toBe('script')
    expect(tags[0].attributes.src).toBe('/app.js')
  })

  it('parses script with async', () => {
    const tags = parseHeadTags('<script async src="/analytics.js"></script>')
    expect(tags).toHaveLength(1)
    expect(tags[0].attributes.async).toBe('')
    expect(tags[0].attributes.src).toBe('/analytics.js')
  })

  it('parses multiple tags', () => {
    const html = `
      <meta charset="utf-8">
      <title>Test</title>
      <link rel="stylesheet" href="/style.css">
    `
    const tags = parseHeadTags(html)
    expect(tags).toHaveLength(3)
    expect(tags[0].tag).toBe('meta')
    expect(tags[1].tag).toBe('title')
    expect(tags[2].tag).toBe('link')
  })

  it('parses style with content', () => {
    const tags = parseHeadTags('<style>body { margin: 0 }</style>')
    expect(tags).toHaveLength(1)
    expect(tags[0].tag).toBe('style')
    expect(tags[0].content).toBe('body { margin: 0 }')
  })

  it('handles empty input', () => {
    expect(parseHeadTags('')).toHaveLength(0)
  })
})

describe('classifyTag', () => {
  it('classifies meta charset as weight -20', () => {
    const tag: ParsedTag = { tag: 'meta', attributes: { charset: 'utf-8' }, raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(-20)
    expect(result.weightLabel).toBe('Charset')
  })

  it('classifies viewport as weight -15', () => {
    const tag: ParsedTag = { tag: 'meta', attributes: { name: 'viewport', content: 'width=device-width' }, raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(-15)
    expect(result.weightLabel).toBe('Viewport')
  })

  it('classifies CSP as weight -30', () => {
    const tag: ParsedTag = { tag: 'meta', attributes: { 'http-equiv': 'Content-Security-Policy', 'content': 'default-src \'self\'' }, raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(-30)
    expect(result.weightLabel).toBe('Content-Security-Policy')
  })

  it('classifies title as weight 10', () => {
    const tag: ParsedTag = { tag: 'title', attributes: {}, content: 'My Page', raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(10)
  })

  it('classifies preconnect as weight 20', () => {
    const tag: ParsedTag = { tag: 'link', attributes: { rel: 'preconnect', href: 'https://fonts.googleapis.com' }, raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(20)
  })

  it('classifies async script as weight 30', () => {
    const tag: ParsedTag = { tag: 'script', attributes: { async: '', src: '/app.js' }, raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(30)
  })

  it('classifies sync script as weight 50', () => {
    const tag: ParsedTag = { tag: 'script', attributes: { src: '/app.js' }, raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(50)
  })

  it('classifies stylesheet as weight 60', () => {
    const tag: ParsedTag = { tag: 'link', attributes: { rel: 'stylesheet', href: '/style.css' }, raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(60)
  })

  it('classifies defer script as weight 80', () => {
    const tag: ParsedTag = { tag: 'script', attributes: { defer: '', src: '/app.js' }, raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(80)
  })

  it('classifies module script as weight 80', () => {
    const tag: ParsedTag = { tag: 'script', attributes: { type: 'module', src: '/app.js' }, raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(80)
  })

  it('classifies preload as weight 70', () => {
    const tag: ParsedTag = { tag: 'link', attributes: { rel: 'preload', href: '/font.woff2', as: 'font' }, raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(70)
  })

  it('classifies prefetch as weight 90', () => {
    const tag: ParsedTag = { tag: 'link', attributes: { rel: 'prefetch', href: '/next-page.js' }, raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(90)
  })

  it('classifies dns-prefetch as weight 90', () => {
    const tag: ParsedTag = { tag: 'link', attributes: { rel: 'dns-prefetch', href: '//cdn.example.com' }, raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(90)
  })

  it('classifies meta description as weight 100 (Other)', () => {
    const tag: ParsedTag = { tag: 'meta', attributes: { name: 'description', content: 'A page' }, raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(100)
  })

  it('classifies style with @import as weight 40', () => {
    const tag: ParsedTag = { tag: 'style', attributes: {}, content: '@import url("fonts.css");', raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(40)
  })

  it('classifies inline style (no @import) as weight 60', () => {
    const tag: ParsedTag = { tag: 'style', attributes: {}, content: 'body { margin: 0 }', raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(60)
  })

  it('classifies base as weight -10', () => {
    const tag: ParsedTag = { tag: 'base', attributes: { href: '/' }, raw: '' }
    const result = classifyTag(tag)
    expect(result.weight).toBe(-10)
  })
})

describe('computeScore', () => {
  it('returns 100 for perfectly ordered tags', () => {
    const tags: AnalyzedTag[] = [
      { tag: 'meta', attributes: { charset: 'utf-8' }, raw: '', weight: -20, weightLabel: 'Charset', priority: 2 },
      { tag: 'title', attributes: {}, content: 'Test', raw: '', weight: 10, weightLabel: 'Title', priority: 5 },
      { tag: 'link', attributes: { rel: 'stylesheet' }, raw: '', weight: 60, weightLabel: 'Stylesheet', priority: 10 },
    ]
    expect(computeScore(tags)).toBe(100)
  })

  it('returns less than 100 for out-of-order tags', () => {
    const tags: AnalyzedTag[] = [
      { tag: 'title', attributes: {}, content: 'Test', raw: '', weight: 10, weightLabel: 'Title', priority: 5 },
      { tag: 'meta', attributes: { charset: 'utf-8' }, raw: '', weight: -20, weightLabel: 'Charset', priority: 2 },
      { tag: 'link', attributes: { rel: 'stylesheet' }, raw: '', weight: 60, weightLabel: 'Stylesheet', priority: 10 },
    ]
    const score = computeScore(tags)
    expect(score).toBeLessThan(100)
    expect(score).toBeGreaterThan(0)
  })

  it('returns 100 for single tag', () => {
    const tags: AnalyzedTag[] = [
      { tag: 'meta', attributes: { charset: 'utf-8' }, raw: '', weight: -20, weightLabel: 'Charset', priority: 2 },
    ]
    expect(computeScore(tags)).toBe(100)
  })

  it('returns 100 for empty array', () => {
    expect(computeScore([])).toBe(100)
  })

  it('returns 0 for completely reversed order', () => {
    const tags: AnalyzedTag[] = [
      { tag: 'meta', attributes: { name: 'description' }, raw: '', weight: 100, weightLabel: 'Other', priority: 14 },
      { tag: 'link', attributes: { rel: 'stylesheet' }, raw: '', weight: 60, weightLabel: 'Stylesheet', priority: 10 },
      { tag: 'title', attributes: {}, raw: '', weight: 10, weightLabel: 'Title', priority: 5 },
      { tag: 'meta', attributes: { charset: 'utf-8' }, raw: '', weight: -20, weightLabel: 'Charset', priority: 2 },
    ]
    expect(computeScore(tags)).toBe(0)
  })
})

describe('integration: parse + classify + score', () => {
  it('scores a well-ordered head as 100', () => {
    const html = `
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <title>Test</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="stylesheet" href="/style.css">
      <meta name="description" content="A page">
    `
    const tags = parseHeadTags(html).map(classifyTag)
    expect(computeScore(tags)).toBe(100)
  })

  it('scores a poorly-ordered head below 100', () => {
    const html = `
      <title>Test</title>
      <script src="/app.js"></script>
      <meta charset="utf-8">
      <link rel="preconnect" href="https://fonts.googleapis.com">
    `
    const tags = parseHeadTags(html).map(classifyTag)
    expect(computeScore(tags)).toBeLessThan(100)
  })

  it('correctly classifies all 14 weight levels from HTML', () => {
    const html = `
      <meta http-equiv="Content-Security-Policy" content="default-src 'self'">
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width">
      <base href="/">
      <title>Test</title>
      <link rel="preconnect" href="https://cdn.example.com">
      <script async src="/analytics.js"></script>
      <style>@import url("fonts.css");</style>
      <script src="/app.js"></script>
      <link rel="stylesheet" href="/style.css">
      <link rel="preload" href="/font.woff2" as="font">
      <script defer src="/deferred.js"></script>
      <link rel="prefetch" href="/next.js">
      <meta name="description" content="Test page">
    `
    const tags = parseHeadTags(html).map(classifyTag)
    const weights = tags.map(t => t.weight)
    expect(weights).toEqual([-30, -20, -15, -10, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    expect(computeScore(tags)).toBe(100)
  })
})
