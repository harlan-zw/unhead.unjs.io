<script setup lang="ts">
import { VisAxis, VisGroupedBar, VisXYContainer } from '@unovis/vue'

const metricColors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b']

const data = [
  { name: 'Astro', fcp: 44.9, lcp: 44.9, cls: 50.1, inp: 52.9 },
  { name: 'SvelteKit', fcp: 42.3, lcp: 41.8, cls: 50.8, inp: 51.1 },
  { name: 'Angular', fcp: 40.3, lcp: 37.4, cls: 54.9, inp: 51.7 },
  { name: 'Gatsby', fcp: 39.6, lcp: 37.1, cls: 44.8, inp: 44.9 },
  { name: 'Next.js', fcp: 38.2, lcp: 36.9, cls: 46.5, inp: 46.4 },
  { name: 'Nuxt.js', fcp: 37.3, lcp: 36.4, cls: 47.8, inp: 47.6 },
  { name: 'Remix', fcp: 33.6, lcp: 35.5, cls: 46.9, inp: 48.1 },
  { name: 'Qwik', fcp: 30.1, lcp: 29.5, cls: 35.5, inp: 38.3 },
]

type D = typeof data[number]

const x = (_d: D, i: number) => i
const y = [
  (d: D) => d.fcp,
  (d: D) => d.lcp,
  (d: D) => d.cls,
  (d: D) => d.inp,
]
const tickFormat = (i: number) => data[i]?.name ?? ''

const legend = [
  { label: 'FCP', color: metricColors[0] },
  { label: 'LCP', color: metricColors[1] },
  { label: 'CLS', color: metricColors[2] },
  { label: 'INP', color: metricColors[3] },
]
</script>

<template>
  <ClientOnly>
    <figure class="chart-container my-8 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-5 not-prose">
      <figcaption class="flex items-center justify-between mb-4">
        <span class="text-sm font-medium text-[var(--ui-text)]">
          % Page Loads in "Good" Threshold
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
          :color="metricColors"
          :rounded-corners="3"
          :bar-padding="0.1"
          :group-padding="0.2"
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
