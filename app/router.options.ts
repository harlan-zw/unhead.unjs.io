import type { RouterConfig } from '@nuxt/schema'
import { resolveHashScrollPosition } from './utils/hash-scroll'

function findHashPosition(hash: string) {
  return resolveHashScrollPosition(hash, {
    getElementById: id => document.getElementById(id),
    // vue-router does not incorporate scroll-margin-top on its own.
    getScrollMarginTop: (element) => {
      const margin = Number.parseFloat(getComputedStyle(element).scrollMarginTop)
      return Number.isFinite(margin) ? margin : 0
    },
  })
}

// https://router.vuejs.org/api/#routeroptions
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp()

    // If history back
    if (savedPosition) {
      // Handle Suspense resolution
      return new Promise((resolve) => {
        nuxtApp.hooks.hookOnce('page:finish', () => {
          setTimeout(resolve, 50, savedPosition)
        })
      })
    }

    // Scroll to heading on click
    if (to.hash) {
      return new Promise((resolve) => {
        if (to.path === from.path) {
          setTimeout(() => resolve(findHashPosition(to.hash)), 50)
        }
        else {
          nuxtApp.hooks.hookOnce('page:finish', () => {
            setTimeout(() => resolve(findHashPosition(to.hash)), 50)
          })
        }
      })
    }

    // Scroll to top of window
    return { top: 0 }
  },
}
