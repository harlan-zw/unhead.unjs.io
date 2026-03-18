<script setup lang="ts">
// Waterfall timeline data — absolute start→end times (ms) for each resource
// Shows that optimal ordering gets critical sync scripts done sooner,
// even though deferred scripts take longer individually.

interface Resource {
  name: string
  type: 'sync' | 'css' | 'defer'
  start: number
  end: number
}

interface Scenario {
  label: string
  resources: Resource[]
  criticalEnd: number // when last sync/css resource finishes
}

const scenarios: Scenario[] = [
  {
    label: 'Optimal ordering',
    resources: [
      { name: 'Fonts CSS', type: 'css', start: 0, end: 658 },
      { name: 'vendor.js', type: 'sync', start: 30, end: 545 },
      { name: 'app.js', type: 'sync', start: 60, end: 603 },
      { name: 'interactions.js', type: 'defer', start: 550, end: 1608 },
      { name: 'lazy-comp.js', type: 'defer', start: 570, end: 1600 },
    ],
    criticalEnd: 658,
  },
  {
    label: 'Worst ordering',
    resources: [
      { name: 'interactions.js', type: 'defer', start: 0, end: 457 },
      { name: 'lazy-comp.js', type: 'defer', start: 20, end: 449 },
      { name: 'vendor.js', type: 'sync', start: 180, end: 1124 },
      { name: 'app.js', type: 'sync', start: 220, end: 1078 },
      { name: 'Fonts CSS', type: 'css', start: 260, end: 890 },
    ],
    criticalEnd: 1124,
  },
]

const maxTime = 1700
const pct = (ms: number) => `${(ms / maxTime) * 100}%`

const typeColors: Record<string, string> = {
  sync: '#dc2626',
  css: '#3b82f6',
  defer: '#a1a1aa',
}

const typeLabels: Record<string, string> = {
  sync: 'Parser-blocking',
  css: 'Stylesheet',
  defer: 'Deferred',
}

const ticks = [0, 400, 800, 1200, 1600]

const criticalDelta = scenarios[1].criticalEnd - scenarios[0].criticalEnd
</script>

<template>
  <div class="my-8 rounded-xl border border-default bg-elevated p-4 sm:p-6 not-prose">
    <div class="flex items-baseline justify-between mb-1">
      <h4 class="text-sm font-semibold text-default tracking-tight">
        Resource Loading Waterfall
      </h4>
      <span class="text-xs text-dimmed">heavy page, slow-3g</span>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap gap-x-5 gap-y-1.5 mb-5 text-xs text-muted">
      <span v-for="(label, type) in typeLabels" :key="type" class="flex items-center gap-1.5">
        <span
          class="w-2.5 h-2.5 rounded-sm inline-block"
          :style="{ backgroundColor: typeColors[type] }"
        />
        {{ label }}
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-0 inline-block border-t-2 border-dashed border-[var(--ui-text-warning)]" />
        First paint possible
      </span>
    </div>

    <!-- Scenarios -->
    <div class="space-y-6">
      <div
        v-for="scenario in scenarios"
        :key="scenario.label"
      >
        <div class="flex items-center gap-2 mb-2.5">
          <span class="text-xs font-medium text-muted uppercase tracking-wider">
            {{ scenario.label }}
          </span>
          <span
            v-if="scenario === scenarios[0]"
            class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          >
            FASTER
          </span>
        </div>

        <!-- Timeline -->
        <div class="relative">
          <!-- Tick grid -->
          <div class="absolute inset-0 pointer-events-none">
            <div
              v-for="tick in ticks"
              :key="tick"
              class="absolute top-0 bottom-0 border-l border-muted"
              :class="{ 'opacity-0': tick === 0 }"
              :style="{ left: pct(tick) }"
            />
          </div>

          <!-- Resource bars -->
          <div class="space-y-1.5 relative">
            <div
              v-for="resource in scenario.resources"
              :key="resource.name"
              class="flex items-center gap-0 h-7 group"
            >
              <!-- Resource name label (overlay on the left) -->
              <div
                class="absolute left-0 z-10 text-[11px] font-medium text-default pl-1.5 pointer-events-none flex items-center h-7 mix-blend-difference"
                :class="resource.start > 100 ? 'text-default' : ''"
              >
                <span class="truncate max-w-[100px] sm:max-w-none">{{ resource.name }}</span>
              </div>

              <!-- Bar track -->
              <div class="relative w-full h-full">
                <div
                  class="absolute h-full rounded-[3px] transition-all duration-300"
                  :style="{
                    left: pct(resource.start),
                    width: pct(resource.end - resource.start),
                    backgroundColor: typeColors[resource.type],
                    opacity: resource.type === 'defer' ? 0.45 : 0.85,
                  }"
                />
                <!-- Duration label on the bar -->
                <div
                  class="absolute h-full flex items-center text-[10px] font-mono font-medium tabular-nums pointer-events-none"
                  :style="{
                    left: `calc(${pct(resource.end)} + 6px)`,
                  }"
                  :class="resource.type === 'defer' ? 'text-dimmed' : 'text-muted'"
                >
                  {{ resource.end - resource.start }}ms
                </div>
              </div>
            </div>
          </div>

          <!-- Critical path marker -->
          <div
            class="absolute top-0 bottom-0 border-l-2 border-dashed z-20"
            :style="{ left: pct(scenario.criticalEnd), borderColor: '#eab308' }"
          >
            <div
              class="absolute -top-5 -translate-x-1/2 text-[10px] font-semibold tabular-nums whitespace-nowrap"
              :class="scenario === scenarios[0] ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--ui-text-error)]'"
            >
              {{ scenario.criticalEnd }}ms
            </div>
          </div>
        </div>

        <!-- Time axis -->
        <div class="relative h-4 mt-1">
          <div
            v-for="tick in ticks"
            :key="tick"
            class="absolute text-[10px] font-mono tabular-nums text-dimmed -translate-x-1/2"
            :style="{ left: pct(tick) }"
            :class="{ 'translate-x-0': tick === 0 }"
          >
            {{ tick === 0 ? '0' : `${tick / 1000}s` }}
          </div>
        </div>
      </div>
    </div>

    <!-- Impact callout -->
    <div class="mt-5 flex items-stretch gap-3">
      <div class="flex-1 rounded-lg bg-muted p-3 border border-muted text-center">
        <div class="text-lg font-bold text-[var(--ui-text-error)]">
          +{{ criticalDelta }}ms
        </div>
        <div class="text-[11px] text-dimmed mt-0.5">
          Delayed first paint
        </div>
      </div>
      <div class="flex-1 rounded-lg bg-muted p-3 border border-muted text-center">
        <div class="text-lg font-bold text-dimmed">
          -572ms
        </div>
        <div class="text-[11px] text-dimmed mt-0.5">
          Deferred scripts (wasted)
        </div>
      </div>
    </div>

    <p class="text-[13px] text-muted [&_strong]:text-default mt-4 leading-relaxed bg-muted p-3 rounded-md border border-muted">
      Wrong ordering lets deferred scripts "steal" bandwidth from critical resources. They finish faster, but
      <strong>parser-blocking scripts are delayed by ~466ms</strong>, pushing back the first paint.
    </p>
  </div>
</template>
