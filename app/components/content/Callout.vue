<script setup lang="ts">
const props = withDefaults(defineProps<{
  icon?: string
  title?: string
  to?: string
}>(), {
  icon: 'i-ph-info-duotone',
})

const tag = computed(() => props.to ? resolveComponent('NuxtLink') : 'div')
</script>

<template>
  <component
    :is="tag"
    :to="to || undefined"
    class="callout not-prose group my-6 flex gap-3 rounded-lg border border-[var(--ui-border-muted)] bg-[var(--ui-bg-elevated)] p-4"
    :class="to ? 'hover:border-[var(--ui-border-accented)] transition-colors cursor-pointer no-underline' : ''"
  >
    <UIcon :name="icon" class="size-5 shrink-0 mt-0.5 text-[var(--ui-text-primary)]" />
    <div class="min-w-0 flex-1">
      <div v-if="title" class="font-semibold text-sm mb-1 text-[var(--ui-text-highlighted)]">
        {{ title }}
      </div>
      <div class="text-sm leading-relaxed text-[var(--ui-text-muted)] [&_p]:my-0 [&_a]:text-[var(--ui-text-primary)] [&_a]:underline [&_strong]:text-[var(--ui-text-highlighted)] [&_code]:text-xs">
        <slot />
      </div>
    </div>
    <UIcon v-if="to" name="i-ph-arrow-right" class="size-4 shrink-0 self-center text-[var(--ui-text-dimmed)] group-hover:text-[var(--ui-text-primary)] transition-colors" />
  </component>
</template>

<style scoped>
.callout {
  border-left: 3px solid var(--ui-primary);
}
</style>
