<script setup lang="ts">
const { code, width, height } = defineProps<{
  code: string
  width: number
  height: number
}>()

const ready = defineModel<boolean>('ready', { default: false })
const rendering = defineModel<boolean>('rendering', { default: false })
const result = defineModel<string | null>('result', { default: null })
const error = defineModel<string | null>('error', { default: null })

const renderer = useTakumiRenderer()

watch(renderer.isReady, value => ready.value = value, { immediate: true })
watch(renderer.isRendering, value => rendering.value = value, { immediate: true })
watch(renderer.result, value => result.value = value, { immediate: true })
watch(renderer.error, value => error.value = value, { immediate: true })

const render = useDebounceFn(() => {
  if (!renderer.isReady.value)
    return

  void renderer.render(code, {
    width,
    height,
    format: 'png',
  }).catch((renderError) => {
    error.value = renderError instanceof Error ? renderError.message : 'Image rendering failed'
  })
}, 500)

watch([() => code, () => width, () => height], render)
watch(renderer.isReady, (value) => {
  if (value)
    render()
})
</script>

<template>
  <span hidden />
</template>
