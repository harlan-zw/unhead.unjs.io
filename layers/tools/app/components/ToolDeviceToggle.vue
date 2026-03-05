<script setup lang="ts">
defineProps<{
  disabled?: boolean
  showLabels?: boolean
}>()

const model = defineModel<'mobile' | 'desktop'>({ default: 'mobile' })
</script>

<template>
  <div class="inline-flex rounded-lg border border-[var(--ui-border)] p-0.5 bg-[var(--ui-bg-muted)]">
    <button
      type="button"
      class="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5"
      :class="[model === 'mobile' ? 'bg-[var(--ui-bg)] text-[var(--ui-text-highlighted)] shadow-sm' : 'text-[var(--ui-text-dimmed)] hover:text-[var(--ui-text-muted)]']"
      :disabled="disabled"
      @click="model = 'mobile'"
    >
      <UIcon name="i-heroicons-device-phone-mobile" class="w-5 h-5" />
      <span v-if="showLabels">Mobile</span>
    </button>
    <button
      type="button"
      class="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5"
      :class="[model === 'desktop' ? 'bg-[var(--ui-bg)] text-[var(--ui-text-highlighted)] shadow-sm' : 'text-[var(--ui-text-dimmed)] hover:text-[var(--ui-text-muted)]']"
      :disabled="disabled"
      @click="model = 'desktop'"
    >
      <UIcon name="i-heroicons-computer-desktop" class="w-5 h-5" />
      <span v-if="showLabels">Desktop</span>
    </button>
  </div>
</template>
