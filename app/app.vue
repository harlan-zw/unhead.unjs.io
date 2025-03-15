<script setup lang="ts">
import { queryCollectionNavigation, useAsyncData } from '#imports'
import { useFrameworkSelector } from '~/composables/frameworkSelector'
import { modules } from '../const'

const appConfig = useAppConfig()
const route = useRoute()

const search = await useAsyncData(`search`, () => queryCollectionSearchSections('docsUnhead'))
const navigation = await useAsyncData(`navigation`, () => queryCollectionNavigation('docsUnhead'), {
  transform(val) {
    return val[0].children
  },
})

provide('search', search.data)
provide('navigation', navigation.data)
provide('modules', modules)

const { selectedFramework, switchFramework, frameworks } = useFrameworkSelector()
</script>

<template>
  <UApp :toaster="appConfig.toaster">
    <NuxtLoadingIndicator color="#FFF" />
    <Header />
    <div v-if="route.path.startsWith('/docs')" class="bg-blue-100/1 py-1.5 px-12">
      <div class="relative h-full flex items-center w-full">
        <div class="z-10 flex gap-2 items-center dark:text-blue-200 group-hover:text-blue-500 transition-all relative">
          <UIcon dynamic :name="selectedFramework.icon" class="w-5 h-5" />
          <div class="font-semibold">
            {{ selectedFramework.label }}
          </div>
        </div>
        <USeparator orientation="vertical" color="neutral" class="h-10 w-2 mx-3" />
        <div class="z-10 gap-1 flex text-blue-200 group-hover:text-blue-500 transition-all relative">
          <UButton v-for="framework in frameworks.filter(f => f.slug !== selectedFramework.slug)" :key="framework.slug" :title="`Switch to ${framework.label}`" :aria-label="framework.label" type="button" class="cursor-pointer transition-all " :class="[framework.slug === selectedFramework.slug ? [] : ['hover:brightness-50 brightness-120 sepia']]" variant="ghost" @click.prevent="switchFramework(framework)">
            <UIcon dynamic :name="framework.icon" class="w-5 h-5" />
          </UButton>
        </div>
      </div>
    </div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly />

    <Footer />
  </UApp>
</template>
