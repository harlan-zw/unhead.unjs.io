<script setup lang="ts">
import { VisAxis, VisGroupedBar, VisTooltip, VisXYContainer } from '@unovis/vue'

const colors = ['#059669', '#7c3aed']

const data = [
  { name: 'Shopify', headOptimization: 'None', lcp: 1685, ttfb: 534, goodLcp: 87.3 },
  { name: 'Wix', headOptimization: 'Partial', lcp: 1724, ttfb: 797, goodLcp: 81.6 },
  { name: 'Squarespace', headOptimization: 'Partial', lcp: 1969, ttfb: 586, goodLcp: 76.6 },
  { name: 'WordPress', headOptimization: 'Manual/Plugins', lcp: 2663, ttfb: 1550, goodLcp: 55.2 },
  { name: 'Next.js', headOptimization: 'Partial (Auto-hoist)', lcp: 2790, ttfb: 956, goodLcp: 50.9 },
  { name: 'Nuxt', headOptimization: 'Full (Auto Capo.js)', lcp: 3051, ttfb: 989, goodLcp: 44.2 },
]

type D = typeof data[number]

const x = (_d: D, i: number) => i
const y = [
  (d: D) => d.lcp,
  (d: D) => d.ttfb,
]
const tickFormat = (i: number) => data[i]?.name ?? ''

const legend = [
  { label: 'Avg LCP (lower is better)', color: colors[0] },
  { label: 'Avg TTFB (lower is better)', color: colors[1] },
]

function tooltipTemplate(d: D) {
  return `<div style="padding:6px 10px;font-size:13px;line-height:1.5">
    <div style="font-weight:600;margin-bottom:4px">${d.name}</div>
    <div style="color:${colors[0]}">LCP: ${d.lcp}ms</div>
    <div style="color:${colors[1]}">TTFB: ${d.ttfb}ms</div>
    <div style="margin-top:4px;opacity:0.8">Head Optimization: <span style="font-weight:600">${d.headOptimization}</span></div>
    <div style="opacity:0.8">Good LCP Rate: <span style="font-weight:600;color:${d.goodLcp > 75 ? '#059669' : '#dc2626'}">${d.goodLcp}%</span></div>
  </div>`
}
</script>

<template>
  <ClientOnly>
    <div class="my-8 rounded-xl border border-default bg-elevated p-5 not-prose">
      <div class="flex items-baseline justify-between mb-4">
        <h4 class="text-sm font-semibold text-default tracking-tight">
          The Nuxt Paradox: LCP vs Head Optimization
        </h4>
        <span class="text-xs text-dimmed">Jan 2026, mobile, CrUX</span>
      </div>
      <div class="flex flex-wrap gap-x-5 gap-y-1.5 mb-6 text-xs text-muted">
        <span v-for="item in legend" :key="item.label" class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full inline-block" :style="{ backgroundColor: item.color }" />
          {{ item.label }}
        </span>
      </div>
      <VisXYContainer :data="data" :height="320" :margin="{ left: 20 }" class="w-full">
        <VisGroupedBar
          :x="x"
          :y="y"
          :color="colors"
          :rounded-corners="3"
          :bar-padding="0.1"
          :group-padding="0.25"
        />
        <VisAxis type="x" :tick-format="tickFormat" :num-ticks="data.length" :grid-line="false" :domain-line="false" :tick-line="false" />
        <VisAxis type="y" :tick-format="(v: number) => `${v}ms`" :grid-line="false" :domain-line="false" />
        <VisTooltip :triggers="{ [VisGroupedBar]: tooltipTemplate }" />
      </VisXYContainer>
      <p class="text-[13px] text-muted [&_strong]:text-default mt-5 leading-relaxed bg-muted p-3 rounded-md border border-muted">
        <strong>Wait, why is Nuxt last?</strong> Despite automatic head ordering, Nuxt's population-level LCP is highest. This is driven by <strong>TTFB</strong> (989ms) and <strong>hydration cost</strong>. Shopify wins not because of heads, but because of its global edge network (534ms TTFB) and server-rendered architecture.
      </p>
    </div>
  </ClientOnly>
</template>
