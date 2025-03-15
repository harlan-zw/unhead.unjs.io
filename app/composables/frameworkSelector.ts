import { joinRelativeURL } from 'ufo'

export const frameworks = [
  { icon: 'i-logos-typescript-icon', label: 'TypeScript', slug: 'typescript', import: 'unhead' },
  { icon: 'i-logos-vue', label: 'Vue', slug: 'vue', import: '@unhead/vue' },
  { icon: 'i-logos-react', label: 'React', slug: 'react', import: '@unhead/react' },
  { icon: 'i-logos-svelte-icon', label: 'Svelte', slug: 'svelte', import: '@unhead/svelte' },
  { icon: 'i-logos-solidjs-icon', label: 'Solid.js', slug: 'solid-js', import: '@unhead/solid-js' },
  { icon: 'i-logos-angular-icon', label: 'Angular', slug: 'angular', import: '@unhead/angular' },
  { icon: 'i-logos-nuxt-icon', label: 'Nuxt', slug: 'nuxt', import: '#imports' },
] as const

export function useFrameworkSelector() {
  const router = useRouter()
  const selectedFramework = useCookie('framework', { default: () => 'typescript' })
  const toast = useToast()
  function switchFramework(framework: typeof frameworks[number], redirect: boolean = true) {
    // if the current path contains the framework slug, then we swap to the new one, otherwise we don't
    selectedFramework.value = framework.slug
    if (redirect) {
      const frameworkSlug = router.currentRoute.value.path.includes(selectedFramework.value) ? framework.slug : ''
      if (!frameworkSlug) {
        if (router.currentRoute.value.path.startsWith('/docs')) {
          // scroll to a little down to indicate the change
          window.scrollTo({ top: 75, behavior: 'smooth' })
        }
        return
      }
      // if path 2nd arg is schema-org or scripts we're in a sub module
      const lastPath = router.currentRoute.value.path.split('/').pop()
      const validRedirectPaths = ['introduction', 'installation', 'troubleshooting']
      const lastPathRedirect = validRedirectPaths.includes(lastPath) ? lastPath : 'installation'
      const subModule = router.currentRoute.value.path.split('/')[2]
      if (['schema-org', 'scripts'].includes(subModule)) {
        return router.push(joinRelativeURL('/docs', subModule, frameworkSlug, lastPathRedirect))
      }
      router.push(joinRelativeURL('/docs', frameworkSlug, lastPathRedirect))
    }
  }
  return {
    switchFramework,
    selectedFramework: computed(() => {
      return frameworks.find(f => f.slug === selectedFramework.value) || frameworks.find(f => f.slug === 'typescript')
    }),
    frameworks,
  }
}
