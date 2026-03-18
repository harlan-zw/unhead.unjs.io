<script setup lang="ts">
const categories = [
  {
    label: 'Articles',
    description: 'Deep dives & guides',
    color: 'cyan' as const,
    items: [
      { label: 'What is Capo.js?', icon: 'i-heroicons-academic-cap', to: '/learn/guides/what-is-capo', description: 'Why HTML head tag order matters' },
    ],
  },
  {
    label: 'Research',
    description: 'Original data & analysis',
    color: 'violet' as const,
    items: [
      { label: 'State of <head> in 2026', icon: 'i-heroicons-chart-bar', to: '/learn/research/state-of-head-2026', description: '660k sites audited across 8 frameworks' },
      { label: 'Streaming Head Performance', icon: 'i-heroicons-chart-bar-square', to: '/learn/research/streaming-head-performance', description: 'Cross-framework SSR SEO study' },
      { label: 'Capo.js Performance Research', icon: 'i-heroicons-beaker', to: '/learn/research/capo-performance-research', description: '120 benchmarks + 10.7M CrUX origins' },
    ],
  },
]

const colorClasses = {
  cyan: {
    dot: 'bg-cyan-500',
    iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    icon: 'text-cyan-600 dark:text-cyan-400',
    hover: 'hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10',
  },
  violet: {
    dot: 'bg-violet-500',
    iconBg: 'bg-violet-500/10 dark:bg-violet-500/15',
    icon: 'text-violet-600 dark:text-violet-400',
    hover: 'hover:bg-violet-500/5 dark:hover:bg-violet-500/10',
  },
}
</script>

<template>
  <div class="learn-menu grid grid-cols-2 gap-0 p-0 min-w-[660px]">
    <div
      v-for="(category, catIdx) in categories"
      :key="category.label"
      class="category-column relative"
      :class="[catIdx < categories.length - 1 ? 'border-r border-default' : '']"
      :style="{ '--stagger': catIdx }"
    >
      <div class="px-4 pt-4 pb-2">
        <div class="flex items-center gap-2 mb-0.5">
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="colorClasses[category.color].dot"
          />
          <span class="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {{ category.label }}
          </span>
        </div>
        <p class="text-[10px] text-dimmed pl-3.5">
          {{ category.description }}
        </p>
      </div>

      <div class="px-2 pb-3 space-y-0.5">
        <NuxtLink
          v-for="(item, itemIdx) in category.items"
          :key="item.to"
          :to="item.to"
          class="learn-item group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200"
          :class="colorClasses[category.color].hover"
          :style="{ '--item-delay': itemIdx }"
        >
          <div
            class="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
            :class="colorClasses[category.color].iconBg"
          >
            <UIcon
              :name="item.icon"
              class="w-4.5 h-4.5 transition-colors"
              :class="colorClasses[category.color].icon"
            />
          </div>

          <div class="flex flex-col min-w-0">
            <span class="text-sm font-medium text-default group-hover:text-highlighted transition-colors">
              {{ item.label }}
            </span>
            <span class="text-[11px] text-dimmed">
              {{ item.description }}
            </span>
          </div>

          <UIcon
            name="i-heroicons-chevron-right-20-solid"
            class="w-3.5 h-3.5 ml-auto text-dimmed opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
          />
        </NuxtLink>
      </div>
    </div>

    <div class="col-span-2 border-t border-default bg-[var(--ui-bg-elevated)]/50">
      <NuxtLink
        to="/learn/guides/what-is-capo"
        class="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-muted hover:text-default transition-colors group"
      >
        <UIcon name="i-heroicons-academic-cap" class="w-4 h-4" />
        <span>Browse all articles</span>
        <UIcon
          name="i-heroicons-arrow-right"
          class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.learn-menu {
  animation: menu-enter 0.2s ease-out;
}

@keyframes menu-enter {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.category-column {
  animation: column-stagger 0.25s ease-out backwards;
  animation-delay: calc(var(--stagger) * 40ms);
}

@keyframes column-stagger {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.learn-item {
  animation: item-fade 0.2s ease-out backwards;
  animation-delay: calc(var(--stagger) * 40ms + var(--item-delay) * 30ms + 80ms);
}

@keyframes item-fade {
  from {
    opacity: 0;
    transform: translateX(-6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
