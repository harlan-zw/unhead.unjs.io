<script setup lang="ts">
import { queryCollectionNavigation, useAsyncData } from '#imports'
import { ref } from 'vue'
import { modules } from '../const'

const appConfig = useAppConfig()
const { selectedFramework } = useFrameworkSelector()

const { data: search } = await useLazyAsyncData(`search`, () => queryCollectionSearchSections('docsUnhead'))
const { data: navigation } = await useAsyncData(`navigation`, () => queryCollectionNavigation('docsUnhead', ['new', 'deprecated']), {
  transform(val) {
    return val[0].children
  },
})

provide('search', search)
provide('navigation', navigation)
provide('modules', modules)

const searchTerm = ref('')

const searchNav = computed(() => {
  return navigation.value.filter((s) => {
    return s.path.startsWith('/docs/head') || s.path.startsWith('/docs/schema-org') || s.path.startsWith(`/docs/${selectedFramework.value}`)
  })
})
</script>

<template>
  <UApp v-if="navigation" :toaster="appConfig.toaster">
    <NuxtLoadingIndicator color="#FFF" />
    <Header />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Footer />
    <ClientOnly>
      <LazyUContentSearch
        v-model:search-term="searchTerm"
        shortcut="/"
        :files="search"
        :navigation="searchNav"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>
    <SkewNotification v-slot="{ isCurrentChunksOutdated, dismiss, reload }">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div v-if="isCurrentChunksOutdated" class="fixed bottom-4 right-4 z-50">
          <div class="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-full shadow-lg ring-1 ring-gray-200 dark:ring-gray-800 px-4 py-3">
            <span class="text-lg">✨</span>
            <div class="text-sm font-medium">
              Update available
            </div>
            <UButton color="primary" size="xs" label="Refresh" @click="reload" />
            <UButton color="gray" variant="ghost" size="xs" icon="i-heroicons-x-mark-20-solid" @click="dismiss" />
          </div>
        </div>
      </Transition>
    </SkewNotification>
  </UApp>
</template>

<style>
body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.07;
  z-index: 10;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  background-size: 100px 100px;
}
</style>
