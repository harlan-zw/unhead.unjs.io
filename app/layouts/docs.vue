<script lang="ts" setup>
import { useCurrentDocPage } from '~/composables/data'

const route = useRoute()

const isV2 = ref(false)
const { isV2: docIsV2 } = await useCurrentDocPage()
isV2.value = docIsV2
watch(() => route.path, async () => {
  const { isV2: docIsV2 } = await useCurrentDocPage()
  isV2.value = docIsV2
})
</script>

<template>
  <!-- V2 Banner -->
  <div v-if="isV2" class="bg-amber-500/10 border-b border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm py-2 px-4 text-center">
    <UIcon name="i-carbon-warning" class="size-4 mr-1 inline-block align-text-bottom" />
    You're viewing <strong>Unhead v2</strong> documentation.
    <NuxtLink to="/docs/typescript/head/guides/get-started/overview" class="underline ml-1">
      View latest (v3) docs →
    </NuxtLink>
  </div>
  <!-- V3 Banner -->
  <div v-else class="bg-amber-500/10 border-b border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm py-2 px-4 text-center">
    <UIcon name="i-carbon-warning" class="size-4 mr-1 inline-block align-text-bottom" />
    You're viewing <strong>Unhead v3 beta</strong> documentation.
  </div>
  <UMain class="relative mb-20 px-5">
    <svg viewBox="0 0 1440 181" fill="none" xmlns="http://www.w3.org/2000/svg" class="left-0 text-primary-300/30 dark:text-primary-900/30 pointer-events-none absolute w-full top-[1px] transition-all flex-shrink-0 opacity-100 duration-[400ms] z-20"><mask id="path-1-inside-1_414_5526" fill="white"><path d="M0 0H1440V181H0V0Z" /></mask><path d="M0 0H1440V181H0V0Z" fill="url(#paint0_linear_414_5526)" fill-opacity="0.22" /><path d="M0 2H1440V-2H0V2Z" fill="url(#paint1_linear_414_5526)" mask="url(#path-1-inside-1_414_5526)" /><defs><linearGradient id="paint0_linear_414_5526" x1="720" y1="0" x2="720" y2="181" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor" /><stop offset="1" stop-color="currentColor" stop-opacity="0" /></linearGradient><linearGradient id="paint1_linear_414_5526" x1="0" y1="90.5" x2="1440" y2="90.5" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor" stop-opacity="0" /><stop offset="0.395" stop-color="currentColor" /><stop offset="1" stop-color="currentColor" stop-opacity="0" /></linearGradient></defs></svg>
    <div class="max-w-[1400px] mx-auto lg:pt-5">
      <UPage :ui="{ left: 'lg:col-span-3 xl:col-span-2', center: 'col-span-5 lg:col-span-7 xl:col-span-8' }">
        <template #left>
          <UPageAside class="max-w-[300px] lg:max-h-[calc(100vh-150px)] pt-8">
            <DocsSidebarHeader />
          </UPageAside>
        </template>
        <div class="mx-auto pt-7">
          <slot />
        </div>
      </UPage>
    </div>
  </UMain>
</template>
