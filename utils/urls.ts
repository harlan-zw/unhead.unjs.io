import { normalizeURL } from 'ufo'

const DocsV2Pattern = /^\/docs\/v2/
const FrameworkPattern = /\/(vue|typescript|react|svelte|solid-js|angular|nuxt)/g
const FrameworkMatchPattern = /\/(vue|typescript|react|svelte|solid-js|angular|nuxt)/

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
  // Split the path into segments
  const segments = path.split('/')

  // Check if the number of segments is less than or equal to the size
  if (segments.length <= size) {
    return path
  }

  // Return the last 'size' segments joined by '/'
  return segments.slice(0, size + 1).join('/')
}

export function getPathSubSection(path: string): string {
  return getPathSegments(path, 3)
}

export function getPathSection(path: string): string {
  return getPathSegments(path, 2)
}
