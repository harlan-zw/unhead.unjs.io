export type DocsVersion = 'v3' | 'v2'

const versions = [
  { label: 'v3 (beta)', slug: 'v3' as const, badge: 'beta' },
  { label: 'v2 (stable)', slug: 'v2' as const, badge: 'stable' },
] as const

export function useVersionSelector() {
  const route = useRoute()

  const currentVersion = computed<DocsVersion>(() => {
    return route.path.startsWith('/docs/v2') ? 'v2' : 'v3'
  })

  const selectedVersion = computed(() => {
    return versions.find(v => v.slug === currentVersion.value) || versions[0]
  })

  function getVersionedPath(path: string, version: DocsVersion): string {
    // Remove any existing version prefix
    const cleanPath = path.replace(/^\/docs\/v2/, '/docs')

    if (version === 'v2') {
      return cleanPath.replace(/^\/docs/, '/docs/v2')
    }
    return cleanPath
  }

  return {
    versions,
    currentVersion,
    selectedVersion,
    getVersionedPath,
  }
}
