<script setup lang="ts">
import type { Component } from 'vue'
import type { NuxtError } from '#app'
import Fuse from 'fuse.js'
import { markRaw, ref, shallowRef } from 'vue'
import { getPathFramework, getPathWithFramework, getPathWithoutFramework } from '~~/utils/urls'
import { queryCollectionNavigation, useAsyncData } from '#imports'
import { useContentSearch } from '#ui/composables/useContentSearch'
import { modules } from '../const'

const props = defineProps<{
  error: NuxtError
}>()

const appConfig = useAppConfig()
const ContentSearchModal = shallowRef<Component | null>(null)

useSeoMeta({
  title: props.error.statusCode === 404 ? 'Page not found' : props.error.statusMessage,
  description: 'We are sorry but this page could not be found.',
})
const { selectedFramework } = useFrameworkSelector()
const { data: navigation } = await useAsyncData(`navigation`, () => queryCollectionNavigation('docsUnhead', ['new', 'deprecated']), {
  transform(val) {
    return val[0]?.children || []
  },
})
const { data: search, execute: loadSearch, status: searchStatus } = await useLazyAsyncData(`search`, () => queryCollectionSearchSections('docsUnhead'), {
  default: () => [],
  immediate: false,
  server: false,
})

provide('search', search)
const searchTerm = ref('')

const searchNav = computed(() => {
  return (navigation.value || []).filter((s) => {
    return s.path.startsWith('/docs/head') || s.path.startsWith('/docs/schema-org') || s.path.startsWith(`/docs/${selectedFramework.value}`)
  })
})

provide('navigation', navigation)
provide('modules', modules)

const recommendedLinks = ref()

async function loadContentSearchModal() {
  if (ContentSearchModal.value) {
    return
  }

  const component = await import('./components/ContentSearchModal.client.vue')
  ContentSearchModal.value = markRaw(component.default)
}

if (props.error.statusCode && import.meta.client) {
  const walkChildren = (children: any[], parents: string[] = []) => {
    return children.flatMap((item) => {
      if (item.children) {
        // If this is a parent with children, add its title to the parents array
        // and pass that to recursive calls
        const currentPath = [...parents, item.title]
        return walkChildren(item.children, currentPath)
      }
      // For leaf nodes, include the hierarchy information
      return {
        ...item,
        hierarchy: parents,
        fullTitle: [...parents, item.title].join(' -> '),
      }
    })
  }
  const childrenOnly = walkChildren(navigation.value || []).map((i) => {
    return {
      title: i.title,
      path: i.path,
      framework: getPathFramework(i.path),
      lastPathSegment: i.path.split('/').slice(-1)[0],
      hierarchy: i.hierarchy,
      fullTitle: i.fullTitle,
    }
  }).filter(f => f.framework === selectedFramework.value.slug || !f.framework)

  // do a fuse search for a page link it
  const fuse = new Fuse<{ path: string, lastPathSegment: string }>(childrenOnly, {
    keys: [
      {
        name: 'path',
        weight: 0.9,
      },
      {
        name: 'lastPathSegment',
        weight: 2,
      },
      {
        name: 'framework',
        weight: 0.5,
      },
    ],
    ignoreLocation: true,
    isCaseSensitive: false,
    includeScore: true,
  })

  const path = useRoute().path
  const lastSegment = path.split('/').slice(-1)[0]
  const explicitMatch = childrenOnly.filter(i => i.lastPathSegment === lastSegment)
  // search for last segment see if we can find 1 direct match
  if (explicitMatch?.length === 1) {
    // redirect to the found path
    await navigateTo(getPathWithFramework(getPathWithoutFramework(explicitMatch[0].path), selectedFramework.value.slug), { redirectCode: 301 })
  }
  else {
    const res = fuse.search(path, {
      limit: 3,
    })
    if (res.length) {
      const { item, score } = res[0]
      // can't be ambigious
      const matchingScore = res[1]?.score === score || res[2]?.score === score
      if (score < 0.01 && !matchingScore) {
        await navigateTo(getPathWithFramework(getPathWithoutFramework(item.path), selectedFramework.value.slug), { redirectCode: 301 })
      }
      else {
        recommendedLinks.value = res
      }
    }
  }
}

const { open: openSearch } = useContentSearch()

function openSearchShortcut(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('input, textarea, select, [contenteditable="true"]')) {
    return
  }
  if (event.key === '/' || event.code === 'Slash' || event.code === 'NumpadDivide') {
    event.preventDefault()
    openSearch.value = true
  }
}

useEventListener('keydown', openSearchShortcut)

watch(openSearch, (isOpen) => {
  if (!isOpen) {
    return
  }

  if (searchStatus.value === 'idle') {
    loadSearch()
  }

  void loadContentSearchModal()
}, { immediate: true })
</script>

<template>
  <UApp v-if="navigation" :toaster="appConfig.toaster">
    <Header />

    <UContainer>
      <UMain class="flex flex-col items-center justify-center">
        <div class="min-h-[60vh] flex gap-10 min-w-[50vw] items-center justify-center px-4 py-12 mb-15">
          <div class="w-4xl max-w-full">
            <!-- Error Title -->
            <h1 class="text-4xl font-bold  mb-4 flex items-center gap-2">
              <UIcon name="i-carbon-warning-square" class="size-15" />
              {{ error.statusCode === 404 ? 'Page Not Found' : 'Something Went Wrong' }}
            </h1>

            <!-- Error Description -->
            <p class="text-xl  text-dimmed mb-8">
              {{ error.statusCode === 404 ? 'Oops... we can\'t find that page.' : 'Uh oh, looks like an error :(' }}
            </p>

            <!-- Additional Error Message (if not 404) -->
            <div v-if="error.statusCode !== 404" class="text-red-500 mb-8 p-4 bg-red-50 rounded-lg">
              {{ error.message }}
            </div>

            <!-- Home Link -->
            <div v-else class="mb-3 text-muted">
              <div>
                <span class="">Go back</span>
                <NuxtLink
                  to="/"
                  class="text-indigo-600 font-medium hover:text-indigo-500 transition-colors duration-300 underline"
                  @click="() => clearError()"
                >
                  home
                </NuxtLink>
                <span class="">or search elsewhere.</span>
              </div>
            </div>
            <!-- Search Box -->
            <div class="w-1/2">
              <UInput
                type="search"
                class="w-full"
                placeholder="Search..."
                @click="openSearch = true"
              >
                <template #leading>
                  <UIcon name="i-heroicons-magnifying-glass" class="size-4 text-dimmed" />
                </template>
              </UInput>
            </div>
          </div>

          <!-- "Did you mean?" Section -->
          <div v-if="error.statusCode === 404" class="w-full max-w-2xl mx-auto">
            <h2 class="text-xl font-semibold  mb-4">
              Did you mean?
            </h2>

            <!-- Recommended Links -->
            <div class="bg-default border-default rounded-lg shadow-sm border  overflow-hidden">
              <nav>
                <ul class="divide-y divide-gray-100 dark:divide-neutral-800">
                  <li
                    v-for="(link, index) in recommendedLinks"
                    :key="index"
                    class="hover:bg-elevated transition-colors duration-150"
                  >
                    <NuxtLink
                      :to="getPathWithFramework(getPathWithoutFramework(link.item.path), selectedFramework.slug)"
                      :aria-label="link.item.title"
                      class="p-4 text-default hover:text-[var(--ui-text-inverse)] block"
                    >
                      <div class="text-sm text-dimmed mb-1">
                        {{ link.item.hierarchy.slice(-3).join(' > ') }}
                      </div>
                      <div class="font-medium">
                        {{ link.item.title }}
                      </div>
                      <div
                        v-if="!link.item.html" class="flex items-center justify-between gap-2 w-full"
                        :class="link.item.deprecated ? 'opacity-50' : ''"
                      >
                        <div class="flex items-center gap-2">
                          {{ link.title }}
                        </div>
                        <UIcon v-if="link.tag" :name="`i-logos-${link.tag}`" dynamclic ass="w-4 h-4" />
                      </div>
                      <div v-else :class="link.item.deprecated ? 'opacity-50' : ''">
                        <UIcon v-if="link.item.icon" :name="link.icon" class="w-4 h-4 text-(--ui-primary)-400 dark:text-sky-200" />
                        <div v-html="link.item.title" />
                      </div>
                    </NuxtLink>
                  </li>
                  <!-- Empty state if no recommended links -->
                  <li v-if="!recommendedLinks || recommendedLinks.length === 0" class="p-4 text-center text-gray-500">
                    No suggestions available
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </UMain>
    </UContainer>
    <Footer />
    <ClientOnly>
      <component
        :is="ContentSearchModal"
        v-if="openSearch && ContentSearchModal"
        v-model:search-term="searchTerm"
        :files="search"
        :navigation="searchNav"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>
  </UApp>
</template>
