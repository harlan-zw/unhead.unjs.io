import { joinRelativeURL } from 'ufo'

export const frameworks = [
  { icon: 'i-logos-typescript-icon', label: 'TypeScript', slug: 'typescript' },
  { icon: 'i-logos-vue', label: 'Vue', slug: 'vue' },
  { icon: 'i-logos-react', label: 'React', slug: 'react' },
  { icon: 'i-logos-svelte-icon', label: 'Svelte', slug: 'svelte', soon: true },
  { icon: 'i-logos-angular-icon', label: 'Angular', slug: 'angular', soon: true },
  { icon: 'i-logos-nuxt-icon', label: 'Nuxt', slug: 'nuxt' },
] as const

export function useFrameworkSelector() {
  const router = useRouter()
  const selectedFramework = useCookie('framework', { default: () => 'typescript' })
  const toast = useToast()
  function switchFramework(framework: typeof frameworks[number]) {
    if (framework.soon) {
      toast.add({
        title: 'Coming Soon',
        description: `Support for ${framework.label} is coming soon!`,
        duration: 5000,
        isClosable: true,
      })
      return
    }
    // if the current path contains the framework slug, then we swap to the new one, otherwise we don't
    const frameworkSlug = router.currentRoute.value.path.includes(selectedFramework.value) ? framework.slug : ''
    selectedFramework.value = framework.slug
    // if path 2nd arg is schema-org or scripts we're in a sub module
    const lastPath = router.currentRoute.value.path.split('/').pop()
    const validRedirectPaths = ['introduction', 'installation', 'troubleshooting']
    const lastPathRedirect = validRedirectPaths.includes(lastPath) ? lastPath : 'introduction'
    const subModule = router.currentRoute.value.path.split('/')[2]
    if (['schema-org', 'scripts'].includes(subModule)) {
      return router.push(joinRelativeURL('/docs', subModule, frameworkSlug, lastPathRedirect))
    }
    router.push(joinRelativeURL('/docs', frameworkSlug, lastPathRedirect))
  }
  return {
    switchFramework,
    selectedFramework: computed(() => {
      return frameworks.find(f => f.slug === selectedFramework.value) || frameworks.find(f => f.slug === 'typescript')
    }),
    frameworks,
  }
}
