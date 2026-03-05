<script setup lang="ts">
import { VisAxis, VisLine, VisScatter, VisTooltip, VisXYContainer } from '@unovis/vue'

const colors = ['#059669', '#3b82f6', '#94a3b8']

const months = ['Jun \'25', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan \'26']

const nuxt = [3059, 3042, 3028, 3091, 3049, 3070, 3086, 3051]
const next = [2806, 2811, 2821, 2848, 2784, 2801, 2851, 2790]
const wordpress = [2696, 2695, 2681, 2707, 2669, 2671, 2689, 2662]

const data = months.map((_, i) => ({
  i,
  nuxt: nuxt[i],
  next: next[i],
  wordpress: wordpress[i],
}))

type D = typeof data[number]

const x = (d: D) => d.i
const yFns = [
  (d: D) => d.nuxt,
  (d: D) => d.next,
  (d: D) => d.wordpress,
]

const tickFormat = (i: number) => months[i] ?? ''

const legend = [
  { label: 'Nuxt.js', color: colors[0] },
  { label: 'Next.js', color: colors[1] },
  { label: 'WordPress', color: colors[2] },
]

function tooltipTemplate(d: D) {
  return `<div style="padding:6px 10px;font-size:13px;line-height:1.5">
    <div style="font-weight:600;margin-bottom:4px">${months[d.i]}</div>
    <div style="color:${colors[0]}">Nuxt: ${d.nuxt}ms</div>
    <div style="color:${colors[1]}">Next: ${d.next}ms</div>
    <div style="color:${colors[2]}">WordPress: ${d.wordpress}ms</div>
  </div>`
}
</script>

<template>
  <ClientOnly>
  <div class="my-8 rounded-lg border border-[var(--ui-border-muted)] bg-[var(--ui-bg-elevated)] p-4 sm:p-6">
    <div class="flex items-baseline justify-between mb-4">
      <h4 class="text-sm font-semibold text-[var(--ui-text)] tracking-tight">
        LCP Trend: 8 Months
      </h4>
      <span class="text-xs text-[var(--ui-text-dimmed)]">CrUX mobile, p75 avg</span>
    </div>
    <div class="flex flex-wrap gap-x-5 gap-y-1.5 mb-4 text-xs text-[var(--ui-text-muted)]">
      <span v-for="item in legend" :key="item.label" class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-full inline-block" :style="{ backgroundColor: item.color }" />
        {{ item.label }}
      </span>
    </div>
    <VisXYContainer :data="data" :height="280" class="w-full">
      <template v-for="(fn, idx) in yFns" :key="`line-${idx}`">
        <VisLine
          :x="x"
          :y="fn"
          :color="colors[idx]"
          curve-type="linear"
          :line-width="2"
        />
        <VisScatter
          :x="x"
          :y="fn"
          :color="colors[idx]"
          :size="4"
        />
      </template>
      <VisAxis type="x" :tick-format="tickFormat" :grid-line="false" :domain-line="false" :tick-line="false" :num-ticks="8" />
      <VisAxis type="y" :tick-format="(v: number) => `${(v / 1000).toFixed(1)}s`" :grid-line="false" :domain-line="false" />
      <VisTooltip :triggers="{ [VisScatter]: tooltipTemplate }" />
    </VisXYContainer>
    <p class="text-xs text-[var(--ui-text-dimmed)] mt-3 leading-relaxed">
      All three frameworks essentially flat. No framework-level optimization has moved the needle at population scale.
    </p>
  </div>
  </ClientOnly>
</template>
