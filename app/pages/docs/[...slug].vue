<script setup lang="ts">
definePageMeta({
  layout: 'docs',
})

const route = useRoute()

const [{ data: page }, { data: surround }] = await Promise.all([
  useAsyncData(`docs-${route.path}`, () => queryCollection('docsUnhead').path(route.path).first()),
  useAsyncData(`docs-${route.path}-surround`, () => queryCollectionItemSurroundings('docsUnhead', route.path, {
    fields: ['title', 'description', 'path'],
  }), {
    transform(items) {
      return items.map((m) => {
        return {
          ...m,
          _path: m.path,
        }
      })
    },
  }),
])
if (!page.value)
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

const moduleName = computed(() => {
  const subModule = route.path.split('/')[2] || ''
  if (['schema-org', 'scripts'].includes(subModule)) {
    return subModule === 'schema-org' ? 'Schema.org' : 'Scripts'
  }
  return false
})
useSeoMeta({
  title: () => (page.value?.title === moduleName.value ? '' : page.value?.title) || '',
  description: () => page.value?.description,
  titleTemplate: '%s %separator %moduleName %separator %siteName',
})

useHead({
  templateParams: {
    moduleName,
  },
})

const headline = ''
// defineOgImageComponent('Module', {
//   title: page.value?.title || '',
//   moduleName: 'Test',
//   description: page.value?.description,
// })

const repoLinks = computed(() => [
  {
    label: 'Edit this page',
    to: `https://github.com/unjs/docs/edit/main/docs/${page.value.id.split('/').slice(3).join('/')}`,
    target: '_blank',
  },
])
</script>

<template>
  <div class="max-w-[66ch] ml-auto md:ml-0 md:mr-auto">
    <UPageHeader :title="page.title" :description="page.description" :headline="headline" class="text-balance">
      <div class="mt-5">
        <TableOfContents v-if="page.body?.toc?.links?.length > 1" :links="page.body?.toc?.links" class="mt-7" />
      </div>
    </UPageHeader>

    <UPageBody prose class="pb-0">
      <Ads />
      <ContentRenderer v-if="page.body" :value="page" />
      <div class="justify-center flex items-center gap-2 font-semibold">
        <UIcon name="i-simple-icons-github" class="w-5 h-5" />
        <!--        <NuxtLink v-bind="repoLinks[0]" class="hover:underline"> -->
        <!--          {{ repoLinks[0].label }} -->
        <!--        </NuxtLink> -->
      </div>
      <FeedbackButtons :edit-link="repoLinks[0].to" />
      <USeparator v-if="surround?.length" class="my-8" />
      <UContentSurround :surround="surround" />
    </UPageBody>
  </div>
</template>
