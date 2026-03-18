<script setup lang="ts">
import { VisAxis, VisGroupedBar, VisTooltip, VisXYContainer } from '@unovis/vue'

const colors = ['#ef4444', '#f59e0b', '#8b5cf6']

const data = [
  { framework: 'WordPress', dupTitle: 8.2, dupDesc: 9.1, dupCanonical: 5.4 },
  { framework: 'Angular', dupTitle: 5.1, dupDesc: 4.3, dupCanonical: 2.1 },
  { framework: 'SvelteKit', dupTitle: 4.8, dupDesc: 3.9, dupCanonical: 1.8 },
  { framework: 'Gatsby', dupTitle: 3.6, dupDesc: 4.1, dupCanonical: 2.3 },
  { framework: 'Next.js', dupTitle: 2.1, dupDesc: 1.8, dupCanonical: 1.2 },
  { framework: 'Nuxt', dupTitle: 1.4, dupDesc: 1.1, dupCanonical: 0.8 },
  { framework: 'Remix', dupTitle: 1.2, dupDesc: 0.9, dupCanonical: 0.6 },
]

type D = typeof data[number]

const x = (_d: D, i: number) => i
const y = [
  (d: D) => d.dupTitle,
  (d: D) => d.dupDesc,
  (d: D) => d.dupCanonical,
]
const tickFormat = (i: number) => data[i]?.framework ?? ''

const legend = [
  { label: 'Duplicate <title>', color: colors[0] },
  { label: 'Duplicate description', color: colors[1] },
  { label: 'Conflicting canonical', color: colors[2] },
]

function tooltipTemplate(d: D) {
  return `<div style="padding:8px 12px;font-size:13px;line-height:1.6;color:var(--ui-text)">
    <div style="font-weight:600;margin-bottom:4px">${d.framework}</div>
    <div style="color:${colors[0]}">Duplicate title: ${d.dupTitle}%</div>
    <div style="color:${colors[1]}">Duplicate description: ${d.dupDesc}%</div>
    <div style="color:${colors[2]}">Conflicting canonical: ${d.dupCanonical}%</div>
  </div>`
}
</script>

<template>
  <ClientOnly>
    <figure class="chart-container my-8 rounded-xl border border-default bg-elevated p-5 not-prose">
      <figcaption class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <span class="text-sm font-medium text-default">
          Duplicate & Conflicting Tags by Framework
        </span>
        <span class="flex flex-wrap gap-4 text-xs text-muted">
          <span v-for="item in legend" :key="item.label" class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
            {{ item.label }}
          </span>
        </span>
      </figcaption>
      <VisXYContainer :data="data" height="300" class="w-full">
        <VisGroupedBar
          :x="x"
          :y="y"
          :color="colors"
          :rounded-corners="3"
          :bar-padding="0.1"
          :group-padding="0.25"
        />
        <VisAxis type="x" :tick-format="tickFormat" :num-ticks="data.length" :grid-line="false" :domain-line="true" :tick-line="false" />
        <VisAxis type="y" :tick-format="(v: number) => `${v}%`" :grid-line="true" :domain-line="false" :tick-line="false" />
        <VisTooltip :triggers="{ [VisGroupedBar]: tooltipTemplate }" />
      </VisXYContainer>
      <p class="mt-4 text-[10px] text-dimmed text-center leading-relaxed">
        Percentage of origins with duplicate or conflicting tags in raw server HTML. Feb 2026.
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
