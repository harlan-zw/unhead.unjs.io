import type { ComputedRef, Ref } from 'vue'
import { getPathFramework, getPathWithFramework, getPathWithoutFramework } from '~~/utils/urls'
import { useVersionSelector } from '~/composables/versionSelector'

const items = [
  { icon: 'i-logos-typescript-icon', label: 'TypeScript', slug: 'typescript', import: 'unhead', schemaImport: '@unhead/schema-org' },
  { icon: 'i-logos-vue', label: 'Vue', slug: 'vue', import: '@unhead/vue', schemaImport: '@unhead/schema-org/vue' },
  { icon: 'i-logos-react', label: 'React', slug: 'react', import: '@unhead/react', schemaImport: '@unhead/schema-org/react' },
  { icon: 'i-logos-svelte-icon', label: 'Svelte', slug: 'svelte', import: '@unhead/svelte', schemaImport: '@unhead/schema-org/svelte' },
  { icon: 'i-logos-solidjs-icon', label: 'Solid.js', slug: 'solid-js', import: '@unhead/solid-js', schemaImport: '@unhead/schema-org/solid-js' },
  { icon: 'i-logos-angular-icon', label: 'Angular', slug: 'angular', import: '@unhead/angular', schemaImport: '@unhead/schema-org/angular' },
  { icon: 'i-logos-nuxt-icon', label: 'Nuxt', slug: 'nuxt', import: '#imports', schemaImport: '#imports' },
] as const

export interface FrameworkNav {
  navFlat: { path: string }[]
}

export function useFrameworkSelector(nav?: Ref<FrameworkNav | undefined> | ComputedRef<FrameworkNav | undefined>) {
  const route = useRoute()
  const routeFramework = computed(() => getPathFramework(route.path))
  const fallbackFramework = useState<string | undefined>('fallback-framework', () => routeFramework.value || undefined)
  const { currentVersion } = useVersionSelector()
  watch(routeFramework, (framework) => {
    if (framework) {
      fallbackFramework.value = framework
    }
  }, { immediate: true })

  const versionPrefix = computed(() => currentVersion.value === 'v2' ? '/docs/v2' : '/docs')

  const frameworkSlug = computed(() => {
    return routeFramework.value || fallbackFramework.value
  })
  function switchFramework(framework: typeof items[number]) {
    fallbackFramework.value = framework.slug
  }
  const selectedFramework = computed(() => {
    return items.find(f => f.slug === frameworkSlug.value) || items.find(f => f.slug === 'typescript')
  })
  const orderedFrameworks = computed(() => {
    return items.toSorted((a, b) => {
      // make sure selectedFramework.value is first
      if (a.slug === selectedFramework.value.slug) {
        return -1
      }
      if (b.slug === selectedFramework.value.slug) {
        return 1
      }
      return 0
    })
  })
  return {
    switchFramework,
    selectedFramework,
    frameworks: computed(() => {
      if (!nav?.value) {
        return items.map(f => ({
          ...f,
          to: `${versionPrefix.value}/${f.slug}/head/guides/get-started/installation`,
        }))
      }
      return orderedFrameworks.value.map((f) => {
        const canonicalPath = getPathWithoutFramework(route.path)
        const frameworkPath = getPathWithFramework(canonicalPath, f.slug)
        const fallbackPath = `${versionPrefix.value}/${f.slug}/head/guides/get-started/installation`
        const hasCanonicalPath = nav.value.navFlat.some(l => l?.path === canonicalPath)
        const hasFrameworkPath = nav.value.navFlat.some(l => l?.path === frameworkPath)
        return { ...f, to: hasFrameworkPath ? frameworkPath : hasCanonicalPath ? canonicalPath : fallbackPath }
      })
    }),
  }
}
