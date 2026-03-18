<script setup lang="ts">
const props = defineProps<{
  streams: 'Yes' | 'No' | 'Opt-in'
  headSafe: 'Yes' | 'With discipline' | 'With config'
}>()

const streamsStyle = {
  'Yes': 'text-[var(--ui-text-success)]',
  'No': 'text-dimmed',
  'Opt-in': 'text-muted',
} as const

const headSafeStyle = {
  'Yes': { text: 'text-[var(--ui-text-success)]', icon: 'i-ph-check-circle-duotone' },
  'With config': { text: 'text-[var(--ui-text-warning)]', icon: 'i-ph-gear-duotone' },
  'With discipline': { text: 'text-[var(--ui-text-warning)]', icon: 'i-ph-warning-circle-duotone' },
} as const
</script>

<template>
  <div class="not-prose mb-5 inline-flex items-center gap-px rounded-lg border border-default bg-elevated text-[11px] overflow-hidden">
    <div class="flex items-center gap-1.5 px-3 py-1.5 border-r border-muted">
      <span class="text-dimmed font-medium">Streams</span>
      <span :class="streamsStyle[props.streams]" class="font-bold">{{ props.streams }}</span>
    </div>
    <div class="flex items-center gap-1.5 px-3 py-1.5">
      <span class="text-dimmed font-medium">Complete head</span>
      <UIcon :name="headSafeStyle[props.headSafe].icon" :class="headSafeStyle[props.headSafe].text" class="size-3.5" />
      <span :class="headSafeStyle[props.headSafe].text" class="font-bold">{{ props.headSafe }}</span>
    </div>
  </div>
</template>
