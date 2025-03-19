<script setup lang="ts">
import { setHeader } from 'h3'
import { withoutTrailingSlash } from 'ufo'
import { modifyRelativeDocLinksWithFramework, replaceImportSpecifier } from '~~/utils/content'
import { getPathSubSection, getPathWithFramework, getPathWithoutFramework } from '~~/utils/urls'

definePageMeta({
  layout: 'docs',
})

const route = useRoute()

const [{ data: page }, { data: surround }] = await Promise.all([
  useAsyncData(`docs-${route.path}`, () => queryCollection('docsUnhead')
    .where('path', 'IN', [withoutTrailingSlash(route.path), getPathWithoutFramework(route.path)])
    .first()),
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

const headline = useDocsNav().value.navFlat.find(item => item.path === getPathSubSection(route.path))?.title

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

const isDev = import.meta.dev

const transformedPage = computed(() => {
  const p = structuredClone(content.body) as any as { value: any }
  replaceImportSpecifier(p.value, '@unhead/dynamic-import', selectedFramework.value.import, !page.value.stem.includes('typescript/'))
  modifyRelativeDocLinksWithFramework(p.value, selectedFramework.value.slug)
  return p
})
</script>

<template>
  <UMain class="relative mb-20 px-5">
    <svg viewBox="0 0 1440 181" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-blue-900/30 pointer-events-none absolute max-w-full -top-px transition-all text-(--ui-primary) flex-shrink-0 duration-[400ms] opacity-20 z-20"><mask id="path-1-inside-1_414_5526" fill="white"><path d="M0 0H1440V181H0V0Z" /></mask><path d="M0 0H1440V181H0V0Z" fill="url(#paint0_linear_414_5526)" fill-opacity="0.22" /><path d="M0 2H1440V-2H0V2Z" fill="url(#paint1_linear_414_5526)" mask="url(#path-1-inside-1_414_5526)" /><defs><linearGradient id="paint0_linear_414_5526" x1="720" y1="0" x2="720" y2="181" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor" /><stop offset="1" stop-color="currentColor" stop-opacity="0" /></linearGradient><linearGradient id="paint1_linear_414_5526" x1="0" y1="90.5" x2="1440" y2="90.5" gradientUnits="userSpaceOnUse"><stop stop-color="currentColor" stop-opacity="0" /><stop offset="0.395" stop-color="currentColor" /><stop offset="1" stop-color="currentColor" stop-opacity="0" /></linearGradient></defs></svg>
    <div class="max-w-[1400px] mx-auto lg:pt-5">
      <UPage :ui="{ left: 'lg:col-span-3', right: 'lg:col-span-2 hidden lg:block', center: 'lg:col-span-5' }">
        <template #right>
          <div>
            <div class="pl-10">
              <div class="mt-5 flex items-center gap-2  text-[var(--ui-text-accented)]">
                <UIcon name="i-tabler-align-left-2" class="size-4 " />
                <div class="text-xs  font-medium">
                  On this page
                </div>
              </div>
              <div class="mt-5">
                <TableOfContents v-if="page.body?.toc?.links?.length > 1" :links="page.body?.toc?.links" class="mt-7" />
              </div>
            </div>
          </div>
        </template>
        <template #left>
          <UPageAside class="max-w-[260px] pt-5 px-5">
            <DocsSidebarHeader />
          </UPageAside>
        </template>
        <div v-if="content" class="max-w-[66ch] ml-auto md:ml-0 md:mr-auto">
          <UPageHeader
            :title="content.title" :headline="headline" class="text-balance pt-4" :links="['overview', 'intro-to-unhead'].includes(route.path.split('/').pop()) ? [
              { label: 'Copy for LLMs', to: repoLinks[1].to, icon: 'i-logos-markdown', target: '_blank' },
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
            <Ads v-if="!isDev" />
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
      </UPage>
    </div>
  </UMain>
</template>
