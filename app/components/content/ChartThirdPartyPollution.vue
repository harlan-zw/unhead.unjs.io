<script setup lang="ts">
import { VisAxis, VisStackedBar, VisTooltip, VisXYContainer } from '@unovis/vue'

const colors = {
  firstParty: '#059669',
  thirdParty: '#ef4444',
}

const data = [
  { framework: 'Next.js', firstParty: 8, thirdParty: 18, total: 26 },
  { framework: 'Nuxt', firstParty: 9, thirdParty: 16, total: 25 },
  { framework: 'Angular', firstParty: 6, thirdParty: 22, total: 28 },
  { framework: 'Gatsby', firstParty: 7, thirdParty: 14, total: 21 },
  { framework: 'SvelteKit', firstParty: 7, thirdParty: 12, total: 19 },
  { framework: 'Remix', firstParty: 8, thirdParty: 10, total: 18 },
  { framework: 'Astro', firstParty: 6, thirdParty: 9, total: 15 },
]

type D = typeof data[number]

const x = (_d: D, i: number) => i
const y = [
  (d: D) => d.firstParty,
  (d: D) => d.thirdParty,
]
const color = [colors.firstParty, colors.thirdParty]
const tickFormat = (i: number) => data[i]?.framework ?? ''

const legend = [
  { label: 'First-party tags', color: colors.firstParty },
  { label: 'Third-party tags', color: colors.thirdParty },
]

function tooltipTemplate(d: D) {
  const ratio = (d.thirdParty / d.firstParty).toFixed(1)
  return `<div style="padding:8px 12px;font-size:13px;line-height:1.6;color:var(--ui-text)">
    <div style="font-weight:600;margin-bottom:4px">${d.framework}</div>
    <div style="color:${colors.firstParty}">First-party: ${d.firstParty} tags</div>
    <div style="color:${colors.thirdParty}">Third-party: ${d.thirdParty} tags</div>
    <div style="margin-top:4px;color:var(--ui-text-muted)">Ratio: <span style="font-weight:600">${ratio}:1</span> (3P:1P)</div>
  </div>`
}
</script>

<template>
  <ClientOnly>
    <figure class="chart-container my-8 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-5 not-prose">
      <figcaption class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <span class="text-sm font-medium text-[var(--ui-text)]">
          Average Head Tags: First-Party vs Third-Party
        </span>
        <span class="flex flex-wrap gap-4 text-xs text-[var(--ui-text-muted)]">
          <span v-for="item in legend" :key="item.label" class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
            {{ item.label }}
          </span>
        </span>
      </figcaption>
      <VisXYContainer :data="data" height="300" class="w-full">
        <VisStackedBar
          :x="x"
          :y="y"
          :color="color"
          :rounded-corners="4"
          :bar-padding="0.15"
        />
        <VisAxis type="x" :tick-format="tickFormat" :num-ticks="data.length" :grid-line="false" :domain-line="true" :tick-line="false" />
        <VisAxis type="y" :tick-format="(v: number) => `${v}`" :grid-line="true" :domain-line="false" :tick-line="false" />
        <VisTooltip :triggers="{ [VisStackedBar]: tooltipTemplate }" />
      </VisXYContainer>
      <p class="mt-4 text-[10px] text-[var(--ui-text-dimmed)] text-center leading-relaxed">
        Average number of tags in <code>&lt;head&gt;</code> per framework on commercial sites. Third-party tags counted after JS execution. Feb 2026.
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
