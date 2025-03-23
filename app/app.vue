<script setup lang="ts">
import { queryCollectionNavigation, useAsyncData } from '#imports'
import { motion } from 'motion-v'
import { ref } from 'vue'
import { modules } from '../const'

const route = useRoute()

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
