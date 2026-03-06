<script setup lang="ts">
import { VisAxis, VisGroupedBar, VisTooltip, VisXYContainer } from '@unovis/vue'

const colors = ['#3b82f6', '#f43f5e', '#8b5cf6']

const data = [
  { framework: 'Astro', ogTitle: 72, ogImage: 58, twitterCard: 45 },
  { framework: 'Next.js', ogTitle: 68, ogImage: 52, twitterCard: 41 },
  { framework: 'Nuxt', ogTitle: 65, ogImage: 50, twitterCard: 43 },
  { framework: 'Remix', ogTitle: 63, ogImage: 48, twitterCard: 38 },
  { framework: 'Gatsby', ogTitle: 60, ogImage: 44, twitterCard: 35 },
  { framework: 'SvelteKit', ogTitle: 55, ogImage: 40, twitterCard: 30 },
  { framework: 'Angular', ogTitle: 35, ogImage: 22, twitterCard: 15 },
]

type D = typeof data[number]

const x = (_d: D, i: number) => i
const y = [
  (d: D) => d.ogTitle,
  (d: D) => d.ogImage,
  (d: D) => d.twitterCard,
]
const tickFormat = (i: number) => data[i]?.framework ?? ''

const legend = [
  { label: 'og:title', color: colors[0] },
  { label: 'og:image', color: colors[1] },
  { label: 'twitter:card', color: colors[2] },
]

function tooltipTemplate(d: D) {
  return `<div style="padding:8px 12px;font-size:13px;line-height:1.6;color:var(--ui-text)">
    <div style="font-weight:600;margin-bottom:4px">${d.framework}</div>
    <div style="color:${colors[0]}">og:title: ${d.ogTitle}%</div>
    <div style="color:${colors[1]}">og:image: ${d.ogImage}%</div>
    <div style="color:${colors[2]}">twitter:card: ${d.twitterCard}%</div>
  </div>`
}
</script>

<template>
  <ClientOnly>
    <figure class="chart-container my-8 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-5 not-prose">
      <figcaption class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <span class="text-sm font-medium text-[var(--ui-text)]">
          Open Graph Tag Presence by Framework
        </span>
        <span class="flex flex-wrap gap-4 text-xs text-[var(--ui-text-muted)]">
          <span v-for="item in legend" :key="item.label" class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
            {{ item.label }}
          </span>
        </span>
      </figcaption>
      <VisXYContainer :data="data" height="320" class="w-full">
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
      <p class="mt-4 text-[10px] text-[var(--ui-text-dimmed)] text-center leading-relaxed">
        Percentage of origins with each OG tag present in raw server HTML. HTTP Archive Feb 2026.
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
