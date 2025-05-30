<script setup lang="ts">
import { setHeader } from 'h3'
import { titleCase } from 'scule'
import { modifyRelativeDocLinksWithFramework, replaceImportSpecifier } from '~~/utils/content'
import {
  getLastPathSegment,
  getPathSegments,
  getPathWithFramework,
  getPathWithoutFramework,
} from '~~/utils/urls'
import { useCurrentDocPage } from '~/composables/data'

definePageMeta({
  layout: 'docs',
})

const route = useRoute()

const { page, surround } = await useCurrentDocPage()

const content = page.value
if (!content)
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

useSeoMeta({
  title: () => content?.title,
  description: () => content?.description,
  titleTemplate: '%s %separator %siteName',
})

const { selectedFramework, frameworks } = useFrameworkSelector()

useHead({
  link: [{ rel: 'canonical', href: content.path }],
})

defineOgImageComponent('Unhead', {
  title: page.value?.title || '',
  description: page.value?.description,
  frameworkIcon: selectedFramework.value.icon,
  ...(page.value.ogImage || {}),
})

useHead({
  link: () => {
    const isFrameworkSpecific = content.path !== getPathWithoutFramework(content.path)
    return [
      { rel: 'canonical', href: `https://unhead.unjs.io${content.path}` },
      ...(isFrameworkSpecific
        ? frameworks.value.map((f) => {
            return {
              rel: 'alternate',
              href: `https://unhead.unjs.io/${getPathWithFramework(content.path, f.slug)}`,
              title: f.label,
            }
          })
        : []),
      // add prev and next using surround
      ...(surround.value?.length
        ? surround.value.map((s, i) => {
            return {
              rel: i === 0 ? 'prev' : 'next',
              href: `https://unhead.unjs.io/${s.path}`,
            }
          })
        : []),
    ]
  },
})

const headline = computed(() => titleCase(getLastPathSegment(getPathSegments(route.path, route.path.split('/').length - 2))))

const repoLinks = computed(() => [
  {
    label: 'Edit this page',
    to: `https://github.com/unjs/unhead/edit/main/docs/${content.id.split('/').slice(2).join('/')}`,
    target: '_blank',
  },
  {
    label: 'Markdown For LLMs',
    to: `https://raw.githubusercontent.com/unjs/unhead/refs/heads/main/docs//${content.id.split('/').slice(2).join('/')}`,
    target: '_blank',
  },
])

// allow pages to be cached for an hour
if (import.meta.server) {
  setHeader(useRequestEvent(), 'Cache-Control', 'public, max-age=3600, s-maxage=3600')
}

const transformedPage = computed(() => {
  const p = structuredClone(content.body) as any as { value: any }
  replaceImportSpecifier(p.value, {
    '@unhead/dynamic-import': selectedFramework.value.import,
    '@unhead/schema-org/@framework': selectedFramework.value.slug !== 'nuxt' ? `@unhead/schema-org/${selectedFramework.value.slug}` : '#imports',
  }, !page.value.stem.includes('typescript/'))
  modifyRelativeDocLinksWithFramework(p.value, selectedFramework.value.slug)
  return p
})
</script>

<template>
  <div v-if="content" class="max-w-[66ch] mx-auto lg:ml-0 lg:mr-auto">
    <UPageHeader
      :title="content.title" :headline="headline" class="text-balance pt-4" :links="!['overview', 'intro-to-unhead'].includes(route.path.split('/').pop()) ? [
        { label: 'Copy for LLMs', to: repoLinks[1].to, icon: 'i-catppuccin-markdown', target: '_blank' },
      ] : []"

      :ui="{ title: 'leading-normal' }"
    />

    <div class="block lg:hidden">
      <div class="mt-5 flex items-center gap-2  text-[var(--ui-text-accented)]">
        <UIcon name="i-tabler-align-left-2" class="size-4 " />
        <div class="text-xs  font-medium">
          On this page
        </div>
      </div>
      <div class="mt-5">
        <TableOfContents v-if="page.body?.toc?.links?.length > 1" :links="page.body?.toc?.links" class="mt-5" />
      </div>
    </div>

    <UPageBody prose class="pb-0">
      <ContentRenderer v-if="content.body" :value="transformedPage" />
      <div class="justify-center flex items-center gap-5 font-semibold">
        <div class="flex items-center gap-2">
          <UIcon name="i-simple-icons-github" class="w-5 h-5" />
          <NuxtLink v-bind="repoLinks[0]" class="hover:underline">
            {{ repoLinks[0].label }}
          </NuxtLink>
        </div>
        <div class="flex items-center gap-2">
          <UIcon name="i-simple-icons-markdown" class="w-5 h-5" />
          <NuxtLink v-bind="repoLinks[1]" class="hover:underline">
            {{ repoLinks[1].label }}
          </NuxtLink>
        </div>
      </div>
      <FeedbackButtons :edit-link="repoLinks[0].to" />
      <USeparator v-if="surround?.length" class="my-8" />
      <UContentSurround :surround="surround" />
    </UPageBody>
  </div>
</template>
