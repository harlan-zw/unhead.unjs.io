<script setup lang="ts">
import { VisAxis, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/vue'

const colors = {
  changed: '#ef4444',
  missing: '#f59e0b',
}

const data = [
  { framework: 'Angular', changed: 37.5, missing: 13.1 },
  { framework: 'SvelteKit', changed: 16.0, missing: 17.2 },
  { framework: 'Gatsby', changed: 13.9, missing: 15.6 },
  { framework: 'Nuxt', changed: 10.5, missing: 8.7 },
  { framework: 'Next.js', changed: 9.6, missing: 11.1 },
  { framework: 'Astro', changed: 3.4, missing: 2.6 },
  { framework: 'Remix', changed: 2.8, missing: 2.7 },
  { framework: 'Qwik', changed: 2.0, missing: 1.0 },
]

const x = (_d: typeof data[number], i: number) => i
const y = [
  (d: typeof data[number]) => d.changed,
  (d: typeof data[number]) => d.missing,
]
const color = [colors.changed, colors.missing]
const tickFormat = (i: number) => data[i]?.framework ?? ''

const legend = [
  { label: 'Title Changed', color: colors.changed },
  { label: 'Missing Title', color: colors.missing },
]

function tooltipTemplate(d: typeof data[number]) {
  return `<div style="padding:6px 10px;font-size:13px;line-height:1.5">
    <div style="font-weight:600;margin-bottom:4px">${d.framework}</div>
    <div style="color:var(--ui-text-error)">Changed: ${d.changed}%</div>
    <div style="color:var(--ui-text-warning)">Missing: ${d.missing}%</div>
  </div>`
}
</script>

<template>
  <ClientOnly>
    <figure class="chart-container my-8 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-5 not-prose">
      <figcaption class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <span class="text-sm font-medium text-[var(--ui-text)]">
          Framework Head Health (2026 Audit)
        </span>
        <span class="flex flex-wrap gap-4 text-xs text-[var(--ui-text-muted)]">
          <span v-for="item in legend" :key="item.label" class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
            {{ item.label }}
          </span>
        </span>
      </figcaption>
      <VisXYContainer :data="data" height="320" class="w-full">
        <VisStackedBar
          :x="x"
          :y="y"
          :color="color"
          :rounded-corners="4"
          :bar-padding="0.15"
        />
        <VisAxis type="x" :tick-format="tickFormat" :num-ticks="data.length" :grid-line="false" :domain-line="true" :tick-line="false" />
        <VisAxis type="y" :tick-format="(v: number) => `${v}%`" :grid-line="true" :domain-line="false" :tick-line="false" />
        <VisTooltip :triggers="{ [VisStackedBar]: tooltipTemplate }" />
      </VisXYContainer>
      <p class="mt-4 text-[10px] text-[var(--ui-text-dimmed)] text-center leading-relaxed">
        Data sourced from HTTP Archive (Feb 2026) and CrUX (Jan 2026). <br class="sm:hidden">
        "Title Changed" measures SSR vs Hydrated DOM mismatch.
      </p>
    </figure>
  </ClientOnly>
</template>

<style scoped>
.chart-container :deep(.vis-axis .tick text) {
  fill: var(--ui-text-muted);
  font-size: 11px;
}
.chart-container :deep(.vis-axis .domain) {
  stroke: var(--ui-border);
}
.chart-container :deep(.vis-axis .grid-line) {
  stroke: var(--ui-border-muted);
  stroke-dasharray: 2 4;
}
</style>
