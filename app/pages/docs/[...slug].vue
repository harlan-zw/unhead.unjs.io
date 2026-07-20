<script setup lang="ts">
import { setHeader } from 'h3'
import { titleCase } from 'scule'
import { modifyRelativeDocLinksWithFramework, replaceImportSpecifier } from '~~/utils/content'
import {
  getLastPathSegment,
  getPathSegments,
  getPathWithoutFramework,
} from '~~/utils/urls'
import { useCurrentDocPage } from '~/composables/data'

definePageMeta({
  layout: 'docs',
})

const route = useRoute()

const { page, surround, lastCommit, isV2 } = await useCurrentDocPage()
if (!page?.value?.id) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { selectedFramework } = useFrameworkSelector()

// Content-authored framework pages are distinct implementation guides and keep
// their own canonical. Framework-prefixed fallbacks resolve to the shared
// content path, so they consolidate on that framework-neutral source instead.
const isFrameworkSpecific = computed(() => page.value.path !== getPathWithoutFramework(page.value.path))
const seoTitle = computed(() => {
  const title = page.value?.title || ''
  if (!isFrameworkSpecific.value || title.toLocaleLowerCase().includes(selectedFramework.value.label.toLocaleLowerCase())) {
    return title
  }
  return `${title} for ${selectedFramework.value.label}`
})
const canonicalUrl = computed(() => `https://unhead.unjs.io${page.value.path}`)

useSeoMeta({
  title: seoTitle,
  description: () => page.value?.description,
  ogUrl: () => isV2 ? undefined : canonicalUrl.value,
  titleTemplate: isV2 ? '%s %separator v2 %separator %siteName' : '%s %separator %siteName',
})

// Keep legacy docs available to users without competing with current docs.
// Do not combine noindex with a cross-version canonical: some v2 pages have no
// equivalent in v3, and Google recommends choosing one signal or the other.
if (isV2) {
  useRobotsRule({ noindex: true, follow: true })
  defineOgImage(false as any)
}
else {
  defineOgImage('Unhead', {
    title: seoTitle.value,
    description: page.value?.description,
    frameworkIcon: selectedFramework.value.icon,
    ...(page.value.ogImage || {}),
  })
}

useHead({
  link: () => [
    ...(!isV2
      ? [{ rel: 'canonical', href: canonicalUrl.value }]
      : []),
    // add prev and next using surround
    ...(surround.value?.length
      ? surround.value.map((s, i) => {
          return {
            rel: i === 0 ? 'prev' : 'next',
            href: `https://unhead.unjs.io${s.path}`,
          }
        })
      : []),
  ],
})

const headline = computed(() => titleCase(getLastPathSegment(getPathSegments(route.path, route.path.split('/').length - 2))))

const gitBranch = isV2 ? 'v2.1.2' : 'main'
const repoLinks = computed(() => [
  {
    label: 'Edit this page',
    to: `https://github.com/unjs/unhead/edit/${gitBranch}/docs/${page.value.id.split('/').slice(2).join('/')}`,
    target: '_blank',
  },
  ...(!isV2
    ? [{
        label: 'Markdown For LLMs',
        to: `https://raw.githubusercontent.com/unjs/unhead/refs/heads/main/docs/${page.value.id.split('/').slice(2).join('/')}`,
        target: '_blank',
      }]
    : []),
])

// allow pages to be cached for an hour
if (import.meta.server) {
  setHeader(useRequestEvent(), 'Cache-Control', 'public, max-age=3600, s-maxage=3600')
}

const transformedPage = computed(() => {
  const p = JSON.parse(JSON.stringify(page.value.body)) as any as { value: any }
  replaceImportSpecifier(p.value, {
    '@unhead/dynamic-import': selectedFramework.value.import,
    '@unhead/schema-org/@framework': selectedFramework.value.slug !== 'nuxt' ? `@unhead/schema-org/${selectedFramework.value.slug}` : '#imports',
  }, !page.value.stem.includes('typescript/'))
  modifyRelativeDocLinksWithFramework(p.value, selectedFramework.value.slug)
  return p
})
</script>

<template>
  <div v-if="page" class="flex justify-between w-full">
    <div class="xl:mx-auto w-full max-w-[66ch]">
      <UPageHeader
        :title="page.title" :headline="headline" class="text-balance pt-4" :links="!isV2 && !['overview', 'intro-to-unhead'].includes(route.path.split('/').pop()) ? [
          { label: 'Copy for LLMs', to: repoLinks[1]?.to, icon: 'i-catppuccin-markdown', target: '_blank' },
        ] : []"
        :ui="{ title: 'leading-normal' }"
      >
        <div class="mt-3">
          <DocsCommitMeta
            v-if="lastCommit"
            :date="lastCommit.date"
            :date-human="lastCommit.dateHuman"
            :author-name="lastCommit.author.name"
            :author-username="lastCommit.author.committer"
            :commit-message="lastCommit.message"
            :commit-url="lastCommit.url"
          />
          <div v-else class="flex items-center gap-1.5 text-sm">
            <USkeleton class="h-4 w-[280px]" />
            <USkeleton class="h-5 w-[100px] rounded-md" />
            <USkeleton class="h-4 w-[16px]" />
            <USkeleton class="h-5 w-[140px] rounded-md" />
          </div>
        </div>
      </UPageHeader>

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
        <ContentRenderer v-if="page.body" :value="transformedPage" />
        <div class="justify-center flex items-center gap-5 font-semibold">
          <div class="flex items-center gap-2">
            <UIcon name="i-simple-icons-github" class="w-5 h-5" />
            <NuxtLink :to="repoLinks[0].to" :target="repoLinks[0].target" :aria-label="repoLinks[0].label" class="hover:underline">
              {{ repoLinks[0].label }}
            </NuxtLink>
          </div>
          <div v-if="repoLinks[1]" class="flex items-center gap-2">
            <UIcon name="i-simple-icons-markdown" class="w-5 h-5" />
            <NuxtLink :to="repoLinks[1].to" :target="repoLinks[1].target" :aria-label="repoLinks[1].label" class="hover:underline">
              {{ repoLinks[1].label }}
            </NuxtLink>
          </div>
        </div>
        <FeedbackButtons :edit-link="repoLinks[0].to" />
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
