import { useFrameworkSelector } from '~/composables/frameworkSelector'

export default defineNuxtPlugin({
  setup() {
    // handle direct links
    const { selectedFramework, switchFramework, frameworks } = useFrameworkSelector()
    const route = useRoute()
    // setup route watcher
    watch(route, () => {
      const subModule = route.path.split('/')[2]
      const newFramework = frameworks.value.find(f => f.slug === subModule)
      if (newFramework && newFramework !== selectedFramework.value) {
        switchFramework(newFramework, false)
      }
    })
  },
})
