<script setup lang="ts">
import { VisAxis, VisGroupedBar, VisTooltip, VisXYContainer } from '@unovis/vue'

const colors = ['#059669', '#3b82f6'] // FCP, DCL

const data = [
  { name: 'Optimal Ordering', fcp: 496, dcl: 533.1 },
  { name: 'Worst Ordering', fcp: 528, dcl: 522.5 },
]

type D = typeof data[number]

const x = (_d: D, i: number) => i
const y = [
  (d: D) => d.fcp,
  (d: D) => d.dcl,
]
const tickFormat = (i: number) => data[i]?.name ?? ''

const legend = [
  { label: 'FCP (lower is better)', color: colors[0] },
  { label: 'DCL (lower is better)', color: colors[1] },
]

const deltas = {
  fcp: { value: '+32ms', direction: 'worse', desc: 'slower paint' },
  dcl: { value: '-10.6ms', direction: 'better', desc: 'faster load event' },
}

function tooltipTemplate(d: D) {
  return `<div style="padding:6px 10px;font-size:13px;line-height:1.5">
    <div style="font-weight:600;margin-bottom:4px">${d.name}</div>
    <div style="color:${colors[0]}">FCP: ${d.fcp}ms</div>
    <div style="color:${colors[1]}">DCL: ${d.dcl}ms</div>
    <div style="margin-top:2px;font-size:11px;opacity:0.8">
      ${d.name === 'Worst Ordering' ? 'DCL is 10.6ms faster, but FCP is 32ms slower!' : ''}
    </div>
  </div>`
}
</script>

<template>
  <ClientOnly>
    <div class="my-8 rounded-xl border border-default bg-elevated p-5 not-prose">
      <div class="flex items-baseline justify-between mb-4">
        <h4 class="text-sm font-semibold text-default tracking-tight">
          The DCL Paradox: Painting vs Loading
        </h4>
        <span class="text-xs text-dimmed">heavy page, fast-4g</span>
      </div>
      <div class="flex flex-wrap gap-x-5 gap-y-1.5 mb-5 text-xs text-muted">
        <span v-for="item in legend" :key="item.label" class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full inline-block" :style="{ backgroundColor: item.color }" />
          {{ item.label }}
        </span>
      </div>
      <VisXYContainer :data="data" :height="220" class="w-full">
        <VisGroupedBar
          :x="x"
          :y="y"
          :color="colors"
          :rounded-corners="3"
          :bar-padding="0.1"
          :group-padding="0.3"
        />
        <VisAxis type="x" :tick-format="tickFormat" :num-ticks="data.length" :grid-line="false" :domain-line="false" :tick-line="false" />
        <VisAxis type="y" :tick-format="(v: number) => `${v}ms`" :grid-line="false" :domain-line="false" />
        <VisTooltip :triggers="{ [VisGroupedBar as any]: tooltipTemplate }" />
      </VisXYContainer>
      <!-- Delta callouts to make the paradox visible without hovering -->
      <div class="mt-4 grid grid-cols-2 gap-3">
        <div class="rounded-lg bg-muted p-3 border border-muted text-center">
          <div class="text-lg font-bold text-[var(--ui-text-error)]">
            {{ deltas.fcp.value }}
          </div>
          <div class="text-[11px] text-dimmed mt-0.5">
            FCP {{ deltas.fcp.desc }}
          </div>
        </div>
        <div class="rounded-lg bg-muted p-3 border border-muted text-center">
          <div class="text-lg font-bold text-[var(--ui-text-success)]">
            {{ deltas.dcl.value }}
          </div>
          <div class="text-[11px] text-dimmed mt-0.5">
            DCL {{ deltas.dcl.desc }}
          </div>
        </div>
      </div>
      <p class="text-[13px] text-muted [&_strong]:text-default mt-4 leading-relaxed bg-muted p-3 rounded-md border border-muted">
        In "Worst" ordering, <strong>DCL is actually faster</strong> because deferred scripts are discovered and downloaded earlier. However, this bandwidth "theft" delays the First Contentful Paint. It's a faster load event, but a slower user experience.
      </p>
    </div>
  </ClientOnly>
</template>
