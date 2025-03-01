<script setup lang="ts">
import { useContentSearch } from '#ui-pro/composables/useContentSearch'
import { useFrameworkSelector } from '~/composables/frameworkSelector'

const { selectedFramework } = useFrameworkSelector()

const module = useModule()
const searchTerm = ref('')
const stats = inject('stats', ref({ modules: [] }))
const files = inject('search')
const nav = useDocsNav()

const { open } = useContentSearch()
const versions = computed(() => {
  return (stats.value.versions || []).map((version) => {
    return {
      label: version,
      value: version,
      disabled: true,
    }
  })
})
const version = versions.value[0]
</script>

<template>
  <div v-if="module && nav" class="pt-5">
    <div v-if="module" class="isolate -ml-2.5">
      <div class="block md:hidden flex items-center gap-1 font-bold mb-3">
        <UIcon v-if="module.icon" dynamic :name="module.icon" class="text-blue-500 dark:text-blue-300" />{{ module.label }}
      </div>
      <div class="flex items-center gap-4 mb-5">
        <UFormField label="Version" class="w-1/2">
          <USelectMenu v-model="version" :search-input="false" size="sm" :items="versions" class="md:w-full" />
        </UFormField>
        <UFormField label="Search" class="w-1/2">
          <UInput type="search" class="w-full" size="sm" @click="open = true">
            <template #leading>
              <UContentSearchButton size="sm" class="p-0 opacity-70 hover:opacity-100" />
            </template>
          </UInput>
        </UFormField>
      </div>
    </div>
    <nav :key="selectedFramework?.slug" aria-title="Documentation Navigation">
      <ContentNavigation as="div" class="mb-5" default-open :collapsible="false" :navigation="[{ children: nav?.top || [] }]" highlight :ui="{ linkTrailing: 'hidden', list: '-ms-4', listWithChildren: 'ms-0 border-none' }">
        <template #link-leading="{ link, active }">
          <div v-if="link.icon" class="rounded-md p-1 inline-flex ring-inset ring-1 bg-gray-100/50 dark:bg-gray-800/50 ring-gray-300 dark:ring-gray-700 group-hover:bg-primary group-hover:ring-primary group-hover:text-background" :class="active ? 'dark:bg-teal-700' : ''">
            <UIcon :name="link.icon" class="w-4 h-4 text-primary-600 dark:text-primary-200" />
          </div>
        </template>
      </ContentNavigation>
      <div class="bg-[var(--ui-border-accented)] h-[1px] my-5 mr-5" />
      <ContentNavigation as="div" default-open :collapsible="false" :navigation="nav?.bottom || []" highlight :ui="{ listWithChildren: 'sm:ml-0 mt-2' }">
        <template #link="{ link }">
          <div v-if="!link.html" class="flex items-center justify-between gap-2 w-full">
            <div class="flex items-center gap-2">
              <div :class="link.children?.length ? 'text-sm font-bold' : ''">
                {{ link.title }}
              </div>
              <UIcon v-if="link.icon" :name="link.icon" class="w-4 h-4 text-primary-600 dark:text-primary-200" />
            </div>
            <UIcon v-if="link.tag" :name="`i-logos-${link.tag}`" dynamic class="w-4 h-4" />
          </div>
          <div v-else>
            <UIcon v-if="link.icon" :name="link.icon" class="w-4 h-4 text-primary-400 dark:text-sky-200" />
            <div v-html="link.title" />
          </div>
        </template>
      </ContentNavigation>
    </nav>
    <ClientOnly>
      <LazyUContentSearch
        v-model:search-term="searchTerm"
        :files="files"
        :navigation="[{ title: 'Getting Started', _path: `/docs/${module.slug}/getting-started`, path: `/docs/${module.slug}/getting-started`, children: nav.top }, ...nav.bottom]"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>
  </div>
</template>
