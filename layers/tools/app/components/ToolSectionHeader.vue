<script setup lang="ts">
import type { ToolColor } from '../utils/tool-colors'

withDefaults(defineProps<{
  title: string
  icon: string
  color?: ToolColor
}>(), {
  color: 'emerald',
})
</script>

<template>
  <div class="flex items-center gap-3 mb-6">
    <UIcon :name="icon" class="w-5 h-5" :class="toolIconClass(color)" />
    <h2 class="text-xl font-semibold text-highlighted">
      {{ title }}
    </h2>
  </div>
</template>
