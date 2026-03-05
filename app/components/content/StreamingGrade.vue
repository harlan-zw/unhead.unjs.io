<script setup lang="ts">
const props = defineProps<{
  streams: 'Yes' | 'No' | 'Opt-in'
  headSafe: 'Yes' | 'With discipline' | 'With config'
}>()

const streamsStyle = {
  'Yes': 'text-[var(--ui-text-success)]',
  'No': 'text-[var(--ui-text-dimmed)]',
  'Opt-in': 'text-[var(--ui-text-muted)]',
} as const

const headSafeStyle = {
  'Yes': { text: 'text-[var(--ui-text-success)]', icon: 'i-ph-check-circle-duotone' },
  'With config': { text: 'text-[var(--ui-text-warning)]', icon: 'i-ph-gear-duotone' },
  'With discipline': { text: 'text-[var(--ui-text-warning)]', icon: 'i-ph-warning-circle-duotone' },
} as const
</script>

<template>
  <div class="not-prose mb-5 inline-flex items-center gap-px rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] text-[11px] overflow-hidden">
    <div class="flex items-center gap-1.5 px-3 py-1.5 border-r border-[var(--ui-border-muted)]">
      <span class="text-[var(--ui-text-dimmed)] font-medium">Streams</span>
      <span :class="streamsStyle[props.streams]" class="font-bold">{{ props.streams }}</span>
    </div>
    <div class="flex items-center gap-1.5 px-3 py-1.5">
      <span class="text-[var(--ui-text-dimmed)] font-medium">Complete head</span>
      <UIcon :name="headSafeStyle[props.headSafe].icon" :class="headSafeStyle[props.headSafe].text" class="size-3.5" />
      <span :class="headSafeStyle[props.headSafe].text" class="font-bold">{{ props.headSafe }}</span>
    </div>
  </div>
</template>
