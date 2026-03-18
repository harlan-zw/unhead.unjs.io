<script setup lang="ts">
import { useFrameworkSelector } from '~/composables/frameworkSelector'
import { useVersionSelector } from '~/composables/versionSelector'

const { selectedFramework } = useFrameworkSelector()
const { selectedVersion } = useVersionSelector()

const versionPrefix = computed(() => selectedVersion.value.slug === 'v2' ? '/docs/v2' : '/docs')

function docPath(path: string) {
  return `${versionPrefix.value}/${selectedFramework.value.slug}${path}`
}

const categories = computed(() => [
  {
    label: 'Head Management',
    description: 'Meta tags & SEO',
    color: 'emerald' as const,
    items: [
      { label: 'Getting Started', icon: 'i-heroicons-rocket-launch', to: docPath('/head/guides/get-started/overview') },
      { label: 'useHead', icon: 'i-heroicons-code-bracket', to: docPath('/head/api/composables/use-head') },
      { label: 'useSeoMeta', icon: 'i-heroicons-magnifying-glass', to: docPath('/head/api/composables/use-seo-meta') },
      { label: 'useHeadSafe', icon: 'i-heroicons-shield-check', to: docPath('/head/api/composables/use-head-safe') },
      { label: 'useScript', icon: 'i-heroicons-play-circle', to: docPath('/head/api/composables/use-script') },
    ],
  },
  {
    label: 'Schema.org',
    description: 'Structured data',
    color: 'violet' as const,
    items: [
      { label: 'Getting Started', icon: 'i-heroicons-rocket-launch', to: docPath('/schema-org/guides/get-started/overview') },
      { label: 'useSchemaOrg', icon: 'i-heroicons-code-bracket', to: docPath('/schema-org/api/composables/use-schema-org') },
      { label: 'Nodes', icon: 'i-heroicons-cube', to: docPath('/schema-org/guides/core-concepts/nodes') },
      { label: 'Recipes', icon: 'i-heroicons-book-open', to: docPath('/schema-org/guides/recipes/identity') },
    ],
  },
  {
    label: 'Guides',
    description: 'Core concepts',
    color: 'amber' as const,
    items: [
      { label: 'Titles', icon: 'i-heroicons-document-text', to: docPath('/head/guides/core-concepts/titles') },
      { label: 'Streaming SSR', icon: 'i-heroicons-bolt', to: docPath('/head/guides/core-concepts/streaming') },
      { label: 'DOM Events', icon: 'i-heroicons-cursor-arrow-rays', to: docPath('/head/guides/core-concepts/dom-event-handling') },
      { label: 'Plugins', icon: 'i-heroicons-puzzle-piece', to: docPath('/head/guides/plugins/template-params') },
    ],
  },
])

const colorClasses = {
  emerald: {
    dot: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    icon: 'text-emerald-600 dark:text-emerald-400',
    hover: 'hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10',
  },
  violet: {
    dot: 'bg-violet-500',
    iconBg: 'bg-violet-500/10 dark:bg-violet-500/15',
    icon: 'text-violet-600 dark:text-violet-400',
    hover: 'hover:bg-violet-500/5 dark:hover:bg-violet-500/10',
  },
  amber: {
    dot: 'bg-amber-500',
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    icon: 'text-amber-600 dark:text-amber-400',
    hover: 'hover:bg-amber-500/5 dark:hover:bg-amber-500/10',
  },
}
</script>

<template>
  <div class="docs-menu grid grid-cols-3 gap-0 p-0 min-w-[620px]">
    <div
      v-for="(category, catIdx) in categories"
      :key="category.label"
      class="category-column relative"
      :class="[
        catIdx < categories.length - 1 ? 'border-r border-default' : '',
      ]"
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
          class="docs-item group flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all duration-200"
          :class="colorClasses[category.color].hover"
          :style="{ '--item-delay': itemIdx }"
        >
          <div
            class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
            :class="colorClasses[category.color].iconBg"
          >
            <UIcon
              :name="item.icon"
              class="w-4 h-4 transition-colors"
              :class="colorClasses[category.color].icon"
            />
          </div>

          <span class="text-sm font-medium text-default group-hover:text-highlighted transition-colors whitespace-nowrap">
            {{ item.label }}
          </span>

          <UIcon
            name="i-heroicons-chevron-right-20-solid"
            class="w-3.5 h-3.5 text-dimmed opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
          />
        </NuxtLink>
      </div>
    </div>

    <div class="col-span-3 border-t border-default bg-[var(--ui-bg-elevated)]/50">
      <NuxtLink
        :to="docPath('/head/guides/get-started/overview')"
        class="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-muted hover:text-default transition-colors group"
      >
        <UIcon name="i-heroicons-book-open" class="w-4 h-4" />
        <span>Browse all docs</span>
        <UIcon
          name="i-heroicons-arrow-right"
          class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.docs-menu {
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

.docs-item {
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
