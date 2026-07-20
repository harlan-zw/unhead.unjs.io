export interface ParsedTag {
  tag: string
  attributes: Record<string, string>
  content?: string
  raw: string
}

export interface AnalyzedTag extends ParsedTag {
  weight: number
  weightLabel: string
  priority: number
}

export interface Issue {
  tag: AnalyzedTag
  currentPosition: number
  optimalPosition: number
  delta: number
  severity: 'error' | 'warning' | 'info'
}

const PreloadPattern = /^(?:preload|modulepreload)$/i
const PrefetchPattern = /^(?:prefetch|dns-prefetch|prerender)$/i

// Capo.js weight definitions — 14 levels
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
  { weight: 70, label: 'Preload', test: (t: ParsedTag) => t.tag === 'link' && PreloadPattern.test(t.attributes.rel || '') },
  { weight: 80, label: 'Deferred Script', test: (t: ParsedTag) => t.tag === 'script' && ('defer' in t.attributes || t.attributes.type === 'module') },
  { weight: 90, label: 'Prefetch/DNS', test: (t: ParsedTag) => t.tag === 'link' && PrefetchPattern.test(t.attributes.rel || '') },
  { weight: 100, label: 'Other', test: () => true },
] as const

const HEAD_TAGS = new Set(['meta', 'link', 'title', 'base', 'style', 'script', 'noscript'])
const VOID_TAGS = new Set(['meta', 'link', 'base'])

function classifyTag(tag: ParsedTag): AnalyzedTag {
  for (let i = 0; i < WEIGHT_TABLE.length; i++) {
    const entry = WEIGHT_TABLE[i]
    if (entry.test(tag)) {
      return {
        ...tag,
        weight: entry.weight,
        weightLabel: entry.label,
        priority: i + 1,
      }
    }
  }
  return { ...tag, weight: 100, weightLabel: 'Other', priority: 14 }
}

function findTagEnd(html: string, start: number): number {
  let quote = ''
  for (let index = start; index < html.length; index++) {
    const character = html[index]
    if (quote) {
      if (character === quote)
        quote = ''
    }
    else if (character === '"' || character === '\'') {
      quote = character
    }
    else if (character === '>') {
      return index
    }
  }
  return -1
}

function parseAttributes(source: string): Record<string, string> {
  const attributes: Record<string, string> = {}
  let cursor = 0

  while (cursor < source.length) {
    while (/\s|\//.test(source[cursor] || ''))
      cursor++
    if (cursor >= source.length)
      break

    const nameStart = cursor
    while (cursor < source.length && !/[\s=/>]/.test(source[cursor]))
      cursor++
    const name = source.slice(nameStart, cursor).toLowerCase()
    if (!name) {
      cursor++
      continue
    }

    while (/\s/.test(source[cursor] || ''))
      cursor++
    let value = ''
    if (source[cursor] === '=') {
      cursor++
      while (/\s/.test(source[cursor] || ''))
        cursor++
      const quote = source[cursor]
      if (quote === '"' || quote === '\'') {
        cursor++
        const valueStart = cursor
        while (cursor < source.length && source[cursor] !== quote)
          cursor++
        value = source.slice(valueStart, cursor)
        if (source[cursor] === quote)
          cursor++
      }
      else {
        const valueStart = cursor
        while (cursor < source.length && !/[\s>]/.test(source[cursor]))
          cursor++
        value = source.slice(valueStart, cursor)
      }
    }
    attributes[name] = value
  }

  return attributes
}

export function parseHeadTags(html: string): ParsedTag[] {
  const tags: ParsedTag[] = []
  const lowerHtml = html.toLowerCase()
  let cursor = 0

  while (cursor < html.length) {
    const openingStart = html.indexOf('<', cursor)
    if (openingStart === -1)
      break
    const nameMatch = html.slice(openingStart + 1).match(/^\s*([a-z][\w-]*)/i)
    if (!nameMatch) {
      cursor = openingStart + 1
      continue
    }

    const tagName = nameMatch[1].toLowerCase()
    const openingEnd = findTagEnd(html, openingStart + 1)
    if (openingEnd === -1)
      break
    if (!HEAD_TAGS.has(tagName)) {
      cursor = openingEnd + 1
      continue
    }

    const nameOffset = html.slice(openingStart + 1).indexOf(nameMatch[1])
    const attributesStart = openingStart + 1 + nameOffset + nameMatch[1].length
    const attributes = parseAttributes(html.slice(attributesStart, openingEnd))
    let rawEnd = openingEnd + 1
    let content: string | undefined

    if (!VOID_TAGS.has(tagName) && !html.slice(openingStart, openingEnd + 1).endsWith('/>')) {
      const closingStart = lowerHtml.indexOf(`</${tagName}`, rawEnd)
      if (closingStart !== -1) {
        const closingEnd = findTagEnd(html, closingStart + 2)
        content = html.slice(rawEnd, closingStart).trim()
        rawEnd = closingEnd === -1 ? html.length : closingEnd + 1
      }
    }

    tags.push({
      tag: tagName,
      attributes,
      content,
      raw: html.slice(openingStart, rawEnd),
    })
    cursor = rawEnd
  }

  return tags
}

// Kendall tau distance — count inversions between current and optimal order
function computeScore(tags: AnalyzedTag[]): number {
  if (tags.length <= 1)
    return 100

  const optimal = tags.toSorted((a, b) => a.weight - b.weight)
  const optimalPosition = new Map(optimal.map((tag, idx) => [tag, idx]))
  let inversions = 0
  const total = tags.length * (tags.length - 1) / 2

  for (let i = 0; i < tags.length; i++) {
    for (let j = i + 1; j < tags.length; j++) {
      // In current order, i < j. Check if optimal order disagrees.
      if (optimalPosition.get(tags[i])! > optimalPosition.get(tags[j])!)
        inversions++
    }
  }

  return Math.round((1 - inversions / total) * 100)
}

function findIssues(tags: AnalyzedTag[]): Issue[] {
  const issues: Issue[] = []
  const optimal = tags.toSorted((a, b) => a.weight - b.weight)

  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i]
    const optimalIndex = optimal.indexOf(tag)
    const delta = i - optimalIndex

    if (delta > 0) {
      issues.push({
        tag,
        currentPosition: i + 1,
        optimalPosition: optimalIndex + 1,
        delta,
        severity: delta > 3 ? 'error' : 'warning',
      })
    }
  }

  return issues.toSorted((a, b) => b.delta - a.delta)
}

// Estimate FCP impact based on benchmark research data
// Heavy pages over slow-3g: worst ordering = +212ms (17% FCP)
// Scale linearly by inversion ratio (score)
function estimateFCPImpact(score: number): { min: number, max: number } {
  const severity = (100 - score) / 100
  return {
    min: Math.round(severity * 30), // fast-4g heavy estimate
    max: Math.round(severity * 210), // slow-3g heavy estimate
  }
}

const FRAMEWORK_IMPORTS: Record<string, string> = {
  'typescript': 'unhead',
  'vue': '@unhead/vue',
  'react': '@unhead/react',
  'svelte': '@unhead/svelte',
  'solid-js': '@unhead/solid-js',
  'angular': '@unhead/angular',
  'nuxt': '#imports',
}

function serializeAttributes(attributes: Record<string, string>): string {
  return Object.entries(attributes)
    .map(([key, value]) => `${JSON.stringify(key)}: ${value ? JSON.stringify(value) : 'true'}`)
    .join(', ')
}

export function generateUseHeadCode(tags: AnalyzedTag[], framework: string): string {
  const sorted = tags.toSorted((a, b) => a.weight - b.weight)
  const importName = FRAMEWORK_IMPORTS[framework] || 'unhead'

  const meta: string[] = []
  const links: string[] = []
  const scripts: string[] = []
  const styles: string[] = []
  let title = ''
  let base = ''

  for (const tag of sorted) {
    if (tag.tag === 'title') {
      title = tag.content || ''
    }
    else if (tag.tag === 'base') {
      base = tag.attributes.href || '/'
    }
    else if (tag.tag === 'meta') {
      const attrs = serializeAttributes(tag.attributes)
      meta.push(`    { ${attrs} }`)
    }
    else if (tag.tag === 'link') {
      const attrs = serializeAttributes(tag.attributes)
      links.push(`    { ${attrs} }`)
    }
    else if (tag.tag === 'script') {
      const attrs = serializeAttributes(tag.attributes)
      if (tag.content) {
        scripts.push(`    { ${attrs ? `${attrs}, ` : ''}innerHTML: ${JSON.stringify(tag.content.trim())} }`)
      }
      else {
        scripts.push(`    { ${attrs} }`)
      }
    }
    else if (tag.tag === 'style') {
      styles.push(`    { innerHTML: ${JSON.stringify(tag.content?.trim() || '')} }`)
    }
  }

  const parts: string[] = []
  if (title)
    parts.push(`  title: ${JSON.stringify(title)}`)
  if (base)
    parts.push(`  base: { href: ${JSON.stringify(base)} }`)
  if (meta.length)
    parts.push(`  meta: [\n${meta.join(',\n')}\n  ]`)
  if (links.length)
    parts.push(`  link: [\n${links.join(',\n')}\n  ]`)
  if (scripts.length)
    parts.push(`  script: [\n${scripts.join(',\n')}\n  ]`)
  if (styles.length)
    parts.push(`  style: [\n${styles.join(',\n')}\n  ]`)

  return `import { useHead } from '${importName}'\n\nuseHead({\n${parts.join(',\n')}\n})`
}

export function useCapoAnalyzer() {
  const input = ref('')
  const mode = ref<'paste' | 'url'>('paste')
  const url = ref('')
  const framework = ref('typescript')
  const loading = ref(false)
  const error = ref('')

  const parsedTags = computed(() => parseHeadTags(input.value))
  const analyzedTags = computed(() => parsedTags.value.map(classifyTag))
  const optimalTags = computed(() => analyzedTags.value.toSorted((a, b) => a.weight - b.weight))
  const score = computed(() => computeScore(analyzedTags.value))
  const issues = computed(() => findIssues(analyzedTags.value))
  const fcpImpact = computed(() => estimateFCPImpact(score.value))
  const hasAnyValue = computed(() => analyzedTags.value.length > 0)

  const generatedCode = computed(() => {
    if (!hasAnyValue.value)
      return ''
    return generateUseHeadCode(analyzedTags.value, framework.value)
  })

  const codeLanguage = computed(() => 'ts' as const)

  async function fetchUrl() {
    if (!url.value)
      return
    loading.value = true
    error.value = ''
    try {
      const result = await $fetch('/api/tools/fetch-head', {
        query: { url: url.value },
      })
      input.value = result.head
      mode.value = 'paste' // Switch to show results
    }
    catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Failed to fetch URL'
    }
    finally {
      loading.value = false
    }
  }

  function reset() {
    input.value = ''
    url.value = ''
    error.value = ''
  }

  return {
    input,
    mode,
    url,
    framework,
    loading,
    error,
    analyzedTags,
    optimalTags,
    score,
    issues,
    fcpImpact,
    hasAnyValue,
    generatedCode,
    codeLanguage,
    fetchUrl,
    reset,
  }
}
