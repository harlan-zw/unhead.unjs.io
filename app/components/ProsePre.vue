<script lang="ts">
import theme from '#build/ui/prose/pre'
</script>

<script setup lang="ts">
import { useAppConfig } from '#imports'
import UCodeIcon from '#ui/components/prose/CodeIcon.vue'
import { useLocale } from '#ui/composables/useLocale'
import { tv } from '#ui/utils/tv'
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
  icon?: string
  code?: string
  language?: string
  filename?: string
  highlights?: number[]
  hideHeader?: boolean
  meta?: string
  class?: any
  ui?: Partial<typeof ui.value>
}>()

const slots = useSlots()

const { t } = useLocale()
const { copy, copied } = useClipboard()
const appConfig = useAppConfig()
const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.prose?.pre || {} })())

const { selectedFramework } = useFrameworkSelector()

// look at default slot content
const processedContent = computed(() => {
  const defaultSlot = slots.default?.()
  if (!defaultSlot)
    return defaultSlot

  // Create a deep copy of the VNodes to avoid mutating the original
  return defaultSlot.map((vnode) => {
    if (!vnode.children)
      return vnode

    // Process the content recursively
    const processNode = (node) => {
      if (Array.isArray(node)) {
        // Process arrays of children
        return node.map(processNode)
      }
      else if (typeof node === 'string') {
        return node
          .replace('@unhead/dynamic-import', `@unhead/${selectedFramework.value.slug}`)
          .replace('@FRAMEWORK_NAME@', selectedFramework.value.label)
      }
      else if (typeof node === 'object') {
        node.children = processNode(node.children)
      }
      return node
    }

    // Return a cloned node with processed content
    return h(vnode.type, vnode.props, processNode(vnode.children))
  })
})
</script>

<template>
  <div :class="ui.root({ class: [props.ui?.root], filename: !!filename })">
    <div v-if="filename && !hideHeader" :class="ui.header({ class: props.ui?.header })">
      <UCodeIcon :icon="icon" :filename="filename" :class="ui.icon({ class: props.ui?.icon })" />

      <span :class="ui.filename({ class: props.ui?.filename })">{{ filename }}</span>
    </div>

    <UButton
      :icon="copied ? appConfig.ui.icons.copyCheck : appConfig.ui.icons.copy"
      color="neutral"
      variant="outline"
      size="sm"
      :aria-label="t('prose.pre.copy')"
      :class="ui.copy({ class: props.ui?.copy })"
      tabindex="-1"
      @click="copy(props.code || '')"
    />

    <pre v-bind="$attrs" :key="selectedFramework.slug" :class="ui.base({ class: [props.ui?.base, props.class] })"><component :is="{ render: () => processedContent }" /></pre>
  </div>
</template>

<style>
.shiki span.line{display:block}.shiki span.line.highlight{margin:0 -16px;padding:0 16px;@apply bg-(--ui-bg-accented)/50}
</style>
