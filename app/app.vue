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
    <Header class="mb-12" />
    <NuxtPage />
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
  </UApp>
</template>
