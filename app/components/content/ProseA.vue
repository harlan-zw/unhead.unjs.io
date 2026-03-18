<script setup lang="ts">
import { useVersionSelector } from '~/composables/versionSelector'

const props = defineProps({
  href: {
    type: String,
    default: '',
  },
  target: {
    type: String,
    default: undefined,
    required: false,
  },
})

const { currentVersion, getVersionedPath } = useVersionSelector()

const resolvedHref = computed(() => {
  // Only transform internal doc links when on v2
  if (currentVersion.value === 'v2' && props.href?.startsWith('/docs') && !props.href.startsWith('/docs/v2')) {
    return getVersionedPath(props.href, 'v2')
  }
  return props.href
})
</script>

<template>
  <!-- eslint-disable-next-line harlanzw/link-require-descriptive-text -- text provided via slot -->
  <NuxtLink
    :href="resolvedHref"
    :target="target"
    class="border-b border-transparent hover:border-primary font-medium focus-visible:outline-primary focus-visible:has-[>code]:outline-0 [&>code]:border-dashed hover:[&>code]:border-primary hover:[&>code]:text-primary focus-visible:[&>code]:border-primary focus-visible:[&>code]:text-primary [&>code]:transition-colors relative border-none underline underline-offset-6 text-default decoration-[0.1rem] decoration-[var(--ui-text-secondary)] transition-all hover:text-[var(--ui-text-secondary)] hover:underline-offset-4 hover:decoration-[0.25rem]"
  >
    <slot />
  </NuxtLink>
</template>
