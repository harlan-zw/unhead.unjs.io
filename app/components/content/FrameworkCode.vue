<script setup lang="ts">
const frameworkDefs = [
  { slot: 'typescript', icon: 'i-logos-typescript-icon', label: 'TypeScript', slug: 'typescript' },
  { slot: 'vue', icon: 'i-logos-vue', label: 'Vue', slug: 'vue' },
  { slot: 'react', icon: 'i-logos-react', label: 'React', slug: 'react' },
  { slot: 'svelte', icon: 'i-logos-svelte-icon', label: 'Svelte', slug: 'svelte' },
  { slot: 'solid', icon: 'i-logos-solidjs-icon', label: 'Solid.js', slug: 'solid-js' },
  { slot: 'angular', icon: 'i-logos-angular-icon', label: 'Angular', slug: 'angular' },
  { slot: 'nuxt', icon: 'i-logos-nuxt-icon', label: 'Nuxt', slug: 'nuxt' },
] as const

const slots = useSlots()
const { selectedFramework } = useFrameworkSelector()

const availableFrameworks = computed(() =>
  frameworkDefs.filter(f => !!slots[f.slot]),
)

const selectedIndex = ref(0)

// Sync with framework selector
watch(() => selectedFramework.value?.slug, (slug) => {
  const idx = availableFrameworks.value.findIndex((f) => {
    if (f.slug === slug)
      return true
    // Nuxt users should see Vue code if no Nuxt slot
    if (slug === 'nuxt' && f.slug === 'vue')
      return true
    return false
  })
  if (idx >= 0)
    selectedIndex.value = idx
}, { immediate: true })

const activeFramework = computed(() => availableFrameworks.value[selectedIndex.value] || availableFrameworks.value[0])
</script>

<template>
  <div class="relative my-5">
    <div class="flex items-center gap-1 border border-neutral-200 dark:border-neutral-700 border-b-0 rounded-t-md overflow-hidden p-2">
      <button
        v-for="(fw, index) in availableFrameworks"
        :key="fw.slot"
        tabindex="-1"
        class="px-2 py-1.5 focus:outline-none text-default text-sm rounded-md flex items-center gap-1.5 cursor-pointer"
        :class="selectedIndex === index
          ? 'bg-neutral-100 dark:bg-neutral-800'
          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'"
        @click="selectedIndex = index"
      >
        <UIcon :name="fw.icon" dynamic class="size-4" />
        <span>{{ fw.label }}</span>
      </button>
    </div>

    <div class="[&>div]:!my-0 [&>div]:!static [&>pre]:!my-0 [&>pre]:rounded-t-none [&>div>pre]:rounded-t-none [&_.group]:rounded-t-none">
      <slot :name="activeFramework.slot" />
    </div>
  </div>
</template>
