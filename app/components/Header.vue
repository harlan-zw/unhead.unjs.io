<script setup lang="ts">
import { useContentSearch } from '#ui-pro/composables/useContentSearch'
import { motion } from 'motion-v'
import { ref } from 'vue'
import { Unhead } from '~~/const'
import { getPathSection, getPathSegments, getPathWithFramework, getPathWithoutFramework } from '~~/utils/urls'
import { useStats } from '~/composables/data'
import { useFrameworkSelector } from '~/composables/frameworkSelector'

const docsNav = useDocsNav(true)
const { selectedFramework, switchFramework, frameworks } = useFrameworkSelector(docsNav)

const stats = await useStats()
const versions = computed(() => {
  return [
    ...(stats.value?.versions || []).map((version) => {
      return {
        label: version,
        value: version,
      }
    }),
    { label: 'v1.11.20', value: 'v1.11.20' },
  ]
})
const version = ref(versions.value[0])
watch(version, () => {
  window.open('https://v1.unhead.unjs.io/', '_blank')
})

const route = useRoute()

const menu = computed(() => {
  return [
    {
      label: Unhead.label,
      // icon: Unhead.icon,
      to: `/docs/${selectedFramework.value.slug}/head/guides/get-started/overview`,
      active: getPathSection(getPathWithoutFramework(route.path)) === '/docs/head',
    },
    {
      label: 'Schema.org',
      // icon: 'i-carbon-chart-relationship',
      to: `/docs/${selectedFramework.value.slug}/schema-org/guides/get-started/overview`,
      active: getPathSection(getPathWithoutFramework(route.path)) === '/docs/schema-org',
    },
    {
      label: 'Scripts',
      // icon: 'i-carbon-script',
      to: '/',
      disabled: true,
      badge: 'Soon',
      active: route.path.split('/')[2] === 'scripts',
      class: 'hidden 2xl:flex',
    },
    {
      label: 'OG Image',
      // icon: 'i-carbon-image',
      to: '/',
      disabled: true,
      badge: 'Soon',
      active: route.path.split('/')[2] === 'scripts',
      class: 'hidden 2xl:flex',
    },
    {
      label: 'Releases',
      to: '/releases',
    },
  ]
})

const open = ref(false)
watch(selectedFramework, () => {
  open.value = false
})

const { open: openSearch } = useContentSearch()

onKeyStroke('Divide', () => {
  openSearch.value = true
})

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
  <UHeader :ui="{ root: 'border-none bg-transparent pt-2 mb-3 h-auto', container: 'max-w-[1450px] bg-gray-600/3 border border-[var(--ui-border)] dark:bg-gray-900/10 mx-auto py-0 px-5 lg:px-3.5 rounded-lg' }">
    <template #left>
      <NuxtLink
        to="/"
        title="Home" aria-label="Title"
        class="flex mr-4 items-end gap-1.5 font-bold text-base text-(--ui-text-highlighted) font-title"
      >
        <Logo />
      </NuxtLink>
      <div class="hidden lg:flex items-center gap-2">
        <UNavigationMenu highlight :items="menu.slice(0, 4)" class="justify-center" />
      </div>
    </template>

    <template #body>
      <div>
        <div class="px-3 mb-3">
          <FrameworkSelectorMinimal size="small" />
        </div>
        <UInput type="search" class="ml-5 hidden lg:block w-[150px] xl:w-[200px]" placeholder="Search..." @click="openSearch = true">
          <template #leading>
            <UContentSearchButton size="sm" class="p-0 opacity-70 hover:opacity-100" @click="openSearch = true" />
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
      <div class="flex items-center justify-end lg:-mr-1.5 gap-3">
        <div class="hidden lg:block">
          <UNavigationMenu :items="menu.slice(4)" :ui="{ viewport: 'min-w-[500px] -left-full' }" class="justify-center" />
        </div>
        <UInput type="search" class="cursor-pointer hidden lg:block w-[70px]" shortcut="meta_k" @click="openSearch = true">
          <template #leading>
            <UContentSearchButton size="sm" class="cursor-pointer  p-0 opacity-70 hover:opacity-100"  @click="openSearch = true" />
          </template>
          <template #trailing>
            <UKbd @click="openSearch = true">/</UKbd>
          </template>
        </UInput>
        <div class="flex items-center lg:gap-1.5">
          <UButton
            aria-label="Unhead on GitHub"
            to="https://github.com/unjs/unhead"
            target="_blank"
            color="neutral"
            variant="ghost"
            class="hidden lg:inline-flex transition opacity-85"
            icon="i-carbon-logo-github"
          />
        </div>
      </div>
    </template>
  </UHeader>
  <div v-if="route.path.startsWith('/docs')" class=" h-12">
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
          <div class="font-semibold">
            <motion.div
              :key="selectedFramework.slug"
              :initial="{ opacity: 0, y: 16, filter: 'blur(0.2rem)' }"
              :animate="{ opacity: 1, y: 0, filter: 'blur(0)' }"
              :exit="{ opacity: 0, y: 16, filter: 'blur(0.2rem)' }"
              :while-hover="{ scale: 1.2 }" layout
            >
              {{ selectedFramework.label }}
            </motion.div>
          </div>
        </div>
        <ul class="z-10 gap-1 text-blue-200 group-hover:text-blue-500 hidden lg:flex transition-all relative">
          <motion.li
            v-for="framework in frameworks"
            :key="framework.slug"
            :while-hover="{ scale: 1.2 }"
            layout
            :transition="{
              type: 'spring',
              damping: 20,
              stiffness: 300,
              duration: 2,
            }"
            :while-press="{
              scale: selectedFramework.slug === framework.slug ? 1.2 : 0.8,
              rotate: selectedFramework.slug === framework.slug ? 1.2 : 0.8,
              transform: selectedFramework.slug === framework.slug ? 'rotate(33deg)' : 'rotate(0deg)',
            }"
          >
            <UButton
              :title="`Switch to ${framework.label}`" :aria-label="framework.label" type="button"
              class="cursor-pointer transition-all "
              :to="framework.to"
              :class="[framework.slug === selectedFramework.slug ? [] : ['hover:brightness-100 hover:sepia-[10%] brightness-120 sepia-[90%]']]"
              variant="ghost" @click="switchFramework(framework)"
            >
              <UIcon dynamic :name="framework.icon" class="w-5 h-5" />
            </UButton>
          </motion.li>
        </ul>
      </div>
      <div class="col-span-2 flex justify-end">
        <USelectMenu v-model="version" :search-input="false" size="sm" :items="versions" class="w-[120px]" />
      </div>
    </div>
  </div>
</template>
