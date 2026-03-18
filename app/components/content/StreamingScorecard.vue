<script setup lang="ts">
interface Framework {
  name: string
  icon: string
  streams: 'Yes' | 'No' | 'Opt-in'
  headSafe: 'Yes' | 'With discipline' | 'With config'
  how: string
}

const frameworks: Framework[] = [
  {
    name: 'Next.js 16',
    icon: 'i-simple-icons-nextdotjs',
    streams: 'Yes',
    headSafe: 'With config',
    how: 'Streams for users, blocks for bots via UA detection',
  },
  {
    name: 'Nuxt 4',
    icon: 'i-simple-icons-nuxtdotjs',
    streams: 'No',
    headSafe: 'Yes',
    how: 'Entire response buffered, head always complete',
  },
  {
    name: 'Remix',
    icon: 'i-simple-icons-remix',
    streams: 'Yes',
    headSafe: 'Yes',
    how: 'Sync meta() blocks head; body streams deferred data',
  },
  {
    name: 'Astro',
    icon: 'i-simple-icons-astro',
    streams: 'Yes',
    headSafe: 'Yes',
    how: 'Frontmatter blocks head; body can stream',
  },
  {
    name: 'Qwik',
    icon: 'i-simple-icons-qwik',
    streams: 'No',
    headSafe: 'Yes',
    how: 'Loader resolves before render; resumable body',
  },
  {
    name: 'SvelteKit',
    icon: 'i-simple-icons-svelte',
    streams: 'Yes',
    headSafe: 'With discipline',
    how: 'Head flushed first; streamed data in svelte:head is lost',
  },
  {
    name: 'Solid Start',
    icon: 'i-simple-icons-solid',
    streams: 'Opt-in',
    headSafe: 'Yes',
    how: 'Blocks by default; head locked once stream starts',
  },
  {
    name: 'Angular',
    icon: 'i-simple-icons-angular',
    streams: 'No',
    headSafe: 'With discipline',
    how: 'Async Title calls can miss SSR serialization',
  },
]

const headSafeStyle = {
  'Yes': { text: 'text-[var(--ui-text-success)]', bg: 'bg-emerald-500/10', icon: 'i-ph-check-circle-fill' },
  'With config': { text: 'text-[var(--ui-text-warning)]', bg: 'bg-amber-500/10', icon: 'i-ph-gear-fill' },
  'With discipline': { text: 'text-[var(--ui-text-warning)]', bg: 'bg-amber-500/10', icon: 'i-ph-warning-circle-fill' },
} as const

const streamsStyle = {
  'Yes': { text: 'text-[var(--ui-text-success)]', icon: 'i-ph-broadcast-fill' },
  'No': { text: 'text-dimmed', icon: 'i-ph-prohibit' },
  'Opt-in': { text: 'text-muted', icon: 'i-ph-toggle-right-fill' },
} as const
</script>

<template>
  <div class="scorecard my-8 not-prose">
    <!-- Desktop -->
    <div class="hidden md:block overflow-hidden rounded-xl border border-default bg-elevated">
      <table class="w-full">
        <thead>
          <tr class="border-b border-default">
            <th class="sc-th text-left pl-5 w-[160px]">
              Framework
            </th>
            <th class="sc-th text-center w-[90px]">
              Streams?
            </th>
            <th class="sc-th text-center w-[180px]">
              Complete Head?
            </th>
            <th class="sc-th text-left">
              How It Works
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(fw, i) in frameworks"
            :key="fw.name"
            class="sc-row group"
            :style="{ animationDelay: `${i * 50}ms` }"
          >
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-md bg-muted border border-muted flex items-center justify-center transition-colors group-hover:border-accented">
                  <UIcon :name="fw.icon" class="size-3.5 text-dimmed group-hover:text-muted transition-colors" />
                </div>
                <span class="text-[13px] font-semibold text-default">{{ fw.name }}</span>
              </div>
            </td>
            <td class="px-3 py-3.5 text-center">
              <span class="inline-flex items-center gap-1 text-xs font-semibold" :class="streamsStyle[fw.streams].text">
                <UIcon :name="streamsStyle[fw.streams].icon" class="size-3" />
                {{ fw.streams }}
              </span>
            </td>
            <td class="px-3 py-3.5 text-center">
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-tight"
                :class="[headSafeStyle[fw.headSafe].text, headSafeStyle[fw.headSafe].bg]"
              >
                <UIcon :name="headSafeStyle[fw.headSafe].icon" class="size-3" />
                {{ fw.headSafe }}
              </span>
            </td>
            <td class="px-3 py-3.5">
              <span class="text-[12px] text-muted leading-snug">{{ fw.how }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile -->
    <div class="md:hidden space-y-2">
      <div
        v-for="(fw, i) in frameworks"
        :key="fw.name"
        class="sc-row rounded-xl border border-default bg-elevated p-4"
        :style="{ animationDelay: `${i * 50}ms` }"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-md bg-muted border border-muted flex items-center justify-center">
              <UIcon :name="fw.icon" class="size-3.5 text-dimmed" />
            </div>
            <span class="text-sm font-semibold text-default">{{ fw.name }}</span>
          </div>
          <span
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
            :class="[headSafeStyle[fw.headSafe].text, headSafeStyle[fw.headSafe].bg]"
          >
            <UIcon :name="headSafeStyle[fw.headSafe].icon" class="size-2.5" />
            {{ fw.headSafe }}
          </span>
        </div>
        <div class="flex items-center gap-3 mb-2.5 text-[11px]">
          <span class="inline-flex items-center gap-1 text-dimmed">
            Streams:
            <span :class="streamsStyle[fw.streams].text" class="font-semibold inline-flex items-center gap-0.5">
              <UIcon :name="streamsStyle[fw.streams].icon" class="size-2.5" />
              {{ fw.streams }}
            </span>
          </span>
        </div>
        <p class="text-[11px] text-dimmed leading-relaxed">
          {{ fw.how }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sc-th {
  padding: 12px 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ui-text-dimmed);
  white-space: nowrap;
  background: color-mix(in srgb, var(--ui-bg-muted) 50%, transparent);
}

.sc-row {
  animation: sc-enter 0.35s ease both;
  transition: background 0.15s ease;
}

tbody .sc-row {
  border-bottom: 1px solid color-mix(in srgb, var(--ui-border-muted) 60%, transparent);
}

tbody .sc-row:last-child {
  border-bottom: none;
}

.sc-row:hover {
  background: color-mix(in srgb, var(--ui-bg-muted) 50%, transparent);
}

@keyframes sc-enter {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
