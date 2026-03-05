<script setup lang="ts">
import { VisAxis, VisGroupedBar, VisTooltip, VisXYContainer, VisXYLabels } from '@unovis/vue'

const colors = ['#059669', '#dc2626']

const data = [
  { name: 'vendor.js', type: 'sync', optimal: 515, worst: 944 },
  { name: 'app.js', type: 'sync', optimal: 543, worst: 858 },
  { name: 'Fonts CSS', type: 'css', optimal: 658, worst: 630 },
  { name: 'interactions.js', type: 'defer', optimal: 1058, worst: 457 },
  { name: 'lazy-comp.js', type: 'defer', optimal: 1030, worst: 429 },
]

type D = typeof data[number]

const x = (_d: D, i: number) => i
const y = [
  (d: D) => d.optimal,
  (d: D) => d.worst,
]
const tickFormat = (i: number) => data[i]?.name ?? ''

const legend = [
  { label: 'Optimal ordering', color: colors[0] },
  { label: 'Worst ordering', color: colors[1] },
]

const labels = data.map((d, i) => {
  const delta = d.worst - d.optimal
  const pct = Math.round((delta / d.optimal) * 100)
  const sign = pct >= 0 ? '+' : ''
  return {
    x: i,
    y: Math.max(d.optimal, d.worst),
    label: `${sign}${pct}%`,
  }
})

function tooltipTemplate(d: D) {
  const delta = d.worst - d.optimal
  const pct = Math.round((delta / d.optimal) * 100)
  const sign = delta >= 0 ? '+' : ''
  return `<div style="padding:6px 10px;font-size:13px;line-height:1.5">
    <div style="font-weight:600;margin-bottom:4px">${d.name} <span style="opacity:0.6">(${d.type})</span></div>
    <div style="color:${colors[0]}">Optimal: ${d.optimal}ms</div>
    <div style="color:${colors[1]}">Worst: ${d.worst}ms</div>
    <div style="margin-top:2px">${sign}${delta}ms (${sign}${pct}%)</div>
  </div>`
}
</script>

<template>
  <div class="my-8 rounded-lg border border-[var(--ui-border-muted)] bg-[var(--ui-bg-elevated)] p-4 sm:p-6">
    <div class="flex items-baseline justify-between mb-4">
      <h4 class="text-sm font-semibold text-[var(--ui-text)] tracking-tight">
        Resource Download Duration
      </h4>
      <span class="text-xs text-[var(--ui-text-dimmed)]">heavy page, slow-3g</span>
    </div>
    <div class="flex flex-wrap gap-x-5 gap-y-1.5 mb-4 text-xs text-[var(--ui-text-muted)]">
      <span v-for="item in legend" :key="item.label" class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-[3px] inline-block" :style="{ backgroundColor: item.color }" />
        {{ item.label }}
      </span>
    </div>
    <VisXYContainer :data="data" :height="320" class="w-full">
      <VisGroupedBar
        :x="x"
        :y="y"
        :color="colors"
        :rounded-corners="3"
        :bar-padding="0.08"
        :group-padding="0.2"
      />
      <VisXYLabels
        :data="labels"
        :x="(d: typeof labels[number]) => d.x"
        :y="(d: typeof labels[number]) => d.y"
        :label="(d: typeof labels[number]) => d.label"
        background-color="transparent"
        :color="(d: typeof labels[number]) => d.label.startsWith('+') ? '#dc2626' : '#059669'"
        font-size="11"
        font-weight="600"
      />
      <VisAxis type="x" :tick-format="tickFormat" :grid-line="false" :domain-line="false" :tick-line="false" />
      <VisAxis type="y" :tick-format="(v: number) => `${v}ms`" :grid-line="false" :domain-line="false" />
      <VisTooltip :triggers="{ [VisGroupedBar]: tooltipTemplate }" />
    </VisXYContainer>
    <p class="text-xs text-[var(--ui-text-dimmed)] mt-3 leading-relaxed">
      Sync scripts (parser-blocking) take dramatically longer in worst ordering. Deferred scripts get faster — but that's wasted priority.
    </p>
  </div>
</template>
