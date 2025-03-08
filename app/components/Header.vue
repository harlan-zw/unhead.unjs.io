<script setup lang="ts">
import { ref } from 'vue'
import { Unhead } from '~~/const'
import { useFrameworkSelector } from '~/composables/frameworkSelector'
import FrameworkSelector from './FrameworkSelector.vue'

const { selectedFramework } = useFrameworkSelector()

const stats = inject('stats', ref())
const route = useRoute()

const stars = computed(() => {
  return Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short' }).format(stats.value?.stars?.stars || 0)
})

const menu = computed(() => {
  return [
    {
      label: Unhead.label,
      icon: Unhead.icon,
      to: '/docs/introduction',
      active: route.path.split('/')[2] && !['schema-org', 'scripts'].includes(route.path.split('/')[2]),
    },
    {
      label: 'Schema.org',
      icon: 'i-carbon-chart-relationship',
      to: '/docs/schema-org/introduction',
      active: route.path.split('/')[2] === 'schema-org',
    },
    {
      label: 'Third Party Scripts',
      icon: 'i-carbon-script',
      to: '/',
      disabled: true,
      badge: 'Coming Soon',
      active: route.path.split('/')[2] === 'scripts',
    },
    {
      label: 'Releases',
      icon: 'i-carbon-version',
      to: '/releases',
    },
  ]
})

const navigation = computed(() => {
  return menu.value.map((item) => {
    return {
      ...item,
      title: item.label,
    }
  })
})

const open = ref(false)
watch(selectedFramework, () => {
  open.value = false
})
</script>

<template>
  <UHeader :ui="{ root: 'bg-transparent border-none', container: 'max-w-full w-full' }">
    <template #left>
      <div class="flex items-center justify-between gap-2 h-16 xl:pl-10 xl:pr-5">
        <div class="flex items-center gap-10">
          <div class="flex items-center gap-3">
            <UButton variant="ghost" to="/" title="Home" aria-label="Title" class="py-2 flex items-end gap-1.5 font-bold text-xl text-gray-900 dark:text-white font-title">
              <Logo />
            </UButton>
          </div>
        </div>
      </div>
      <div class="hidden lg:flex items-center gap-2">
        <UModal v-model:open="open" title="Select your framework">
          <UButton class="cursor-pointer" variant="ghost" size="sm">
            <UIcon :key="selectedFramework?.slug" dynamic :name="selectedFramework?.icon" class="w-6 h-6 text-primary-400 dark:text-sky-200" />
            <UIcon name="i-carbon-chevron-down" class="w-4 h-4 text-[var(--ui-text)]" />
          </UButton>
          <template #body>
            <FrameworkSelector />
          </template>
        </UModal>
        <UNavigationMenu highlight variant="pill" :items="menu.slice(0, 3)" class="justify-center" />
      </div>
    </template>

    <template #content>
      <div v-if="route.path.startsWith('/docs')">
        <DocsSidebarHeader />
        <USeparator class="mb-5" />
      </div>
      <UContentNavigation :navigation="navigation">
        <template #link="{ link }">
          <div class="flex items-center gap-2">
            <UIcon v-if="link.icon" :name="link.icon" class="w-4 h-4 text-primary-400 dark:text-sky-200" />
            <div :class="link.children?.length ? 'text-sm font-bold' : ''">
              {{ link.title }}
            </div>
          </div>
        </template>
      </UContentNavigation>
    </template>

    <template #right>
      <div class="flex items-center justify-end lg:-mr-1.5 ml-3 gap-3">
        <div class="hidden lg:block">
          <UNavigationMenu :items="menu.slice(3)" :ui="{ viewport: 'min-w-[500px] -left-full' }" class="justify-center" />
        </div>
        <UButton
          to="https://github.com/unjs/unhead" target="_blank" class="text-black
        hidden sm:flex items-center justify-center items-center bg-gradient bg-gradient-to-r from-[#FBBF24] to-[#f0db4f]"
          size="sm"
        >
          <template #leading>
            <div class="flex items-center transition space-x-1">
              <UIcon name="i-carbon-star" class="size-4" />
              <div>Star</div>
            </div>
          </template>
          <div class="font-semibold font-mono">
            {{ stars }}
          </div>
        </UButton>

        <div class="flex items-center lg:gap-1.5">
          <ColorModeButton />

          <UButton
            aria-label="Unhead on GitHub"
            to="https://github.com/unjs/unhead"
            target="_blank"
            color="neutral"
            variant="ghost"
            class="hidden lg:inline-flex transition opacity-85"
            icon="i-carbon-logo-github"
          />

          <UButton
            aria-label="Harlan's Discord"
            to="https://discord.com/invite/275MBUBvgP"
            target="_blank"
            color="neutral"
            variant="ghost"
            class="hidden lg:inline-flex transition opacity-85"
            icon="i-carbon-logo-discord"
          />
        </div>
      </div>
    </template>
  </UHeader>
</template>
