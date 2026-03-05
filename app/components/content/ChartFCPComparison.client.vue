<script setup lang="ts">
import { VisAnnotations, VisAxis, VisGroupedBar, VisTooltip, VisXYContainer } from '@unovis/vue'

const colors = ['#059669', '#d97706', '#7c3aed', '#dc2626']

const data = [
  { name: 'Min 4G', optimal: 460, commonBad: 456, random: 456, worst: 464 },
  { name: 'Med 4G', optimal: 468, commonBad: 468, random: 468, worst: 468 },
  { name: 'Heavy 4G', optimal: 496, commonBad: 488, random: 504, worst: 528 },
  { name: 'Min 3G', optimal: 984, commonBad: 992, random: 992, worst: 980 },
  { name: 'Med 3G', optimal: 1068, commonBad: 1040, random: 1068, worst: 1080 },
  { name: 'Heavy 3G', optimal: 1228, commonBad: 1228, random: 1228, worst: 1440 },
]

type D = typeof data[number]

const x = (_d: D, i: number) => i
const y = [
  (d: D) => d.optimal,
  (d: D) => d.commonBad,
  (d: D) => d.random,
  (d: D) => d.worst,
]
const tickFormat = (i: number) => data[i]?.name ?? ''

const legend = [
  { label: 'Optimal (Capo.js)', color: colors[0] },
  { label: 'Common-Bad', color: colors[1] },
  { label: 'Random', color: colors[2] },
  { label: 'Worst (reversed)', color: colors[3] },
]

const annotations = [
  {
    x: '88%',
    y: '4%',
    width: '120px',
    content: { text: '+212ms (17%)', fontSize: 13, fontWeight: 600, color: '#dc2626' },
  },
]

function tooltipTemplate(d: D) {
  const delta = d.worst - d.optimal
  const pct = d.optimal > 0 ? Math.round((delta / d.optimal) * 100) : 0
  const sign = delta >= 0 ? '+' : ''
  return `<div style="padding:6px 10px;font-size:13px;line-height:1.5">
    <div style="font-weight:600;margin-bottom:4px">${d.name}</div>
    <div style="color:${colors[0]}">Optimal: ${d.optimal}ms</div>
    <div style="color:${colors[3]}">Worst: ${d.worst}ms</div>
    <div style="color:${delta > 20 ? '#dc2626' : 'inherit'};margin-top:2px">Delta: ${sign}${delta}ms (${sign}${pct}%)</div>
  </div>`
}
</script>

<template>
  <div class="my-8 rounded-lg border border-[var(--ui-border-muted)] bg-[var(--ui-bg-elevated)] p-4 sm:p-6">
    <div class="flex items-baseline justify-between mb-4">
      <h4 class="text-sm font-semibold text-[var(--ui-text)] tracking-tight">
        FCP by Head Ordering
      </h4>
      <span class="text-xs text-[var(--ui-text-dimmed)]">median, 5 runs each</span>
    </div>
    <div class="flex flex-wrap gap-x-5 gap-y-1.5 mb-4 text-xs text-[var(--ui-text-muted)]">
      <span v-for="item in legend" :key="item.label" class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-[3px] inline-block" :style="{ backgroundColor: item.color }" />
        {{ item.label }}
      </span>
    </div>
    <VisXYContainer :data="data" :height="340" class="w-full">
      <VisGroupedBar
        :x="x"
        :y="y"
        :color="colors"
        :rounded-corners="3"
        :bar-padding="0.08"
        :group-padding="0.2"
      />
      <VisAnnotations :items="annotations" />
      <VisAxis type="x" :tick-format="tickFormat" :grid-line="false" :domain-line="false" :tick-line="false" />
      <VisAxis type="y" :tick-format="(v: number) => `${v}ms`" :grid-line="false" :domain-line="false" />
      <VisTooltip :triggers="{ [VisGroupedBar]: tooltipTemplate }" />
    </VisXYContainer>
    <p class="text-xs text-[var(--ui-text-dimmed)] mt-3 leading-relaxed">
      Heavy page on slow-3g shows the only meaningful delta. Minimal and medium pages are within noise.
    </p>
  </div>
</template>
