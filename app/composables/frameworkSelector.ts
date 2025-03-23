import { getPathFramework, getPathWithFramework, getPathWithoutFramework } from '~~/utils/urls'

const items = [
  { icon: 'i-logos-typescript-icon', label: 'TypeScript', slug: 'typescript', import: 'unhead', schemaImport: '@unhead/schema-org' },
  { icon: 'i-logos-vue', label: 'Vue', slug: 'vue', import: '@unhead/vue', schemaImport: '@unhead/schema-org/vue' },
  { icon: 'i-logos-react', label: 'React', slug: 'react', import: '@unhead/react', schemaImport: '@unhead/schema-org/react' },
  { icon: 'i-logos-svelte-icon', label: 'Svelte', slug: 'svelte', import: '@unhead/svelte', schemaImport: '@unhead/schema-org/svelte' },
  { icon: 'i-logos-solidjs-icon', label: 'Solid.js', slug: 'solid-js', import: '@unhead/solid-js', schemaImport: '@unhead/schema-org/solid-js' },
  { icon: 'i-logos-angular-icon', label: 'Angular', slug: 'angular', import: '@unhead/angular', schemaImport: '@unhead/schema-org/angular' },
  { icon: 'i-logos-nuxt-icon', label: 'Nuxt', slug: 'nuxt', import: '#imports', schemaImport: '#imports' },
] as const

const fallbackFramework = ref()

export function useFrameworkSelector(nav?: ReturnType<typeof useDocsNav>) {
  const route = useRoute()
  const frameworkSlug = computed(() => {
    return getPathFramework(route.path) || fallbackFramework.value
  })
  watch(() => route.path, (v) => {
    if (getPathFramework(v)) {
      frameworkSlug.value = getPathFramework(v)
    }
  }, {
    immediate: true,
  })
  function switchFramework(framework: typeof items[number]) {
    // if the current path contains the framework slug, then we swap to the new one, otherwise we don't
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
      return Math.random() - 0.5
    })
  })
  return {
    switchFramework,
    selectedFramework,
    frameworks: computed(() => {
      if (!nav?.value) {
        return items
      }
      return orderedFrameworks.value.map((f) => {
        const to = getPathWithoutFramework(route.path)
        return {
          ...f,
          to: nav.value.navFlat.find(l => l?.path === to) ? getPathWithFramework(to, f.slug) : `/docs/${f.slug}/head/guides/get-started/installation`,
        }
      })
    }),
  }
}
