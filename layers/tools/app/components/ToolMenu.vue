<script setup lang="ts">
const toolCategories = [
  {
    label: 'SEO Tools',
    description: 'Generate & validate',
    color: 'emerald' as const,
    tools: [
      { label: 'Meta Tag Generator', icon: 'i-heroicons-code-bracket', to: '/tools/meta-tag-generator', description: 'Generate meta tags for any page' },
      { label: 'OG Image Generator', icon: 'i-heroicons-photo', to: '/tools/og-image-generator', description: 'Create social share images' },
      { label: 'Schema.org Generator', icon: 'i-heroicons-cube', to: '/tools/schema-generator', description: 'Build structured data markup' },
      { label: 'Capo.js Analyzer', icon: 'i-heroicons-chart-bar', to: '/tools/capo-analyzer', description: 'Analyze head tag ordering' },
    ],
  },
]

const colorClasses = {
  emerald: {
    dot: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    icon: 'text-emerald-600 dark:text-emerald-400',
    hover: 'hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10',
  },
}
</script>

<template>
  <div class="tools-menu p-0 min-w-[320px]">
    <div
      v-for="(category, catIdx) in toolCategories"
      :key="category.label"
      class="category-column relative"
      :style="{ '--stagger': catIdx }"
    >
      <div class="px-4 pt-4 pb-2">
        <div class="flex items-center gap-2 mb-0.5">
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="colorClasses[category.color].dot"
          />
          <span class="text-[11px] font-semibold uppercase tracking-wider text-[var(--ui-text-muted)]">
            {{ category.label }}
          </span>
        </div>
        <p class="text-[10px] text-[var(--ui-text-dimmed)] pl-3.5">
          {{ category.description }}
        </p>
      </div>

      <div class="px-2 pb-3 space-y-0.5">
        <NuxtLink
          v-for="(tool, toolIdx) in category.tools"
          :key="tool.to"
          :to="tool.to"
          class="tool-item group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200"
          :class="colorClasses[category.color].hover"
          :style="{ '--tool-delay': toolIdx }"
        >
          <div
            class="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
            :class="colorClasses[category.color].iconBg"
          >
            <UIcon
              :name="tool.icon"
              class="w-4.5 h-4.5 transition-colors"
              :class="colorClasses[category.color].icon"
            />
          </div>

          <div class="flex flex-col min-w-0">
            <span class="text-sm font-medium text-[var(--ui-text)] group-hover:text-[var(--ui-text-highlighted)] transition-colors">
              {{ tool.label }}
            </span>
            <span class="text-[11px] text-[var(--ui-text-dimmed)] truncate">
              {{ tool.description }}
            </span>
          </div>

          <UIcon
            name="i-heroicons-chevron-right-20-solid"
            class="w-3.5 h-3.5 ml-auto text-[var(--ui-text-dimmed)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
          />
        </NuxtLink>
      </div>
    </div>

    <div class="border-t border-[var(--ui-border)] bg-[var(--ui-bg-elevated)]/50">
      <NuxtLink
        to="/tools"
        class="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] transition-colors group"
      >
        <UIcon name="i-heroicons-wrench-screwdriver" class="w-4 h-4" />
        <span>View all tools</span>
        <UIcon
          name="i-heroicons-arrow-right"
          class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.tools-menu {
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

.tool-item {
  animation: tool-fade 0.2s ease-out backwards;
  animation-delay: calc(var(--stagger) * 40ms + var(--tool-delay) * 30ms + 80ms);
}

@keyframes tool-fade {
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
