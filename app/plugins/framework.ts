import {useFrameworkSelector} from "~/composables/frameworkSelector";

export default defineNuxtPlugin({
  setup() {
    // handle direct links
    const route = useRoute()
    const { switchFramework } = useFrameworkSelector()
    if (route.path.includes('/docs')) {
      const subModule = route.path.split('/')[2]
      const newFramework = frameworks.find(f => f.slug === subModule)
      if (newFramework) {
        switchFramework(newFramework, false)
      }
    }
  }
})

