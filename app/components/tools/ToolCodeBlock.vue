<script setup lang="ts">
const props = defineProps<{
  code: string
  lang: 'ts' | 'json' | 'html' | 'vue'
}>()

const { highlight, initHighlighter } = useShikiHighlighter()
const colorMode = useColorMode()

const highlightedCode = ref('')

// Initialize highlighter on mount
onMounted(() => {
  initHighlighter()
})

// Watch for code/lang/theme changes
watchEffect(async () => {
  if (!props.code) {
    highlightedCode.value = ''
    return
  }
  // Access colorMode.value to create reactive dependency
  const _ = colorMode.value
  highlightedCode.value = await highlight(props.code, props.lang)
})
</script>

<template>
  <div class="tool-code-block not-prose">
    <div v-if="highlightedCode" v-html="highlightedCode" />
    <pre v-else class="p-4 bg-[var(--ui-bg-elevated)] rounded-lg overflow-x-auto"><code>{{ code }}</code></pre>
  </div>
</template>

<style>
.tool-code-block pre.shiki {
  border-radius: 0.75rem !important;
  overflow-x: auto;
  font-size: 0.875rem !important;
  background-color: var(--ui-bg-elevated) !important;
}

.tool-code-block pre.shiki code {
  display: block;
  padding: 1.25rem !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.tool-code-block .shiki span.line {
  line-height: 0.5 !important;
}
</style>
