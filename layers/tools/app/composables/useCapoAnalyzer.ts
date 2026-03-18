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
  message: string
  severity: 'error' | 'warning' | 'info'
  tag: AnalyzedTag
  suggestedPosition: number
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

const TagRegex = /<(meta|link|title|base|style|script|noscript)(?:\s[^>]*?)?\/?>(?:([\s\S]*?)<\/\1>)?/gi
const AttrRegex = /(\w[\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g

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

function parseHeadTags(html: string): ParsedTag[] {
  const tags: ParsedTag[] = []
  // Match self-closing and open tags with optional content
  for (const match of html.matchAll(TagRegex)) {
    const [raw, tagName, attrString, content] = match
    const attributes: Record<string, string> = {}

    if (attrString) {
      for (const attrMatch of attrString.matchAll(AttrRegex)) {
        const [, name, v1, v2, v3] = attrMatch
        attributes[name] = v1 ?? v2 ?? v3 ?? ''
      }
    }

    tags.push({
      tag: tagName.toLowerCase(),
      attributes,
      content: content?.trim(),
      raw,
    })
  }

  return tags
}

// Kendall tau distance — count inversions between current and optimal order
function computeScore(tags: AnalyzedTag[]): number {
  if (tags.length <= 1)
    return 100

  const optimal = tags.toSorted((a, b) => a.weight - b.weight)
  let inversions = 0
  const total = tags.length * (tags.length - 1) / 2

  for (let i = 0; i < tags.length; i++) {
    for (let j = i + 1; j < tags.length; j++) {
      const currentOrder = tags.indexOf(tags[i]) - tags.indexOf(tags[j])
      const optimalOrder = optimal.indexOf(tags[i]) - optimal.indexOf(tags[j])
      if ((currentOrder > 0 && optimalOrder < 0) || (currentOrder < 0 && optimalOrder > 0))
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

    if (i !== optimalIndex) {
      const diff = i - optimalIndex
      if (diff > 0) {
        // Tag should be earlier
        const blockingTag = tags[optimalIndex]
        issues.push({
          message: `Move ${tag.weightLabel} (${formatTagName(tag)}) before ${blockingTag.weightLabel} (${formatTagName(blockingTag)})`,
          severity: Math.abs(diff) > 3 ? 'error' : 'warning',
          tag,
          suggestedPosition: optimalIndex,
        })
      }
    }
  }

  return issues
}

function formatTagName(tag: AnalyzedTag): string {
  if (tag.tag === 'meta') {
    if (tag.attributes.charset)
      return '<meta charset>'
    if (tag.attributes.name)
      return `<meta name="${tag.attributes.name}">`
    if (tag.attributes['http-equiv'])
      return `<meta http-equiv="${tag.attributes['http-equiv']}">`
    if (tag.attributes.property)
      return `<meta property="${tag.attributes.property}">`
  }
  if (tag.tag === 'link')
    return `<link rel="${tag.attributes.rel || '?'}">`
  if (tag.tag === 'script' && tag.attributes.src) {
    const src = tag.attributes.src.split('/').pop() || tag.attributes.src
    return `<script src=".../${src}">`
  }
  return `<${tag.tag}>`
}

function generateUseHeadCode(tags: AnalyzedTag[], framework: string): string {
  const sorted = tags.toSorted((a, b) => a.weight - b.weight)
  const importName = framework === 'nuxt' ? '#imports' : framework === 'vue' ? '@unhead/vue' : 'unhead'

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
      const attrs = Object.entries(tag.attributes).map(([k, v]) => `${k}: '${v}'`).join(', ')
      meta.push(`    { ${attrs} }`)
    }
    else if (tag.tag === 'link') {
      const attrs = Object.entries(tag.attributes).map(([k, v]) => `${k}: '${v}'`).join(', ')
      links.push(`    { ${attrs} }`)
    }
    else if (tag.tag === 'script') {
      const attrs = Object.entries(tag.attributes).map(([k, v]) => v ? `${k}: '${v}'` : `${k}: true`).join(', ')
      if (tag.content) {
        scripts.push(`    { ${attrs}, innerHTML: \`${tag.content.trim()}\` }`)
      }
      else {
        scripts.push(`    { ${attrs} }`)
      }
    }
    else if (tag.tag === 'style') {
      styles.push(`    { innerHTML: \`${tag.content?.trim() || ''}\` }`)
    }
  }

  const parts: string[] = []
  if (title)
    parts.push(`  title: '${title}'`)
  if (base)
    parts.push(`  base: { href: '${base}' }`)
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
    hasAnyValue,
    generatedCode,
    codeLanguage,
    fetchUrl,
    reset,
  }
}
