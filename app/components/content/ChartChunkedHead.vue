<script setup lang="ts">
import { VisAxis, VisGroupedBar, VisXYContainer } from '@unovis/vue'

const seriesColors = ['#06b6d4', '#f59e0b']

const data = [
  { name: 'Title', nonChunked: 70.1, chunked: 71.1 },
  { name: 'Description', nonChunked: 66.4, chunked: 73.3 },
  { name: 'Canonical', nonChunked: 53.9, chunked: 44.4 },
  { name: 'OG Image', nonChunked: 44.6, chunked: 48.9 },
  { name: 'JSON-LD', nonChunked: 19.5, chunked: 6.7 },
]

type D = typeof data[number]

const x = (_d: D, i: number) => i
const y = [
  (d: D) => d.nonChunked,
  (d: D) => d.chunked,
]
const tickFormat = (i: number) => data[i]?.name ?? ''

const legend = [
  { label: 'Non-Chunked', color: seriesColors[0] },
  { label: 'Chunked', color: seriesColors[1] },
]
</script>

<template>
  <ClientOnly>
    <figure class="chart-container my-8 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-5 not-prose">
      <figcaption class="flex items-center justify-between mb-4">
        <span class="text-sm font-medium text-[var(--ui-text)]">
          Tag Presence in First 5KB — Next.js
        </span>
        <span class="flex flex-wrap gap-3 text-xs text-[var(--ui-text-muted)]">
          <span v-for="item in legend" :key="item.label" class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
            {{ item.label }}
          </span>
        </span>
      </figcaption>
      <VisXYContainer :data="data" height="280" class="w-full">
        <VisGroupedBar
          :x="x"
          :y="y"
          :color="seriesColors"
          :rounded-corners="3"
          :bar-padding="0.1"
          :group-padding="0.25"
        />
        <VisAxis type="x" :tick-format="tickFormat" :num-ticks="data.length" :grid-line="false" :domain-line="false" :tick-line="false" />
        <VisAxis type="y" :tick-format="(v: number) => `${v}%`" :grid-line="false" :domain-line="false" :tick-line="false" />
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
