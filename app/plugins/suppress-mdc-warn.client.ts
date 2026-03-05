export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.warnHandler = (msg, _instance, _trace) => {
    // Suppress known MDC warning where slots object is passed as children to native <code> elements
    if (msg.includes('Failed setting prop "children" on <code>'))
      return
    // Fall through to default warning behavior
    console.warn(`[Vue warn]: ${msg}`)
  }
})
