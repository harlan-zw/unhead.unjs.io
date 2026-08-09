import { normalizeURL } from 'ufo'

const DocsV2Pattern = /^\/docs\/v2/
const FrameworkPattern = /\/(vue|typescript|react|svelte|solid-js|angular|nuxt)/g
const FrameworkMatchPattern = /\/(vue|typescript|react|svelte|solid-js|angular|nuxt)/

export type DocFramework = 'vue' | 'typescript' | 'react' | 'svelte' | 'solid-js' | 'angular' | 'nuxt'

export type DocPathTarget
  = | { _tag: 'shared', version: 'v2' | 'v3' }
    | { _tag: 'framework', version: 'v2' | 'v3', framework: DocFramework }

export function getDocPath(path: string, target: DocPathTarget): string {
  const versionPrefix = target.version === 'v2' ? '/docs/v2' : '/docs'
  const frameworkPrefix = target._tag === 'framework' ? `/${target.framework}` : ''
  return `${versionPrefix}${frameworkPrefix}/${path.replace(/^\/+/, '')}`
}

export function getPathWithoutVersion(path: string): string {
  return path.replace(DocsV2Pattern, '/docs')
}

export function getPathWithoutFramework(path: string, replacement = ''): string {
  // remove framework slug from path, i.e vue, typescript, etc
  path = path.replace(FrameworkPattern, `/${replacement}`)
  path = normalizeURL(path).replaceAll('//', '/')
  return path
}

export function getPathFramework(path: string): string {
  // get framework slug from path, i.e vue, typescript, etc
  const match = path.match(FrameworkMatchPattern)
  return match ? match[1] : ''
}

export function getPathWithFramework(path: string, framework = ''): string {
  const without = getPathWithoutFramework(path)
  // Handle v2 paths: /docs/v2/head/... → /docs/v2/framework/head/...
  if (without.startsWith('/docs/v2/')) {
    return without.replace('/docs/v2/', `/docs/v2/${framework}/`)
  }
  return without.replace('/docs/', `/docs/${framework}/`)
}

export function getLastPathSegment(path: string) {
  // Split the path into segments
  const segments = path.split('/')

  // Return the last 'size' segments joined by '/'
  return segments.slice(-1).join('/')
}

export function getPathSegments(path: string, size: number): string {
  const normalized = normalizeURL(path).replaceAll('//', '/')
  const segments = normalized.split('/').filter(Boolean)

  // Check if the number of segments is less than or equal to the size
  if (segments.length <= size) {
    return normalized || '/'
  }

  // Return the first 'size' segments joined by '/'
  return `/${segments.slice(0, size).join('/')}`
}

export function getPathSubSection(path: string): string {
  return getPathSegments(path, 3)
}

export function getPathSection(path: string): string {
  return getPathSegments(path, 2)
}
