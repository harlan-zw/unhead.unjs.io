<script setup lang="ts">
import { queryCollectionNavigation, useAsyncData } from '#imports'
import { modules } from '../const'

const { data: stats } = await useFetch('/api/stats')

const appConfig = useAppConfig()

const search = await useAsyncData(`search`, () => queryCollectionSearchSections('docsUnhead'))
const navigation = await useAsyncData(`navigation`, () => queryCollectionNavigation('docsUnhead'), {
  transform(val) {
    return val[0].children
  },
})

provide('search', search.data)
provide('navigation', navigation.data)
provide('stats', stats)
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

<style>
@import "tailwindcss";
@import "@nuxt/ui-pro";

@theme {
  --font-family-sans: 'Hubot Sans', sans-serif;
  --font-family-mono: 'Fira Code', monospace;

  --color-green-50: #EFFDF5;
  --color-green-100: #D9FBE8;
  --color-green-200: #B3F5D1;
  --color-green-300: #75EDAE;
  --color-green-400: #00DC82;
  --color-green-500: #00C16A;
  --color-green-600: #00A155;
  --color-green-700: #007F45;
  --color-green-800: #016538;
  --color-green-900: #0A5331;
  --color-green-950: #052E16;
}

.dark {
}

:root {
  --container-width: 90rem;
}

body {
  -webkit-font-smoothing: antialiased;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

p {
  text-wrap: pretty;
}

h1, h2, h3, h4, h5, h6 {
  text-wrap: balance;
}

#root, #__nuxt {
  isolation: isolate;
}

html .light .shiki span {
  color: var(--shiki-light);
  background: var(--shiki-light-bg);
  font-style: var(--shiki-light-font-style);
  font-weight: var(--shiki-light-font-weight);
  text-decoration: var(--shiki-light-text-decoration);
}

html.light .shiki span {
  color: var(--shiki-light);
  background: var(--shiki-light-bg);
  font-style: var(--shiki-light-font-style);
  font-weight: var(--shiki-light-font-weight);
  text-decoration: var(--shiki-light-text-decoration);
}

html .default .shiki span {
  color: var(--shiki-default);
  background: var(--shiki-default-bg);
  font-style: var(--shiki-default-font-style);
  font-weight: var(--shiki-default-font-weight);
  text-decoration: var(--shiki-default-text-decoration);
}

html .shiki span {
  color: var(--shiki-default);
  background: var(--shiki-default-bg);
  font-style: var(--shiki-default-font-style);
  font-weight: var(--shiki-default-font-weight);
  text-decoration: var(--shiki-default-text-decoration);
}

html .dark .shiki span {
  color: var(--shiki-dark);
  background: var(--shiki-dark-bg);
  font-style: var(--shiki-dark-font-style);
  font-weight: var(--shiki-dark-font-weight);
  text-decoration: var(--shiki-dark-text-decoration);
}

html.dark .shiki span {
  color: var(--shiki-dark) !important;
  background: var(--shiki-dark-bg);
  font-style: var(--shiki-dark-font-style);
  font-weight: var(--shiki-dark-font-weight);
  text-decoration: var(--shiki-dark-text-decoration);
}

.shiki span.line.highlight {
  background-color:
    color-mix(in oklab, var(--ui-border-muted) 75%, transparent) !important;
}
</style>
