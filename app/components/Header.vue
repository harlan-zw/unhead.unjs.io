<script setup lang="ts">
import { useContentSearch } from '#ui-pro/composables/useContentSearch'
import { ref } from 'vue'
import { Unhead } from '~~/const'
import { getPathSection, getPathSegments, getPathWithFramework, getPathWithoutFramework } from '~~/utils/urls'
import { useStats } from '~/composables/data'
import { useFrameworkSelector } from '~/composables/frameworkSelector'
import FrameworkSelector from './FrameworkSelector.vue'

const { selectedFramework, switchFramework, frameworks } = useFrameworkSelector()

const stats = await useStats()
const versions = computed(() => {
  return (stats.value?.versions || []).map((version) => {
    return {
      label: version,
      value: version,
      disabled: true,
    }
  })
})
const version = versions.value[0]

const route = useRoute()

const stars = computed(() => {
  return Intl.NumberFormat('en', { notation: 'compact', compactDisplay: 'short' }).format(stats.value?.stars?.stars || 0)
})

const menu = computed(() => {
  return [
    {
      label: Unhead.label,
      icon: Unhead.icon,
      to: `/docs/${selectedFramework.value.slug}/head/guides/get-started/overview`,
      active: getPathSection(getPathWithoutFramework(route.path)) === '/docs/head',
    },
    {
      label: 'Schema.org',
      icon: 'i-carbon-chart-relationship',
      to: `/docs/${selectedFramework.value.slug}/schema-org/guides/get-started/overview`,
      active: getPathSection(getPathWithoutFramework(route.path)) === '/docs/schema-org',
    },
    {
      label: 'Third-Party Scripts',
      icon: 'i-carbon-script',
      to: '/',
      disabled: true,
      badge: 'Soon',
      active: route.path.split('/')[2] === 'scripts',
      class: 'hidden xl:flex',
    },
    {
      label: 'Releases',
      icon: 'i-carbon-version',
      to: '/releases',
    },
  ]
})

const open = ref(false)
watch(selectedFramework, () => {
  open.value = false
})

const docsNav = useDocsNav(true)

const { open: openSearch } = useContentSearch()

const subSectionLinks = computed(() => {
  return docsNav.value?.firstSubSectionLinks?.map((n) => {
    const to = n.children?.[0]?.children?.[0]?.path
    const segments = getPathSegments(getPathWithoutFramework(to), 3)
    return {
      label: n.title,
      to: getPathWithFramework(to, selectedFramework.value.slug),
      active: getPathWithoutFramework(route.path).startsWith(segments),
    }
  })
})
</script>

<template>
  <UHeader :ui="{ root: 'bg-transparent border-none', container: 'max-w-[1500px] mx-auto ' }">
    <template #left>
      <div class="flex items-center justify-between gap-2 h-16 pr-2 xl:pr-5">
        <div class="flex items-center gap-10">
          <div class="flex items-center gap-3">
            <UButton
              variant="ghost" to="/" title="Home" aria-label="Title"
              class="py-2 flex items-end gap-1.5 font-bold text-xl text-(--ui-text-highlighted) font-title"
            >
              <Logo />
            </UButton>
          </div>
        </div>
      </div>
      <div class="hidden lg:flex items-center gap-2">
        <UModal v-if="!route.path.startsWith('/docs')" v-model:open="open" title="Select your framework">
          <UButton class="cursor-pointer" variant="ghost" size="sm">
            <UIcon
              :key="selectedFramework?.slug" dynamic :name="selectedFramework?.icon"
              class="w-6 h-6 text-(--ui-primary)-400 dark:text-sky-200"
            />
            <UIcon name="i-carbon-chevron-down" class="w-4 h-4 text-[var(--ui-text)]" />
          </UButton>
          <template #body>
            <FrameworkSelector />
          </template>
        </UModal>
        <UNavigationMenu highlight :items="menu.slice(0, 3)" class="justify-center" />
      </div>
      <UInput type="search" class="ml-5 hidden lg:block w-[150px] xl:w-[300px]" shortcut="meta_k" placeholder="Search..." @click="openSearch = true">
        <template #leading>
          <UContentSearchButton size="sm" class="p-0 opacity-70 hover:opacity-100" />
        </template>
        <template #trailing>
          <UKbd>/</UKbd>
        </template>
      </UInput>
    </template>

    <template #body>
      <div>
        <div class="px-3 mb-3">
          <FrameworkSelectorMinimal size="small" />
        </div>
        <UInput type="search" class="ml-5 hidden lg:block w-[150px] xl:w-[300px]" placeholder="Search..." @click="openSearch = true">
          <template #leading>
            <UContentSearchButton size="sm" class="p-0 opacity-70 hover:opacity-100" />
          </template>
        </UInput>
        <div v-if="route.path.startsWith('/docs')">
          <DocsSidebarHeader />
          <USeparator class="mb-5" />
        </div>
        <UTabs v-else :items="[{ label: 'Head', slot: 'head' }, { label: 'Schema.org', slot: 'schema-org' }]" color="neutral">
          <template #head>
            <UContentNavigation v-for="idx in [0, 1]" :key="idx" :navigation="docsNav.bottom[0].children[idx].children.map(c => ({ ...c, title: `${docsNav.bottom[0].children[idx].title} - ${c.title}` }))" class="my-5">
              <template #link="{ link }">
                <div
                  v-if="!link.html" class="flex items-center justify-between gap-2 w-full"
                  :class="link.deprecated ? 'opacity-50' : ''"
                >
                  <div class="flex items-center gap-2">
                    <div :class="link.children?.length ? 'text-sm font-bold' : ''">
                      {{ link.title }}
                    </div>
                  </div>
                  <UIcon v-if="link.tag" :name="`i-logos-${link.tag}`" dynamclic ass="w-4 h-4" />
                </div>
                <div v-else :class="link.deprecated ? 'opacity-50' : ''">
                  <UIcon v-if="link.icon" :name="link.icon" class="w-4 h-4 text-(--ui-primary)-400 dark:text-sky-200" />
                  <div v-html="link.title" />
                </div>
                <UIcon
                  v-if="link.icon" :name="link.icon"
                  class="w-4 h-4 transition-all hover:brightness-50 brightness-120 sepia-[50%]"
                />
                <div v-if="link.new">
                  <UBadge size="sm" variant="subtle" color="success">
                    New
                  </UBadge>
                </div>
                <div v-else-if="link.deprecated" class="opacity-50">
                  <UBadge size="sm" variant="subtle" color="neutral">
                    Deprecated
                  </UBadge>
                </div>
              </template>
            </UContentNavigation>
          </template>
          <template #schema-org>
            <UContentNavigation v-for="idx in [0, 1]" :key="idx" :navigation="docsNav.bottom[1].children[idx].children.map(c => ({ ...c, title: `${docsNav.bottom[1].children[idx].title} - ${c.title}` }))" class="my-5">
              <template #link="{ link }">
                <div
                  v-if="!link.html" class="flex items-center justify-between gap-2 w-full"
                  :class="link.deprecated ? 'opacity-50' : ''"
                >
                  <div class="flex items-center gap-2">
                    <div :class="link.children?.length ? 'text-sm font-bold' : ''">
                      {{ link.title }}
                    </div>
                  </div>
                  <UIcon v-if="link.tag" :name="`i-logos-${link.tag}`" dynamclic ass="w-4 h-4" />
                </div>
                <div v-else :class="link.deprecated ? 'opacity-50' : ''">
                  <UIcon v-if="link.icon" :name="link.icon" class="w-4 h-4 text-(--ui-primary)-400 dark:text-sky-200" />
                  <div v-html="link.title" />
                </div>
                <UIcon
                  v-if="link.icon" :name="link.icon"
                  class="w-4 h-4 transition-all hover:brightness-50 brightness-120 sepia-[50%]"
                />
                <div v-if="link.new">
                  <UBadge size="sm" variant="subtle" color="success">
                    New
                  </UBadge>
                </div>
                <div v-else-if="link.deprecated" class="opacity-50">
                  <UBadge size="sm" variant="subtle" color="neutral">
                    Deprecated
                  </UBadge>
                </div>
              </template>
            </UContentNavigation>
          </template>
        </UTabs>
      </div>
    </template>

    <template #right>
      <div class="flex items-center justify-end lg:-mr-1.5 ml-3 gap-3">
        <div class="hidden lg:block">
          <UNavigationMenu :items="menu.slice(3)" :ui="{ viewport: 'min-w-[500px] -left-full' }" class="justify-center" />
        </div>
        <UButton
          to="https://github.com/unjs/unhead" target="_blank" class="text-[var(--ui-text-highlighted)] dark:text-black hover:text-[var(--ui-text-muted)]
        hidden sm:flex justify-center items-center bg-gradient bg-gradient-to-r from-[#FBBF24] to-[#f0db4f]"
          size="sm"
        >
          <div class="flex items-center font-medium gap-1">
            <div>Star</div>
            <div class="font-mono">
              {{ stars }}
            </div>
            <UIcon name="i-tabler-star" class="size-3 sepia" />
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
  <div v-if="route.path.startsWith('/docs')" :key="`${selectedFramework.slug}-${route.path}`" class=" border-black/10 border-t h-12">
    <div class="relative max-w-[1400px] mx-auto grid grid-cols-10 h-full justify-center items-center w-full">
      <div class="col-span-3 hidden lg:flex h-12">
        <div class="h-full flex text-sm space-x-6">
          <div v-for="item in subSectionLinks" :key="item.to">
            <NuxtLink
              :class="item.active ? 'group relative h-full flex items-center text-gray-800 dark:text-gray-200 font-semibold' : 'group relative h-full flex items-center font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-300'"
              :to="item.to"
            >
              {{ item.label }}
              <div :class="item.active ? 'absolute bottom-0 h-[1.5px] w-full bg-[var(--ui-primary)] dark:bg-primary-light' : 'absolute bottom-0 h-[1.5px] w-full group-hover:bg-gray-200 dark:group-hover:bg-gray-700'" />
            </NuxtLink>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 pl-5 col-span-5">
        <div class="z-10  flex gap-2 items-center dark:text-blue-200 group-hover:text-blue-500 transition-all">
          <UIcon dynamic :name="selectedFramework.icon" class="w-5 h-5" />
          <div class="font-semibold">
            {{ selectedFramework.label }}
          </div>
        </div>
        <USeparator orientation="vertical" color="neutral" class="h-10 w-2 mx-3 hidden lg:block" />
        <div class="z-10 gap-1 text-blue-200 group-hover:text-blue-500 hidden lg:flex transition-all relative">
          <UButton
            v-for="framework in frameworks.filter(f => f.slug !== selectedFramework.slug)" :key="framework.slug"
            :title="`Switch to ${framework.label}`" :aria-label="framework.label" type="button"
            class="cursor-pointer transition-all "
            :to="getPathWithoutFramework(route.path, framework.slug)"
            :class="[framework.slug === selectedFramework.slug ? [] : ['hover:brightness-50 brightness-120 sepia-[90%]']]"
            variant="ghost" @click.prevent="switchFramework(framework)"
          >
            <UIcon dynamic :name="framework.icon" class="w-5 h-5" />
          </UButton>
        </div>
      </div>
      <div class="col-span-2 flex justify-end">
        <USelectMenu v-model="version" :search-input="false" size="sm" :items="versions" class="w-[120px]" />
      </div>
    </div>
  </div>
</template>
