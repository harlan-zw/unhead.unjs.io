<script setup lang="ts">
import { useContentSearch } from '#ui/composables/useContentSearch'
import { motion } from 'motion-v'
import { NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuRoot, NavigationMenuTrigger, NavigationMenuViewport } from 'reka-ui'
import { ref } from 'vue'
import { getPathSegments, getPathWithFramework, getPathWithoutFramework } from '~~/utils/urls'
import { useFrameworkSelector } from '~/composables/frameworkSelector'
import { useNavMenu } from '~/composables/navMenu'
import { useVersionSelector } from '~/composables/versionSelector'

const docsNav = useDocsNav(true)
const { selectedFramework, switchFramework, frameworks } = useFrameworkSelector(docsNav)
const { versions, selectedVersion, getVersionedPath } = useVersionSelector()
const { megaMenuItems } = useNavMenu()

const route = useRoute()
const versionItems = computed(() => versions.map(v => ({
  label: v.label,
  value: v.slug,
})))
const version = ref(versionItems.value.find(v => v.value === selectedVersion.value.slug) || versionItems.value[0])

// Sync version when route changes
watch(() => selectedVersion.value.slug, (slug) => {
  version.value = versionItems.value.find(v => v.value === slug) || versionItems.value[0]
})

function onVersionChange(v: { label: string, value: string }) {
  // Force page reload to reinitialize navigation state
  if (v.value === 'v2') {
    window.location.href = '/docs/v2/head/guides/get-started/overview'
  }
  else {
    const targetPath = getVersionedPath(route.path, 'v3')
    window.location.href = targetPath
  }
}

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
    // Content sections (releases, migration-guide) have direct children, not nested two levels
    const to = n.children?.[0]?.children?.[0]?.path || n.children?.[0]?.path
    if (!to)
      return null
    const segments = getPathSegments(getPathWithoutFramework(to), 3)
    // Apply version prefix to the framework path
    let targetPath = getPathWithFramework(to, selectedFramework.value.slug)
    if (selectedVersion.value.slug === 'v2') {
      targetPath = targetPath.replace('/docs/', '/docs/v2/')
    }
    return {
      label: n.title,
      to: targetPath,
      active: getPathWithoutFramework(route.path).startsWith(segments),
    }
  }).filter(Boolean)
})
</script>

<template>
  <UHeader :ui="{ root: 'border-none bg-transparent pt-2 mb-3 px-5 h-auto', container: 'max-w-[1452px] lg:bg-neutral-500/[0.02] lg:border border-[var(--ui-border)] lg:dark:bg-neutral-900/10 mx-auto py-0 px-0 lg:px-5 sm:px-0 rounded-lg' }">
    <template #left>
      <NuxtLink
        to="/"
        title="Home" aria-label="Title"
        class="flex mr-4 items-end gap-1.5 font-bold text-base text-(--ui-text-highlighted) font-title"
      >
        <Logo />
      </NuxtLink>
    </template>

    <template #default>
      <NavigationMenuRoot class="hidden lg:flex justify-center relative py-2">
        <NavigationMenuList class="flex items-center gap-0.5">
          <NavigationMenuItem v-for="item in megaMenuItems" :key="item.value" :value="item.value">
            <NavigationMenuTrigger as-child>
              <NuxtLink
                :to="item.to"
                class="group relative flex items-center gap-1.5 font-medium text-sm px-2.5 py-1.5 before:absolute before:z-[-1] before:rounded-md before:inset-x-px before:inset-y-0 data-[state=open]:before:bg-elevated data-[state=open]:text-highlighted before:transition-colors transition-colors"
              >
                <UIcon :name="item.icon" class="shrink-0 size-4 opacity-50 group-hover:opacity-80 group-data-[state=open]:opacity-90 transition-opacity" />
                {{ item.label }}
              </NuxtLink>
            </NavigationMenuTrigger>
            <NavigationMenuContent
              class="absolute top-0 left-0 w-auto data-[motion=from-start]:animate-[enter-from-left_200ms_ease] data-[motion=from-end]:animate-[enter-from-right_200ms_ease] data-[motion=to-start]:animate-[exit-to-left_200ms_ease] data-[motion=to-end]:animate-[exit-to-right_200ms_ease]"
            >
              <MegaMenu :categories="item.categories" :footer="item.footer" :cols="item.cols" :style="{ minWidth: item.minWidth }" />
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>

        <Teleport to="body">
          <NavigationMenuViewport
            class="fixed top-[60px] left-1/2 -translate-x-1/2 overflow-hidden bg-elevated shadow-xl rounded-md ring-1 ring-[var(--ui-border-accented)] h-(--reka-navigation-menu-viewport-height) w-(--reka-navigation-menu-viewport-width) transition-[width,height] duration-200 origin-[top_center] data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] z-[100]"
          />
        </Teleport>
        <NavigationMenuItem as-child>
          <NuxtLink
            to="/releases"
            class="group relative flex items-center gap-1.5 font-medium text-sm px-2.5 py-1.5 before:absolute before:z-[-1] before:rounded-md before:inset-x-px before:inset-y-0 before:transition-colors transition-colors"
          >
            Releases
          </NuxtLink>
        </NavigationMenuItem>
      </NavigationMenuRoot>
    </template>

    <template #body>
      <div>
        <div class="px-3 mb-3">
          <FrameworkSelectorMinimal size="small" />
        </div>
        <UInput type="search" aria-label="Search documentation" class="ml-5 hidden lg:block w-[150px] xl:w-[200px]" placeholder="Search..." @click="openSearch = true">
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
            <UContentNavigation v-for="idx in [0, 1]" :key="idx" :navigation="(docsNav.bottom[0].children[idx].children.map(c => ({ ...c, title: `${docsNav.bottom[0].children[idx].title} - ${c.title}` })) as any)" class="my-5">
              <template #link="{ link }">
                <div
                  v-if="!link.html" class="flex items-center justify-between gap-2 w-full"
                  :class="link.deprecated ? 'opacity-50' : ''"
                >
                  <div class="flex items-center gap-2">
                    <div :class="link.children?.length ? 'text-sm font-bold' : ''" v-text="link.title" />
                  </div>
                  <UIcon v-if="link.tag" :name="`i-logos-${link.tag}`" dynamic class="w-4 h-4" />
                </div>
                <div v-else :class="link.deprecated ? 'opacity-50' : ''">
                  <UIcon v-if="link.icon" :name="link.icon" class="w-4 h-4 text-(--ui-primary)-400 dark:text-sky-200" />
                  <div v-html="link.title" />
                </div>
                <UIcon
                  v-if="link.icon" :name="link.icon"
                  class="w-4 h-4 transition-all grayscale opacity-70 hover:grayscale-0 hover:opacity-100"
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
            <UContentNavigation v-for="idx in [0, 1]" :key="idx" :navigation="(docsNav.bottom[1].children[idx].children.map(c => ({ ...c, title: `${docsNav.bottom[1].children[idx].title} - ${c.title}` })) as any)" class="my-5">
              <template #link="{ link }">
                <div
                  v-if="!link.html" class="flex items-center justify-between gap-2 w-full"
                  :class="link.deprecated ? 'opacity-50' : ''"
                >
                  <div class="flex items-center gap-2">
                    <div :class="link.children?.length ? 'text-sm font-bold' : ''" v-text="link.title" />
                  </div>
                  <UIcon v-if="link.tag" :name="`i-logos-${link.tag}`" dynamic class="w-4 h-4" />
                </div>
                <div v-else :class="link.deprecated ? 'opacity-50' : ''">
                  <UIcon v-if="link.icon" :name="link.icon" class="w-4 h-4 text-(--ui-primary)-400 dark:text-sky-200" />
                  <div v-html="link.title" />
                </div>
                <UIcon
                  v-if="link.icon" :name="link.icon"
                  class="w-4 h-4 transition-all grayscale opacity-70 hover:grayscale-0 hover:opacity-100"
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
        <UInput type="search" aria-label="Search documentation" class="cursor-pointer hidden lg:block w-[70px]" shortcut="divide" @click="openSearch = true">
          <template #leading>
            <UContentSearchButton size="sm" class="cursor-pointer  p-0 opacity-70 hover:opacity-100" @click="openSearch = true" />
          </template>
          <template #trailing>
            <UKbd @click="openSearch = true">
              /
            </UKbd>
          </template>
        </UInput>
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
        </div>
      </div>
    </template>
  </UHeader>
  <div v-if="route.path.startsWith('/docs')" class=" h-12">
    <div class="relative max-w-[1452px] px-4 sm:px-5 lg:px-0 mx-auto flex lg:grid grid-cols-10 h-full justify-between lg:justify-center items-center w-full">
      <div class="col-span-3 flex h-12">
        <div class="h-full flex text-sm space-x-6">
          <div v-for="item in subSectionLinks" :key="item.to">
            <NuxtLink
              :class="item.active ? 'group relative h-full flex items-center text-highlighted font-semibold' : 'group relative h-full flex items-center font-medium text-muted group-hover:text-highlighted'"
              :to="item.to"
              :aria-label="item.label"
            >
              <span v-text="item.label" />
              <div :class="item.active ? 'absolute bottom-0 h-[1.5px] w-full bg-primary' : 'absolute bottom-0 h-[1.5px] w-full group-hover:bg-[var(--ui-border)]'" />
            </NuxtLink>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 lg:pl-3 col-span-5">
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
              :class="[framework.slug === selectedFramework.slug ? [] : ['grayscale opacity-60 hover:grayscale-0 hover:opacity-100']]"
              variant="ghost" @click="switchFramework(framework)"
            >
              <UIcon dynamic :name="framework.icon" class="w-5 h-5" />
            </UButton>
          </motion.li>
        </ul>
      </div>
      <div class="col-span-2 flex justify-end">
        <USelectMenu v-model="version" :search-input="false" size="sm" :items="versionItems" class="w-[120px]" @update:model-value="onVersionChange" />
      </div>
    </div>
  </div>
</template>
