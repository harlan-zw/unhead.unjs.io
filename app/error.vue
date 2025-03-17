<script setup lang="ts">
import type { NuxtError } from '#app'
import { queryCollectionNavigation, useAsyncData } from '#imports'
import { modules } from '../const'

defineProps<{
  error: NuxtError
}>()

useSeoMeta({
  title: 'Page not found',
  description: 'We are sorry but this page could not be found.',
})
const { data: navigation } = await useAsyncData(`navigation`, () => queryCollectionNavigation('docsUnhead', ['new', 'deprecated']), {
  transform(val) {
    return val[0].children
  },
})

provide('navigation', navigation)
provide('modules', modules)
</script>

<template>
  <div>
    <Header />

    <UContainer>
      <UMain class="flex flex-col items-center justify-center">
        <div class="mb-14">
          <h1>{{ error.statusCode === 404 ? 'Oops... we can\'t find that.' : 'Uh oh, looks like an error :(' }}</h1>
          <div v-if="error.statusCode !== 404">
            {{ error.message }}
          </div>
          <div v-else>
            Go back <NuxtLink to="/" class="underline">
              home
            </NuxtLink>.
          </div>
        </div>
      </UMain>
    </UContainer>
  </div>
</template>
