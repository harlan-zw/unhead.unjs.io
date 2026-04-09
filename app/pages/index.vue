<script setup lang="ts">
import { ref } from 'vue'
import { stripHeaderAnchorLinks } from '~~/utils/content'
import { useStats } from '~/composables/data'
import { humanNumber } from '~/composables/format'
import { useFrameworkSelector } from '~/composables/frameworkSelector'

// Lazy-load heavy magic-move dependencies (~5,700 lines of token data + component)
const ShikiMagicMovePrecompiled = defineAsyncComponent(() =>
  import('shiki-magic-move/vue').then(m => m.ShikiMagicMovePrecompiled),
)
const MagicMoveTokens = ref<any[]>([])
const SideEffectTokens = ref<any[]>([])
if (import.meta.client) {
  import('../magic-move').then(m => MagicMoveTokens.value = m.MagicMoveTokens)
  import('../magic-move-mount').then(m => SideEffectTokens.value = m.MagicMoveTokens)
  import('shiki-magic-move/dist/style.css')
}

definePageMeta({
  breadcrumb: {
    icon: 'i-heroicons-home',
    ariaLabel: 'Home',
  },
})

const { selectedFramework } = useFrameworkSelector()
const { isBot } = useBotDetection()

// Below-fold data: lazy load for humans, skip SSR for bots
const { data: snippets } = await useAsyncData(`snippets`, async () => {
  const all = await queryCollection('snippets').all()
  if (!all?.length)
    return []
  for (const s of all) {
    if (globalThis.Array.isArray(s.body.value) && s.body.type === 'minimark')
      stripHeaderAnchorLinks(s.body.value)
  }
  return all
}, { lazy: !isBot.value, server: !isBot.value })

const stats = await useStats({ lazy: !isBot.value, server: !isBot.value })

useSeoMeta({
  title: '%siteName %separator Full stack <head> package',
  ogTitle: '%siteName %separator Full stack <head> package',
  titleTemplate: null,
})

defineOgImage('Home')

const { data: sponsors } = await useFetch('/api/github/sponsors.json', {
  lazy: !isBot.value,
  server: !isBot.value,
})

if (import.meta.server) {
  useHead({
    link: [
      {
        rel: 'dns-prefetch',
        href: 'https://avatars.githubusercontent.com',
      },
    ],
  })
}

const mounted = ref(false)

const toggleCapo = ref(false)

const [DefineSectionTemplate, ReuseSectionTemplate] = createReusableTemplate<{
  section: {
    id?: number
    icon: string
    title?: string
    htmlTitle?: string
    description: string
    bg?: string
    border?: string
  }
}, {
  wrap?: (props: any) => any
  a?: (props: any) => any
  b?: (props: any) => any
}>()

const helloUnheadTitle = `Hello <span><span class="text-[#6F42C1] dark:text-[#82AAFF]">useHead</span><span class="text-[#24292E] dark:text-[#BABED8]">()</span></span>`
</script>

<template>
  <div>
    <DefineSectionTemplate v-slot="{ section, $slots }">
      <section class="py-14 xl:py-20 px-4">
        <div class="xl:grid xl:max-w-full max-w-3xl mx-auto xl:px-0 grid-cols-6">
          <div class="col-span-1 hidden md:block pt-5 px-5 xl:p-0">
            <div class="sticky top-[300px] xl:py-10 flex xl:justify-end mr-5">
              <div class=" text-4xl font-mono flex  items-center gap-3">
                <UIcon :name="section.icon" class="w-10 h-10" />
              </div>
            </div>
          </div>
          <div class="col-span-1 relative h-full xl:py-10">
            <div class="flex items-center gap-3 sticky top-[300px]">
              <div>
                <h2 class="text-lg md:text-3xl text-balance text-highlighted leading-tight font-bold mb-3 flex items-center gap-2">
                  <UIcon :name="section.icon" class="block md:hidden size-5" />
                  <span v-if="section.htmlTitle" v-html="section.htmlTitle" />
                  <span v-else>
                    {{ section.title }}
                  </span>
                </h2>
                <div class="text-balance text-toned md:text-lg">
                  {{ section.description }}
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-3 py-5 md:py-10 2xl:px-14 xl:pl-5">
            <component :is="($slots as any).wrap || 'div'">
              <div class="xl:grid flex flex-col grid-cols-2 2xl:px-5 2xl:gap-10 gap-5">
                <div>
                  <component :is="($slots as any).a" />
                </div>
                <div>
                  <component :is="($slots as any).b" />
                </div>
              </div>
            </component>
          </div>
        </div>
      </section>
    </DefineSectionTemplate>

    <div class="gradient" />

    <section class="xl:max-w-full max-w-3xl mx-auto py-5 sm:py-12 xl:py-20">
      <UContainer class="container mx-auto">
        <NuxtLink to="/docs/releases/v3" aria-label="Unhead v3 Beta">
          <UBadge variant="outline" color="success">
            🌊 Unhead v3 is here
          </UBadge>
        </NuxtLink>
        <div class="xl:flex gap-10">
          <div class="flex flex-col justify-center">
            <h1 class="max-w-xl text-highlighted text-4xl md:text-6xl leading-[1.3] font-bold tracking-tight">
              The <span class="italic text-default">full stack</span> <span class="italic font-display text-amber-700 dark:text-primary">&lt;head&gt;</span> package for <span class="bg-green-500/10 dark:bg-green-400/15 px-2"> any framework</span>.
            </h1>
            <p class="max-w-3xl text-default mt-4 text-base md:text-xl">
              Unhead wraps your document template, improving reactive SSR JavaScript framework SEO and performance.
            </p>

            <div class="flex mb-5 items-center gap-4 mt-5 md:mt-10  justify-start">
              <UButton size="lg" :to="`/docs/${selectedFramework.slug}/head/guides/get-started/overview`" class="font-bold bg-gradient-to-r from-amber-400 to-amber-300 text-inverted hover:text-inverted/80">
                Get Started
              </UButton>
              <UButton size="lg" color="neutral" icon="i-carbon-download" variant="ghost" :to="`/docs/${selectedFramework.slug}/head/guides/get-started/installation`">
                Install Unhead
              </UButton>
            </div>
          </div>
          <div class="hidden xl:block w-1/2">
            <FrameworkSelector />
          </div>
        </div>
      </UContainer>
    </section>
    <div class="section-divider" />
    <section class="py-14 xl:py-24">
      <UContainer>
        <div class="text-center mb-14">
          <p class="text-xs font-semibold tracking-widest uppercase text-primary mb-4">
            Unhead Principles
          </p>
          <h2 class="font-bold text-3xl md:text-4xl text-highlighted">
            Why Unhead
          </h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 xl:gap-16 max-w-6xl mx-auto">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="font-mono text-sm text-dimmed">01</span>
              <div class="h-px flex-1 bg-[var(--ui-border)]" />
            </div>
            <UIcon name="i-noto-sparkles" class="size-8 mb-3" />
            <h3 class="font-bold text-lg text-highlighted mb-3">
              Complete Developer Experience
            </h3>
            <ul class="list-disc list-inside space-y-2 text-toned">
              <li>
                <NuxtLink :to="`/docs/${selectedFramework.slug}/head/api/composables/use-head`" class="underline underline-offset-4 decoration-[var(--ui-text-secondary)] hover:text-highlighted transition-colors">
                  <span class="text-[#6F42C1] dark:text-[#82AAFF]">useHead</span><span class="text-[#24292E] dark:text-[#BABED8]">()</span>
                </NuxtLink> with type narrowing, deduping, and tag merging
              </li>
              <li>
                Flat <NuxtLink :to="`/docs/${selectedFramework.slug}/head/api/composables/use-seo-meta`" class="underline underline-offset-4 decoration-[var(--ui-text-secondary)] hover:text-highlighted transition-colors">
                  <span class="text-[#6F42C1] dark:text-[#82AAFF]">useSeoMeta</span><span class="text-[#24292E] dark:text-[#BABED8]">()</span>
                </NuxtLink> for 100+ meta tags
              </li>
              <li>
                <NuxtLink :to="`/docs/${selectedFramework.slug}/head/api/composables/use-script`" class="underline underline-offset-4 decoration-[var(--ui-text-secondary)] hover:text-highlighted transition-colors">
                  <span class="text-[#6F42C1] dark:text-[#82AAFF]">useScript</span><span class="text-[#24292E] dark:text-[#BABED8]">()</span>
                </NuxtLink> for performant third party loading
              </li>
              <li>
                <NuxtLink :to="`/docs/${selectedFramework.slug}/schema-org/api/composables/use-schema-org`" class="underline underline-offset-4 decoration-[var(--ui-text-secondary)] hover:text-highlighted transition-colors">
                  <span class="text-[#6F42C1] dark:text-[#82AAFF]">useSchemaOrg</span><span class="text-[#24292E] dark:text-[#BABED8]">()</span>
                </NuxtLink> for automatic Schema.org graphs
              </li>
              <li>Plugins for tag validation, canonical URLs, and 7 more</li>
            </ul>
          </div>
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="font-mono text-sm text-dimmed">02</span>
              <div class="h-px flex-1 bg-[var(--ui-border)]" />
            </div>
            <UIcon name="i-noto-rocket" class="size-8 mb-3" />
            <h3 class="font-bold text-lg text-highlighted mb-3">
              Built for Performance
            </h3>
            <ul class="list-disc list-inside space-y-2 text-toned">
              <li>~4.4kb gzipped, tree shakable utilities</li>
              <li>Built in HTML minification</li>
              <li>
                <NuxtLink to="/releases/v3" class="underline underline-offset-4 decoration-[var(--ui-text-secondary)] hover:text-highlighted transition-colors">
                  Streaming SSR
                </NuxtLink> with head tags pushed per chunk
              </li>
              <li>
                Automatic <NuxtLink to="/learn/guides/what-is-capo" class="underline underline-offset-4 decoration-[var(--ui-text-secondary)] hover:text-highlighted transition-colors">
                  Capo.js
                </NuxtLink> head tag ordering
              </li>
            </ul>
          </div>
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span class="font-mono text-sm text-dimmed">03</span>
              <div class="h-px flex-1 bg-[var(--ui-border)]" />
            </div>
            <UIcon name="i-noto-hook" class="size-8 mb-3" />
            <h3 class="font-bold text-lg text-highlighted mb-3">
              Any Framework / Any Bundler
            </h3>
            <ul class="list-disc list-inside space-y-2 text-toned">
              <li>Vue, React, Solid.js, Svelte, and Angular</li>
              <li>Vite, Webpack, Rollup, and more</li>
              <li>
                Built in <NuxtLink to="/docs/head/guides/debugging" class="underline underline-offset-4 decoration-[var(--ui-text-secondary)] hover:text-highlighted transition-colors">
                  Vite Devtools
                </NuxtLink> integration
              </li>
              <li>Hook into every stage of head resolution</li>
            </ul>
          </div>
        </div>
      </UContainer>
    </section>
    <div class="section-divider" />
    <ReuseSectionTemplate
      :section="{
        id: 4,
        icon: 'i-noto-waving-hand',
        htmlTitle: helloUnheadTitle,
        description: 'Unhead aims to provide bullet-proof primitives for a minimal yet powerful API surface.',
        bg: 'dark:bg-green-500/5 bg-green-500/15',
        border: 'border-green-500/10 border-green-500/50',
      }"
    >
      <template #a>
        <ContentRenderer v-if="snippets?.find(d => d.id.endsWith('useHead-Titles.md'))" :value="snippets?.find(d => d.id.endsWith('useHead-Titles.md'))" />
        <ContentRenderer v-if="snippets?.find(d => d.id.endsWith('useHead-TagProps.md'))" :value="snippets?.find(d => d.id.endsWith('useHead-TagProps.md'))" />
      </template>
      <template #b>
        <ContentRenderer v-if="snippets?.find(d => d.id.endsWith('useHead-Classes.md'))" :value="snippets?.find(d => d.id.endsWith('useHead-Classes.md'))" />
      </template>
    </ReuseSectionTemplate>
    <div class="section-divider" />
    <div class="px-4 py-14 xl:py-20">
      <div class="max-w-2xl mx-auto">
        <div class="relative h-full xl:py-10">
          <div class="relative flex items-center gap-3 sticky top-[300px]">
            <div>
              <h2 class="text-lg md:text-3xl text-balance text-highlighted leading-tight font-bold mb-3 flex items-center gap-2">
                <UIcon name="i-noto-eyes" class="size-5 md:size-10" />
                Built For Reactive Lifecycles
              </h2>
              <div class="text-balance text-toned text-lg">
                All side effects are tracked so that unmounting a component will revert its head modifications and reactive
                updates can be made at any time.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="max-w-5xl mx-auto md:grid grid-cols-2">
        <div>
          <ContentRenderer v-if="snippets?.find(d => d.id.endsWith('side-effects-a.md'))" :value="snippets?.find(d => d.id.endsWith('side-effects-a.md'))" />
          <div class="flex items-center gap-2 mt-2">
            <UButton color="neutral" size="sm" @click="mounted = !mounted">
              {{ mounted ? 'Unmount' : 'Mount' }}
            </UButton>
          </div>
        </div>
        <div class=" h-full flex items-center justify-center flex-col">
          <ProsePre v-if="SideEffectTokens.length" class="prose shiki overflow-visible">
            <ShikiMagicMovePrecompiled
              animate
              :steps="SideEffectTokens"
              :step="Number(mounted)"
            />
          </ProsePre>
          <UBadge variant="outline" :color="mounted ? 'success' : 'neutral'" :label="mounted ? 'Component Mounted' : 'Component Not Mounted'" />
        </div>
      </div>
    </div>
    <div class="section-divider" />
    <ReuseSectionTemplate
      :section="{
        icon: 'i-noto-sparkles',
        title: 'Optimized SEO Tags',
        description: 'Nail your SEO with foolproof flat meta config and the simplest Schema.org you\'ve ever worked with.',
      }"
    >
      <template #a>
        <div>
          <ContentRenderer v-if="snippets?.find(d => d.id.endsWith('useSeoMeta.md'))" :value="snippets?.find(d => d.id.endsWith('useSeoMeta.md'))" />
        </div>
      </template>
      <template #b>
        <div>
          <ContentRenderer v-if="snippets?.find(d => d.id.endsWith('useSchemaOrg.md'))" :value="snippets?.find(d => d.id.endsWith('useSchemaOrg.md'))" />
        </div>
      </template>
    </ReuseSectionTemplate>
    <div class="section-divider" />
  </div>
  <div>
    <ReuseSectionTemplate
      :section="{
        id: 2,
        icon: 'i-noto-rocket',
        title: 'Making Websites Faster',
        description: 'Unhead ships to be tree shaken with client and server export paths.',
        bg: 'dark:bg-purple-500/5 bg-purple-500/15',
        border: 'border-purple-500/10 border-purple-500/50',
      }"
    >
      <template #wrap>
        <div class="max-w-2xl mx-auto">
          <ProseH3 class="font-semibold mb-3">
            Optimized Head tag ordering
          </ProseH3>
          <ProseP>
            Unhead ships with a default head tag order that is optimized for SEO and performance.
          </ProseP>
          <ProsePre v-if="MagicMoveTokens.length" class="prose  shiki">
            <ShikiMagicMovePrecompiled
              animate
              :steps="MagicMoveTokens"
              :step="Number(toggleCapo)"
            />
          </ProsePre>
          <USwitch
            unchecked-icon="i-lucide-x"
            checked-icon="i-lucide-check"
            default-value
            size="xl"
            label="Enable Capo.js"
            :model-value="toggleCapo"
            @update:model-value="toggleCapo = !toggleCapo"
          />
          <div class="flex flex-wrap gap-2 mt-4 mb-6">
            <NuxtLink to="/learn/guides/what-is-capo" aria-label="Learn about Capo.js">
              <UButton variant="soft" color="primary" trailing-icon="i-carbon-arrow-right" size="sm">
                What is Capo.js?
              </UButton>
            </NuxtLink>
            <NuxtLink to="/tools/capo-analyzer" aria-label="Try the Capo.js Analyzer">
              <UButton variant="soft" color="neutral" trailing-icon="i-carbon-arrow-right" size="sm">
                Try the Analyzer
              </UButton>
            </NuxtLink>
          </div>
          <ContentRenderer v-if="snippets?.find(d => d.id.endsWith('useScript.md'))" :value="snippets?.find(d => d.id.endsWith('useScript.md'))" />
          <ContentRenderer v-if="snippets?.find(d => d.id.endsWith('useHead-TemplateParams.md'))" :value="snippets?.find(d => d.id.endsWith('useHead-TemplateParams.md'))" />
        </div>
      </template>
    </ReuseSectionTemplate>
  </div>
  <div class="section-divider" />
  <section class="py-14 xl:py-20">
    <UContainer class="max-w-6xl">
      <div class="lg:flex gap-10 items-center justify-between">
        <div class="mb-10">
          <div class="mb-10 mx-auto max-w-[35rem] flex flex-col justify-center">
            <h2 class="font-bold text-center mb-3 md:mb-5 text-xl md:text-5xl">
              Up To Date. Always.
            </h2>
            <p class="text-default mb-5 md:mt-4 max-w-3xl text-center text-xl lg:text-left">
              Unhead was started at the end of 2022 and has received continuous bug fixes and feature improvements from the community.
            </p>
            <div class="gap-2 mx-auto text-center grid grid-cols-12">
              <span v-for="(c, index) in stats?.contributors || []" :key="index" class="inline-flex items-center justify-center shrink-0 select-none overflow-hidden rounded-full align-middle bg-[--ui-bg-elevated] size-8 text-base">
                <img class="h-full w-full rounded-[inherit] object-cover" :alt="`GitHub User ${c.login}`" height="45" width="45" loading="lazy" :src="c.avatar_url">
              </span>
            </div>
          </div>
        </div>
        <div class=" text-center justify-center gap-16 lg:mx-20 xl:mx-0 mb-10 ">
          <div class="mb-7">
            <div class="md:flex justify-center gap-10">
              <div>
                <div class="font-light justify-center flex items-center gap-3 text-6xl mb-2">
                  <UIcon name="i-carbon-commit" />
                  {{ humanNumber(stats?.commitCount) }}
                </div>
                <div class="text-sm text-muted">
                  Commits
                </div>
              </div>
              <div>
                <div class="font-light justify-center flex items-center gap-3 text-6xl mb-2">
                  <UIcon name="i-carbon-checkmark" />
                  {{ humanNumber(stats?.issuesClosed) }}
                </div>
                <div class="text-sm text-muted">
                  Issues Closed
                </div>
              </div>
            </div>
          </div>
          <div>
            <div>
              <div class="font-light text-6xl mb-2">
                <UIcon name="i-carbon-user-favorite-alt" />
                {{ humanNumber(stats?.contributors?.length) }}
              </div>
              <div class="text-sm text-muted">
                Contributors
              </div>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </section>
  <div class="section-divider" />
  <section class="py-14 xl:py-20">
    <UContainer class="container justify-around xl:flex gap-20">
      <div class="xl:flex-col items-center justify-around my-14">
        <div class="xl:max-w-sm xl:mb-0 mb-10">
          <div class="font-bold mb-5 text-5xl">
            {{ humanNumber(stats?.modules?.[0]?.averageDownloads90) }} downloads<br>
            <span class="text-primary text-3xl">per day, on average</span>
          </div>
          <p class="text-toned mb-5">
            Unhead is used and trusted by thousands of developers and companies around the world.
          </p>
        </div>
        <div class="text-6xl space-y-6 px-5 lg:px-0">
          <div class="flex justify-between text-right gap-5">
            <div class="mb-1  font-light items-center flex gap-5">
              <UIcon name="i-carbon-chart-line-smooth" class="h-15 w-15 mr-1 text-muted" />
              {{ humanNumber(stats?.modules?.[0]?.totalDownloads30) }}
            </div>
            <div class="flex items-center font-normal text-dimmed text-sm">
              Downloads<br>/ month
            </div>
          </div>
          <div class="flex justify-between gap-5">
            <div class="mb-1 font-light items-center flex gap-5">
              <UIcon name="i-carbon-star" class="h-15 w-15 mr-1 text-toned" />
              {{ stats?.stars?.stars }}
            </div>
            <div class="flex items-center font-normal text-right text-dimmed text-sm">
              Total Stars
            </div>
          </div>
        </div>
      </div>
      <ClientOnly>
        <UnheadDownloads class="rounded mx-auto max-w-[600px]  w-full h-full overflow-hidden" />
      </ClientOnly>
    </UContainer>
  </section>
  <div class="section-divider" />
  <section class="py-14 xl:py-20">
    <UContainer>
      <div class="xl:grid grid-cols-2 gap-10">
        <div class="mb-10 mx-auto max-w-lg flex flex-col  lg:items-start">
          <h2 class=" font-bold mb-3 text-5xl text-center lg:text-left">
            Funded by the community
          </h2>
          <p class="mb-5 text-default mt-4 max-w-xl text-center text-xl lg:text-left">
            Unhead is completely free and open-source due to the generous support of the community.
          </p>
          <div>
            <UButton size="lg" to="https://github.com/sponsors/harlan-zw">
              Become a sponsor
            </UButton>
          </div>
        </div>
        <div v-if="sponsors" class="max-w-xl mx-auto">
          <div class="text-2xl font-semibold mb-5">
            Top Sponsors
          </div>
          <div class="sm:grid space-y-5 md:space-y-0 grid-cols-3 gap-5 mb-10">
            <div v-for="(entry, key) in sponsors.$50" :key="key">
              <NuxtLink :to="entry.sponsor.websiteUrl" :aria-label="entry.sponsor.name" class="flex items-center gap-2">
                <img loading="lazy" :alt="entry.sponsor.name" width="56" height="56" :src="entry.sponsor.avatarUrl" class="w-14 h-14 rounded-full">
                <div>
                  <div class="font-bold text-xl whitespace-nowrap">
                    {{ entry.sponsor.name }}
                  </div>
                  <div v-if="entry.sponsor.websiteUrl" class="text-dimmed">
                    {{ entry.sponsor.websiteUrl.replace('https://', '') }}
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
          <div class="text-2xl font-semibold mb-5">
            Gold Sponsors
          </div>
          <div class="sm:grid space-y-5 md:space-y-0 grid-cols-3 gap-5 mb-10">
            <div v-for="(entry, key) in sponsors.$25" :key="key">
              <NuxtLink :to="entry.sponsor.websiteUrl" :aria-label="entry.sponsor.name || entry.sponsor.login" class="flex items-center gap-2">
                <img loading="lazy" :alt="entry.sponsor.name || entry.sponsor.login" width="48" height="48" :src="entry.sponsor.avatarUrl" class="w-12 h-12 rounded-full">
                <div>
                  <div class="font-bold text-sm whitespace-nowrap">
                    {{ entry.sponsor.name || entry.sponsor.login }}
                  </div>
                  <div v-if="entry.sponsor.websiteUrl" class="text-xs text-dimmed">
                    {{ entry.sponsor.websiteUrl.replace('https://', '') }}
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
          <div class="text-2xl font-semibold mb-5">
            Backers
          </div>
          <div class="grid grid-cols-6 sm:grid-cols-10 gap-3 mb-10">
            <div v-for="(entry, key) in sponsors.others" :key="key">
              <UTooltip :text="entry.sponsor.name || entry.sponsor.login">
                <NuxtLink :to="(entry.monthlyDollars > 5 ? entry.sponsor.websiteUrl : entry.sponsor.linkUrl) || entry.sponsor.linkUrl" :aria-label="entry.sponsor.name || entry.sponsor.login" class="flex items-center gap-2">
                  <img loading="lazy" :alt="entry.sponsor.name || entry.sponsor.login" width="48" height="48" :src="entry.sponsor.avatarUrl" class="w-12 h-12 rounded-full" :class="entry.monthlyDollars > 5 ? ['ring-green-500 ring-2'] : []">
                </NuxtLink>
              </UTooltip>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>
