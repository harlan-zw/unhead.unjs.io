<script setup lang="ts">
import { VisAxis, VisStackedBar, VisXYContainer } from '@unovis/vue'

const colors = {
  blocker: '#06b6d4',
  firstFlush: '#f59e0b',
  patcher: '#8b5cf6',
}

const data = [
  { name: 'Angular', value: 37.5, type: 'firstFlush' as const },
  { name: 'SvelteKit', value: 16.0, type: 'firstFlush' as const },
  { name: 'Gatsby', value: 13.9, type: 'patcher' as const },
  { name: 'Nuxt.js', value: 10.5, type: 'blocker' as const },
  { name: 'Next.js', value: 9.6, type: 'patcher' as const },
  { name: 'Astro', value: 3.4, type: 'blocker' as const },
  { name: 'Remix', value: 2.8, type: 'blocker' as const },
  { name: 'Qwik', value: 2.0, type: 'blocker' as const },
]

const x = (_d: typeof data[number], i: number) => i
const y = [
  (d: typeof data[number]) => d.type === 'blocker' ? d.value : 0,
  (d: typeof data[number]) => d.type === 'firstFlush' ? d.value : 0,
  (d: typeof data[number]) => d.type === 'patcher' ? d.value : 0,
]
const color = [colors.blocker, colors.firstFlush, colors.patcher]
const tickFormat = (i: number) => data[i]?.name ?? ''

const legend = [
  { label: 'Blocker', color: colors.blocker },
  { label: 'First-Flush', color: colors.firstFlush },
  { label: 'Patcher', color: colors.patcher },
]
</script>

<template>
  <ClientOnly>
    <figure class="chart-container my-8 rounded-xl border border-default bg-elevated p-5 not-prose">
      <figcaption class="flex items-center justify-between mb-4">
        <span class="text-sm font-medium text-default">
          % Title Changed on Render
        </span>
        <span class="flex flex-wrap gap-3 text-xs text-muted">
          <span v-for="item in legend" :key="item.label" class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
            {{ item.label }}
          </span>
        </span>
      </figcaption>
      <VisXYContainer :data="data" height="280" class="w-full">
        <VisStackedBar
          orientation="horizontal"
          :x="x"
          :y="y"
          :color="color"
          :rounded-corners="3"
          :bar-padding="0.2"
        />
        <VisAxis type="y" :tick-format="tickFormat" :num-ticks="data.length" :grid-line="false" :domain-line="false" :tick-line="false" />
        <VisAxis type="x" :tick-format="(v: number) => `${v}%`" :grid-line="false" :domain-line="false" :tick-line="false" />
      </VisXYContainer>
    </figure>
  </ClientOnly>
</template>

<style scoped>
.chart-container :deep(.vis-axis .tick text) {
  fill: var(--ui-text-muted);
  font-size: 12px;
}
.chart-container :deep(.vis-axis .domain) {
  stroke: var(--ui-border);
}
</style>
