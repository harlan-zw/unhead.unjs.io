import { getPathWithoutFramework } from '~~/utils/urls'

const items = [
  { icon: 'i-logos-typescript-icon', label: 'TypeScript', slug: 'typescript', import: 'unhead' },
  { icon: 'i-logos-vue', label: 'Vue', slug: 'vue', import: '@unhead/vue' },
  { icon: 'i-logos-react', label: 'React', slug: 'react', import: '@unhead/react' },
  { icon: 'i-logos-svelte-icon', label: 'Svelte', slug: 'svelte', import: '@unhead/svelte' },
  { icon: 'i-logos-solidjs-icon', label: 'Solid.js', slug: 'solid-js', import: '@unhead/solid-js' },
  { icon: 'i-logos-angular-icon', label: 'Angular', slug: 'angular', import: '@unhead/angular' },
  { icon: 'i-logos-nuxt-icon', label: 'Nuxt', slug: 'nuxt', import: '#imports' },
] as const

export function useFrameworkSelector(nav?: ReturnType<typeof useDocsNav>) {
  const router = useRouter()
  const route = useRoute()
  const selectedFramework = useCookie('unhead-selected-framework', { maxAge: 3600 * 3600, default: () => 'typescript' })
  function switchFramework(framework: typeof items[number], redirect: boolean = true) {
    // if the current path contains the framework slug, then we swap to the new one, otherwise we don't
    selectedFramework.value = framework.slug
    if (redirect) {
      if (router.currentRoute.value.path.startsWith('/docs')) {
        // scroll to a little down to indicate the change
        window.scrollTo({ top: 75, behavior: 'smooth' })
      }
    }
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
