import { useFrameworkSelector } from '~/composables/frameworkSelector'
import { modules } from '../../const'

export function useModule(_slug?: Ref<string>) {
  const { selectedFramework } = useFrameworkSelector()
  const route = useRoute()
  const stats = inject('stats', ref({ modules: [] }))
  return computed(() => {
    let slug = selectedFramework.value.slug === 'typescript' ? 'unhead' : selectedFramework.value.slug
    const maybeSubModulePath = route.path.split('/')[2]
    if (['schema-org', 'scripts'].includes(maybeSubModulePath)) {
      slug = maybeSubModulePath
    }
    const moduleData = {
      ...(stats.value?.modules.find(m => m.slug === slug) || {}),
      ...(modules.find(m => m.slug === slug) || {}),
    }
    if (['schema-org', 'scripts'].includes(maybeSubModulePath)) {
      moduleData.label = `@unhead/${maybeSubModulePath}`
    }
    else {
      moduleData.label = `@unhead/${selectedFramework.value.slug}`
      moduleData.icon = selectedFramework.value.icon
      moduleData.description = `Full-stack <head> package built for ${selectedFramework.value.label}.`
    }
    return moduleData
  })
}
