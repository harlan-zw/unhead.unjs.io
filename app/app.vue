<script setup lang="ts">
import { queryCollectionNavigation, useAsyncData } from '#imports'
import { modules } from '../const'

const appConfig = useAppConfig()

const search = await useAsyncData(`search`, () => queryCollectionSearchSections('docsUnhead'))
const navigation = await useAsyncData(`navigation`, () => queryCollectionNavigation('docsUnhead'), {
  transform(val) {
    return val[0].children
  },
})

provide('search', search.data)
provide('navigation', navigation.data)
provide('modules', modules)
</script>

<template>
  <UApp :toaster="appConfig.toaster">
    <NuxtLoadingIndicator color="#FFF" />
    <Header />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly />

    <Footer />
  </UApp>
</template>
