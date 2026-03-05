<script setup lang="ts">
import { VisAxis, VisGroupedBar, VisTooltip, VisXYContainer } from '@unovis/vue'

const colors = ['#3b82f6', '#64748b']

const data = [
  { name: 'Shopify', lcp: 1685, ttfb: 534, origins: '401K', goodLcp: 87.3 },
  { name: 'Wix', lcp: 1724, ttfb: 797, origins: '185K', goodLcp: 81.6 },
  { name: 'Squarespace', lcp: 1969, ttfb: 586, origins: '93K', goodLcp: 76.6 },
  { name: 'WordPress', lcp: 2663, ttfb: 1550, origins: '2.9M', goodLcp: 55.2 },
  { name: 'Next.js', lcp: 2790, ttfb: 956, origins: '260K', goodLcp: 50.9 },
  { name: 'Nuxt.js', lcp: 3051, ttfb: 989, origins: '88K', goodLcp: 44.2 },
]

type D = typeof data[number]

const x = (_d: D, i: number) => i
const y = [
  (d: D) => d.lcp,
  (d: D) => d.ttfb,
]
const tickFormat = (i: number) => data[i]?.name ?? ''

const legend = [
  { label: 'Avg p75 LCP', color: colors[0] },
  { label: 'Avg p75 TTFB', color: colors[1] },
]

function tooltipTemplate(d: D) {
  return `<div style="padding:6px 10px;font-size:13px;line-height:1.5">
    <div style="font-weight:600;margin-bottom:4px">${d.name} <span style="opacity:0.6">(${d.origins} origins)</span></div>
    <div>LCP: ${d.lcp}ms</div>
    <div>TTFB: ${d.ttfb}ms</div>
    <div>Good LCP: ${d.goodLcp}%</div>
    <div style="opacity:0.6;margin-top:2px">TTFB is ${Math.round((d.ttfb / d.lcp) * 100)}% of LCP</div>
  </div>`
}
</script>

<template>
  <ClientOnly>
    <div class="my-8 rounded-lg border border-[var(--ui-border-muted)] bg-[var(--ui-bg-elevated)] p-4 sm:p-6">
      <div class="flex items-baseline justify-between mb-4">
        <h4 class="text-sm font-semibold text-[var(--ui-text)] tracking-tight">
          CrUX: LCP vs TTFB by Platform
        </h4>
        <span class="text-xs text-[var(--ui-text-dimmed)]">Jan 2026, mobile, 10.7M origins</span>
      </div>
      <div class="flex flex-wrap gap-x-5 gap-y-1.5 mb-4 text-xs text-[var(--ui-text-muted)]">
        <span v-for="item in legend" :key="item.label" class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full inline-block" :style="{ backgroundColor: item.color }" />
          {{ item.label }}
        </span>
      </div>
      <VisXYContainer :data="data" :height="300" class="w-full">
        <VisGroupedBar
          :x="x"
          :y="y"
          :color="colors"
          :rounded-corners="3"
          :bar-padding="0.08"
          :group-padding="0.2"
        />
        <VisAxis type="x" :tick-format="tickFormat" :num-ticks="data.length" :grid-line="false" :domain-line="false" :tick-line="false" />
        <VisAxis type="y" :tick-format="(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}s` : `${v}ms`" :grid-line="false" :domain-line="false" />
        <VisTooltip :triggers="{ [VisGroupedBar]: tooltipTemplate }" />
      </VisXYContainer>
      <p class="text-xs text-[var(--ui-text-dimmed)] mt-3 leading-relaxed">
        Nuxt has the best head ordering but worst LCP. Shopify has no head optimization but best LCP. TTFB dominates.
      </p>
    </div>
  </ClientOnly>
</template>
