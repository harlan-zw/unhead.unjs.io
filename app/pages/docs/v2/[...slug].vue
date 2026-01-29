<script setup lang="ts">
import { setHeader } from 'h3'
import { titleCase } from 'scule'
import { getLastPathSegment, getPathSegments } from '~~/utils/urls'

definePageMeta({
  layout: 'docs',
})

const route = useRoute()

const contentPath = route.path
const { data: page } = await useAsyncData(`v2-docs-${contentPath}`, () =>
  queryCollection('docsUnheadV2').path(contentPath).first())

if (!page.value?.body?.value) {
  throw createError({ statusCode: 404, statusMessage: `Page not found: ${route.path}`, fatal: true })
}

const { data: surround } = await useAsyncData(`v2-surround-${contentPath}`, () =>
  queryCollectionItemSurroundings('docsUnheadV2', page.value!.path, {
    fields: ['title', 'description', 'path'],
  }))

const surroundMapped = computed(() => surround.value?.filter(Boolean).map(m => ({
  ...m,
  _path: m.path,
})) || [])

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
  titleTemplate: '%s %separator v2 %separator %siteName',
  // Noindex old versions per best practices
  robots: 'noindex, follow',
})

// Canonical to latest version
const canonicalPath = contentPath.replace('/docs/v2', '/docs')
useHead({
  link: [
    { rel: 'canonical', href: `https://unhead.unjs.io${canonicalPath}` },
  ],
})

// Disable OG images for v2 docs
defineOgImage(false)

// Exclude from sitemap
defineSitemapItem(false)

const headline = computed(() => titleCase(getLastPathSegment(getPathSegments(route.path, route.path.split('/').length - 2))))

const repoLinks = computed(() => [
  {
    label: 'Edit this page',
    to: `https://github.com/unjs/unhead/edit/v2.1.2/docs/${page.value!.id.split('/').slice(2).join('/')}`,
    target: '_blank',
  },
])

// allow pages to be cached for an hour
if (import.meta.server) {
  setHeader(useRequestEvent()!, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')
}
</script>

<template>
  <div v-if="page" class="max-w-[66ch] mx-auto lg:ml-0 lg:mr-auto">
    <UAlert
      title="You're viewing v2 documentation"
      description="This documentation is for Unhead v2. Check the latest v3 docs for the current version."
      color="warning"
      variant="subtle"
      class="mb-6"
      :actions="[{ label: 'View v3 docs', to: canonicalPath, variant: 'link' }]"
    />

    <UPageHeader
      :title="page.title"
      :headline="headline"
      class="text-balance pt-4"
      :ui="{ title: 'leading-normal' }"
    />

    <div class="block lg:hidden">
      <div class="mt-5 flex items-center gap-2 text-[var(--ui-text-accented)]">
        <UIcon name="i-tabler-align-left-2" class="size-4" />
        <div class="text-xs font-medium">
          On this page
        </div>
      </div>
      <div class="mt-5">
        <TableOfContents v-if="page.body?.toc?.links?.length > 1" :links="page.body?.toc?.links" class="mt-5" />
      </div>
    </div>

    <UPageBody prose class="pb-0">
      <ContentRenderer v-if="page.body" :value="page" />
      <div class="justify-center flex items-center gap-5 font-semibold">
        <div class="flex items-center gap-2">
          <UIcon name="i-simple-icons-github" class="w-5 h-5" />
          <NuxtLink v-bind="repoLinks[0]" class="hover:underline">
            {{ repoLinks[0].label }}
          </NuxtLink>
        </div>
      </div>
      <USeparator v-if="surroundMapped?.length" class="my-8" />
      <UContentSurround :surround="surroundMapped" />
    </UPageBody>
  </div>
</template>
