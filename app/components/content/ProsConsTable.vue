<script setup lang="ts">
const items = [
  {
    scenario: 'Heavy Head (30+ tags)',
    desc: 'GTM, multiple CSS/JS, many social tags',
    impact: 'High (+200ms FCP on 3G)',
    priority: 'Critical',
  },
  {
    scenario: 'Slow/Unstable Networks',
    desc: '3G, degraded mobile, or rural users',
    impact: 'Significant (Resource contention)',
    priority: 'High',
  },
  {
    scenario: 'Sync Parser-Blocking Scripts',
    desc: 'Legacy analytics or necessary polyfills',
    impact: 'High (Blocks rendering completely)',
    priority: 'Critical',
  },
  {
    scenario: 'Simple Page (5-10 tags)',
    desc: 'Few styles, no heavy analytics',
    impact: 'Negligible (Preload scanner wins)',
    priority: 'Optional',
  },
  {
    scenario: 'Fast 4G / 5G / Broadband',
    desc: 'Modern devices and fast pipes',
    impact: 'Low (<10ms difference)',
    priority: 'Nice-to-have',
  },
]

function getBadgeClass(priority: string) {
  switch (priority) {
    case 'Critical': return 'bg-[var(--ui-text-error)]/10 text-[var(--ui-text-error)]'
    case 'High': return 'bg-[var(--ui-text-warning)]/10 text-[var(--ui-text-warning)]'
    case 'Optional': return 'bg-[var(--ui-bg-muted)] text-[var(--ui-text-dimmed)]'
    case 'Nice-to-have': return 'bg-[var(--ui-text-info)]/10 text-[var(--ui-text-info)]'
    default: return 'bg-[var(--ui-bg-muted)] text-[var(--ui-text-dimmed)]'
  }
}
</script>

<template>
  <div class="my-8 not-prose">
    <!-- Desktop table -->
    <div class="hidden sm:block overflow-hidden rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)]">
      <table class="w-full text-left text-sm">
        <thead class="bg-[var(--ui-bg-muted)] text-[var(--ui-text)]">
          <tr>
            <th class="px-6 py-3 font-semibold">
              Scenario
            </th>
            <th class="px-6 py-3 font-semibold">
              Impact of Head Ordering
            </th>
            <th class="px-6 py-3 font-semibold text-right">
              Verdict
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[var(--ui-border-muted)]">
          <tr v-for="item in items" :key="item.scenario" class="transition-colors hover:bg-[var(--ui-bg-muted)]/50">
            <td class="px-6 py-3 font-medium">
              {{ item.scenario }}
              <div class="text-xs font-normal text-[var(--ui-text-dimmed)] mt-0.5">
                {{ item.desc }}
              </div>
            </td>
            <td class="px-6 py-3 text-[var(--ui-text-muted)]">
              {{ item.impact }}
            </td>
            <td class="px-6 py-3 text-right">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                :class="getBadgeClass(item.priority)"
              >
                {{ item.priority }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile cards -->
    <div class="sm:hidden space-y-3">
      <div
        v-for="item in items"
        :key="item.scenario"
        class="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-4"
      >
        <div class="flex items-start justify-between gap-3 mb-2">
          <div class="text-sm font-medium text-[var(--ui-text)]">
            {{ item.scenario }}
          </div>
          <span
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0"
            :class="getBadgeClass(item.priority)"
          >
            {{ item.priority }}
          </span>
        </div>
        <div class="text-xs text-[var(--ui-text-dimmed)] mb-2">
          {{ item.desc }}
        </div>
        <div class="text-xs text-[var(--ui-text-muted)]">
          {{ item.impact }}
        </div>
      </div>
    </div>
  </div>
</template>
