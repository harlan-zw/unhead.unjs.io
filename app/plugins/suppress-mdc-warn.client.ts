// MDC passes a slots object as the `children` prop of a native `<code>` element,
// which Vue reports as a development warning on every highlighted code block.
//
// A Vue app holds exactly one `warnHandler`. This plugin used to assign to it,
// which silently discarded the handler the Nuxt DX overlay had installed, so the
// overlay reported no warnings on this site. Keep the displaced handler and call
// it for every warning this plugin does not suppress.
export default defineNuxtPlugin((nuxtApp) => {
  const config = nuxtApp.vueApp.config
  const previous = config.warnHandler

  config.warnHandler = (msg, instance, trace) => {
    if (msg.includes('Failed setting prop "children" on <code>'))
      return

    if (previous)
      previous(msg, instance, trace)
    else
      console.warn(`[Vue warn]: ${msg}`)
  }
})
