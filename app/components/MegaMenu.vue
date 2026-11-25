<script setup lang="ts">
interface MegaMenuItem {
  label: string
  icon: string
  to: string
  description?: string
}

interface MegaMenuCategory {
  label: string
  description?: string
  items: MegaMenuItem[]
}

const { categories, footer, cols = 1 } = defineProps<{
  categories: MegaMenuCategory[]
  footer?: { label: string, icon: string, to: string }
  cols?: number
}>()
</script>

<template>
  <div
    class="gap-0 p-0"
    :class="cols > 1 ? 'grid grid-cols-[repeat(var(--cols),minmax(0,1fr))]' : ''"
    :style="{ '--cols': cols }"
  >
    <div
      v-for="(category, catIdx) in categories"
      :key="category.label"
      class="relative"
      :class="[catIdx < categories.length - 1 && cols > 1 ? 'border-r border-default' : '']"
    >
      <div class="px-4 pt-4 pb-1.5">
        <span class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
          <span class="w-1 h-1 rounded-full bg-[var(--ui-color-primary-400)]" />
          {{ category.label }}
        </span>
        <p v-if="category.description" class="text-[10px] text-dimmed mt-0.5">
          {{ category.description }}
        </p>
      </div>

      <div class="px-2 pb-3 space-y-px">
        <NuxtLink
          v-for="item in category.items"
          :key="item.to"
          :to="item.to"
          class="group flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all duration-150 hover:bg-accented"
        >
          <div class="shrink-0 w-6 h-6 rounded-md flex items-center justify-center bg-[var(--ui-bg-accented)]/60 group-hover:bg-[var(--ui-color-primary-500)]/10 transition-colors duration-150">
            <UIcon :name="item.icon" class="w-3.5 h-3.5 text-dimmed group-hover:text-[var(--ui-color-primary-500)] transition-colors duration-150" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-sm text-default group-hover:text-highlighted transition-colors duration-150 whitespace-nowrap">
              {{ item.label }}
            </span>
            <span v-if="item.description" class="text-[11px] text-dimmed leading-tight">
              {{ item.description }}
            </span>
          </div>
          <UIcon
            name="i-heroicons-chevron-right-20-solid"
            class="w-3 h-3 ml-auto text-dimmed opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-150"
          />
        </NuxtLink>
      </div>
    </div>

    <div v-if="footer" :class="cols > 1 ? 'col-span-full' : ''" class="border-t border-default bg-[var(--ui-bg-elevated)]/50">
      <NuxtLink
        :to="footer.to"
        class="flex items-center justify-center gap-2 px-4 py-2 text-[13px] text-muted hover:text-default transition-colors group"
      >
        <UIcon :name="footer.icon" class="w-3.5 h-3.5" />
        <span>{{ footer.label }}</span>
        <UIcon name="i-heroicons-arrow-right" class="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
      </NuxtLink>
    </div>
  </div>
</template>
