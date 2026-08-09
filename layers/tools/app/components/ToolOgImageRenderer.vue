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

const activated = ref(false)

function activate() {
  activated.value = true
}
</script>

<template>
  <div
    class="contents"
    @pointerover.once="activate"
    @focusin.once="activate"
    @click.once="activate"
  >
    <LazyToolOgImageRenderController
      v-if="activated"
      v-model:ready="ready"
      v-model:rendering="rendering"
      v-model:result="result"
      v-model:error="error"
      :code="code"
      :width="width"
      :height="height"
    />
    <slot />
  </div>
</template>
