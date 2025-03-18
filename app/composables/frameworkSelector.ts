import { getPathFramework, getPathWithoutFramework } from '~~/utils/urls'

const items = [
  { icon: 'i-logos-typescript-icon', label: 'TypeScript', slug: 'typescript', import: 'unhead' },
  { icon: 'i-logos-vue', label: 'Vue', slug: 'vue', import: '@unhead/vue' },
  { icon: 'i-logos-react', label: 'React', slug: 'react', import: '@unhead/react' },
  { icon: 'i-logos-svelte-icon', label: 'Svelte', slug: 'svelte', import: '@unhead/svelte' },
  { icon: 'i-logos-solidjs-icon', label: 'Solid.js', slug: 'solid-js', import: '@unhead/solid-js' },
  { icon: 'i-logos-angular-icon', label: 'Angular', slug: 'angular', import: '@unhead/angular' },
  { icon: 'i-logos-nuxt-icon', label: 'Nuxt', slug: 'nuxt', import: '#imports' },
] as const

const fallbackFramework = ref()

export function useFrameworkSelector(nav?: ReturnType<typeof useDocsNav>) {
  const route = useRoute()
  const selectedFramework = computed(() => {
    return getPathFramework(route.path) || fallbackFramework.value
  })
  watch(() => route.path, (v) => {
    if (getPathFramework(v)) {
      fallbackFramework.value = getPathFramework(v)
    }
  }, {
    immediate: true,
  })
  function switchFramework(framework: typeof items[number]) {
    // if the current path contains the framework slug, then we swap to the new one, otherwise we don't
    fallbackFramework.value = framework.slug
  }
  return {
    switchFramework,
    selectedFramework: computed(() => {
      return items.find(f => f.slug === selectedFramework.value) || items.find(f => f.slug === 'typescript')
    }),
    frameworks: computed(() => {
      if (!nav?.value) {
        return items
      }
      return items.map((f) => {
        const to = getPathWithoutFramework(route.path)
        return {
          ...f,
          to: nav.value.navFlat.find(l => l?.path === to) ? getPathWithoutFramework(route.path, f.slug) : '/',
        }
      })
    }),
  }
}
