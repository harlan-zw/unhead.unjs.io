<script setup lang="ts">
definePageMeta({
  layout: 'article-simple',
})

const route = useRoute()

const { data: page } = await useAsyncData(`root-${route.path}`, () => queryCollection('root').path(route.path).first())
if (!page.value)
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

useSeoMeta({
  title: () => page.value?.title || '',
  description: () => page.value?.description,
})

defineOgImageComponent(page.value.ogImageComponent || 'NuxtSeo', {
  title: page.value?.title || '',
  description: page.value?.description,
  colorMode: 'dark',
})

// Technical SEO for an blog article
const articlePublishedTime = `${page.value.publishedAt}T12:00:00Z`
const articleModifiedTime = `${page.value.updatedAt}T12:00:00Z`

const humanPublishedDate = new Date(page.value.publishedAt).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

useSeoMeta({
  ogType: 'article',
  author: 'Harlan Wilton',
  articleAuthor: ['Harlan Wilton'],
  articlePublishedTime,
  articleModifiedTime,
  twitterData1: 'Harlan Wilton',
  twitterLabel1: 'Author',
  twitterData2: page.value.readTime,
  twitterLabel2: 'Read Time',
})

useSchemaOrg([
  definePerson({
    '@id': '#author',
    'name': 'Harlan Wilton',
    'description': 'An open-source developer from  Sydney, Australia. Core team member of  Nuxt,  VueUse and  UnJS. Author of Unlighthouse, Unhead and Nuxt SEO.',
    'sameAs': [
      'https://twitter.com/harlan_zw',
      'https://github.com/harlan-zw',
    ],
    'url': 'https://harlanzw.com',
  }),
  defineArticle({
    author: { '@id': '#author' },
    datePublished: articlePublishedTime,
    dateModified: articleModifiedTime,
  }),
])
</script>

<template>
  <div class="mx-auto px-5 lg:pt-20 max-w-[80ch]">
    <UPageHeader :title="page.title" :ui="{ title: 'text-center text-balance xl:leading-normal min-w-full', description: 'text-center ' }">
      <div class="flex md:flex-row flex-col justify-center gap-3 md:gap-5 mt-5">
        <div class="flex items-center gap-2 dark:text-neutral-300">
          <NuxtLink external target="_blank" to="https://bsky.app/" class="hover:underline inline-flex items-center gap-2">
            <img alt="Harlan Wilton" src="https://avatars.githubusercontent.com/u/5326365?v=4" class="w-6 h-6 rounded-full">
            Harlan Wilton
          </NuxtLink>
        </div>
        <div class="flex flex-row gap-5">
          <span v-if="page.readTime" class="font-semibold text-(--ui-text-muted)">{{ page.readTime }} read</span>
          <div>
            <div class="flex justify-between">
              <div v-if="page.publishedAt" class="text-(--ui-text-muted)">
                Published
                <time :datetime="page.publishedAt">{{ humanPublishedDate }}</time>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UPageHeader>
  </div>
  <div class="mx-auto px-5 max-w-[66ch]">
    <UPageBody prose class="pb-0">
      <ContentRenderer v-if="page.body" :value="page" />
    </UPageBody>
  </div>
</template>
