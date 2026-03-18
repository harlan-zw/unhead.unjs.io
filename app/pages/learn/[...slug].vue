<script lang="ts" setup>
definePageMeta({
  layout: 'learn',
})

const route = useRoute()

const { data: page } = await useAsyncData(`learn-${route.path}`, () => {
  return queryCollection('learn').path(route.path).first()
})

if (!page.value)
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })

const { data: surround } = await useAsyncData(`learn-surround-${route.path}`, () => {
  return queryCollectionItemSurroundings('learn', route.path)
})

const categoryConfig = {
  research: {
    label: 'Research',
    icon: 'i-ph-flask-duotone',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  guides: {
    label: 'Guide',
    icon: 'i-ph-book-open-duotone',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
}

const category = computed(() => {
  const segment = route.path.split('/')[2] as keyof typeof categoryConfig
  return categoryConfig[segment] || categoryConfig.guides
})

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
})

const articlePublishedTime = toISODateTime(page.value.publishedAt)
const articleModifiedTime = toISODateTime(page.value.updatedAt)

useSeoMeta({
  ogType: 'article',
  author: 'Harlan Wilton',
  articleAuthor: ['Harlan Wilton'],
  articleSection: category.value.label,
  articleTag: page.value.keywords,
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
    'description': 'An open-source developer from Sydney, Australia. Core team member of Nuxt, VueUse and UnJS. Author of Unlighthouse, Unhead and Nuxt SEO.',
    'sameAs': [
      'https://twitter.com/harlan_zw',
      'https://github.com/harlan-zw',
    ],
    'url': 'https://harlanzw.com',
  }),
  defineArticle({
    author: { '@id': '#author' },
    keywords: page.value.keywords,
    ...(articlePublishedTime && { datePublished: articlePublishedTime }),
    ...(articleModifiedTime && { dateModified: articleModifiedTime }),
    articleSection: [category.value.label],
  }),
])

const humanPublishedDate = computed(() => formatArticleDate(page.value?.publishedAt, 'short'))
const humanUpdatedDate = computed(() => formatArticleDate(page.value?.updatedAt, 'short'))

const filePath = computed(() => page.value?.id?.replace('learn/', '') || '')
const editLink = computed(() => `https://github.com/harlan-zw/unhead.unjs.io/edit/main/content/learn/${filePath.value}`)

const { data: lastCommit } = await useAsyncData(`learn-commit-${route.path}`, () => {
  if (!filePath.value)
    return null
  return $fetch(`/api/github/harlan-zw@unhead.unjs.io/last-file-commit?file=content/learn/${filePath.value}`)
    .catch(() => null)
})
</script>

<template>
  <div v-if="page" class="flex justify-between w-full">
    <div class="xl:mx-auto w-full max-w-[66ch]">
      <UPageHeader
        :title="page.title"
        class="text-balance pt-4"
        :ui="{ title: 'leading-normal' }"
      >
        <template #headline>
          <div class="flex items-center gap-2.5">
            <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              <UIcon :name="category.icon" class="size-3.5" :class="category.iconColor" />
              {{ category.label }}
            </span>
            <span v-if="page.readTime" class="text-xs text-dimmed">
              {{ page.readTime }} read
            </span>
          </div>
        </template>

        <div class="flex items-center gap-3 mt-3 text-sm text-dimmed flex-wrap">
          <UBadge color="neutral" variant="outline">
            <NuxtLink to="https://x.com/harlan-zw" external target="_blank" class="inline-flex items-center gap-1.5">
              <img alt="Harlan Wilton" src="https://avatars.githubusercontent.com/u/5326365?v=4" class="w-4 h-4 rounded-full">
              <span class="hover:text-default text-muted transition">Harlan Wilton</span>
            </NuxtLink>
          </UBadge>
          <span v-if="page.publishedAt">
            Published <time class="font-semibold" :datetime="page.publishedAt">{{ humanPublishedDate }}</time>
          </span>
          <span v-if="page.updatedAt && page.updatedAt !== page.publishedAt">
            Updated <time class="font-semibold" :datetime="page.updatedAt">{{ humanUpdatedDate }}</time>
          </span>
        </div>

        <div v-if="lastCommit" class="mt-3">
          <DocsCommitMeta
            :date="lastCommit.date"
            :date-human="lastCommit.dateHuman"
            :author-name="lastCommit.author.name"
            :author-username="lastCommit.author.committer"
            :commit-message="lastCommit.message"
            :commit-url="lastCommit.url"
          />
        </div>
      </UPageHeader>

      <div v-if="page.image" class="relative mt-8 mb-2 group">
        <div class="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[var(--ui-border-accented)] to-transparent opacity-60" />
        <img
          :src="page.image"
          :alt="page.title"
          fetchpriority="high"
          loading="eager"
          decoding="async"
          class="relative w-full rounded-xl object-cover shadow-lg ring-1 ring-[var(--ui-border)] max-h-[380px]"
        >
      </div>

      <div class="block xl:hidden">
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
        <FeedbackButtons :edit-link="editLink" />
        <USeparator v-if="surround?.length" class="my-8" />
        <UContentSurround :surround="surround" />
      </UPageBody>
    </div>

    <div class="hidden xl:block max-w-75 w-full">
      <div class="pt-11 pl-10 gap-5 flex flex-col">
        <div v-if="page?.body?.toc?.links?.length > 1">
          <div class="flex items-center gap-2 text-[var(--ui-text-accented)]">
            <UIcon name="i-tabler-align-left-2" class="size-4" />
            <div class="text-xs font-medium">
              On this page
            </div>
          </div>
          <div class="my-5">
            <TableOfContents :links="page.body.toc.links" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
