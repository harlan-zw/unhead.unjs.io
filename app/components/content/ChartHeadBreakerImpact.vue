<script setup lang="ts">
import { VisDonut, VisTooltip, VisXYContainer } from '@unovis/vue'

const data = [
  { name: 'Invalid Heads (Breakers)', value: 22, color: '#dc2626' },
  { name: 'Valid Heads', value: 78, color: '#059669' },
]

const value = (d: typeof data[number]) => d.value
const color = (d: typeof data[number]) => d.color

function tooltipTemplate(d: typeof data[number]) {
  return `<div style="padding:4px 8px;font-size:12px">
    <span style="font-weight:600">${d.name}</span>: ${d.value}%
  </div>`
}
</script>

<template>
  <ClientOnly>
    <div class="my-8 flex flex-col items-center justify-center rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-5 not-prose sm:flex-row sm:gap-8">
      <div class="relative h-40 w-40 shrink-0">
        <VisXYContainer :data="data" :height="160" :width="160">
          <VisDonut
            :value="value"
            :arc-width="25"
            :show-labels="false"
            :color="color"
          />
          <VisTooltip :triggers="{ [VisDonut]: tooltipTemplate }" />
        </VisXYContainer>
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span class="text-2xl font-bold text-[var(--ui-text-error)]">22%</span>
          <span class="text-[10px] uppercase tracking-wider text-[var(--ui-text-dimmed)]">Broken</span>
        </div>
      </div>
      <div class="mt-6 text-center sm:mt-0 sm:text-left">
        <h4 class="text-lg font-bold text-[var(--ui-text)]">
          The Head-Breaker Prevalence
        </h4>
        <p class="mt-2 max-w-xs text-sm text-[var(--ui-text-muted)] leading-relaxed">
          Nearly <strong>1 in 4 mobile pages</strong> contains invalid markup that prematurely closes the <code class="text-xs">&lt;head&gt;</code>. This causes SEO meta tags and critical styles to be moved to the body, where they are discovered too late.
        </p>
        <p class="mt-3 text-[11px] text-[var(--ui-text-dimmed)] leading-relaxed">
          Based on HTTP Archive mobile dataset, Feb 2026.
        </p>
      </div>
    </div>
  </ClientOnly>
</template>
