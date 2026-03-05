<script setup lang="ts">
definePageMeta({
  breadcrumb: {
    icon: 'i-heroicons-wrench-screwdriver',
    ariaLabel: 'Tools',
  },
})

useSeoMeta({
  title: 'Free Head Management & SEO Tools',
  description: 'Free meta tag generator, schema.org builder, OG image creator, and head tag analyzer. Generate production-ready code with live previews.',
})

defineOgImage('NuxtSeo', {
  title: 'Free Head & SEO Tools',
  description: 'Meta tags, Schema.org, OG images, and more',
  theme: '#18181b',
})

const tools = [
  {
    title: 'Meta Tag Generator',
    description: 'Generate useSeoMeta() code with live Google SERP preview and social card previews for Twitter, Facebook, LinkedIn, and more.',
    icon: 'i-carbon-code',
    to: '/tools/meta-tag-generator',
    color: 'emerald',
    tags: ['SEO', 'Meta Tags', 'SERP Preview'],
  },
  {
    title: 'OG Image Generator',
    description: 'Design and generate beautiful Open Graph images for social sharing. Preview how your content looks across platforms.',
    icon: 'i-carbon-image',
    to: '/tools/og-image-generator',
    color: 'purple',
    tags: ['Social', 'Open Graph', 'Images'],
  },
  {
    title: 'Schema.org Generator',
    description: 'Build structured data for articles, products, FAQs, and more. Generate JSON-LD with useSchemaOrg() code output.',
    icon: 'i-carbon-data-structured',
    to: '/tools/schema-generator',
    color: 'blue',
    tags: ['Schema.org', 'JSON-LD', 'Rich Results'],
  },
  {
    title: 'Capo.js Head Analyzer',
    description: 'Analyze your HTML head tag order for optimal page load performance. Paste HTML or fetch from a URL.',
    icon: 'i-carbon-chart-evaluation',
    to: '/tools/capo-analyzer',
    color: 'cyan',
    tags: ['Performance', 'Head Order', 'Capo.js'],
  },
]
</script>

<template>
  <div class="min-h-screen">
    <section class="relative pt-12 pb-8 lg:pt-16 lg:pb-12">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-[var(--ui-text-highlighted)] mb-4">
          Head & SEO
          <span class="text-[var(--ui-text-primary)]">Tools</span>
        </h1>
        <p class="text-lg text-[var(--ui-text-muted)] max-w-2xl mx-auto">
          Free interactive tools to generate, test, and optimize your document head.
        </p>
      </div>
    </section>

    <section class="px-4 sm:px-6 lg:px-8 pb-16">
      <div class="max-w-4xl mx-auto">
        <div class="grid gap-6">
          <NuxtLink
            v-for="tool in tools"
            :key="tool.to"
            :to="tool.to"
            class="group relative p-6 rounded-2xl bg-[var(--ui-bg)] border border-[var(--ui-border)] transition-all hover:shadow-lg"
            :class="{
              'hover:border-emerald-300 dark:hover:border-emerald-700': tool.color === 'emerald',
              'hover:border-purple-300 dark:hover:border-purple-700': tool.color === 'purple',
              'hover:border-blue-300 dark:hover:border-blue-700': tool.color === 'blue',
              'hover:border-cyan-300 dark:hover:border-cyan-700': tool.color === 'cyan',
            }"
          >
            <div class="flex items-start gap-4">
              <div
                class="p-3 rounded-xl"
                :class="{
                  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400': tool.color === 'emerald',
                  'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400': tool.color === 'purple',
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400': tool.color === 'blue',
                  'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400': tool.color === 'cyan',
                }"
              >
                <UIcon :name="tool.icon" class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <h2
                  class="text-xl font-semibold mb-2 transition-colors"
                  :class="{
                    'group-hover:text-emerald-600 dark:group-hover:text-emerald-400': tool.color === 'emerald',
                    'group-hover:text-purple-600 dark:group-hover:text-purple-400': tool.color === 'purple',
                    'group-hover:text-blue-600 dark:group-hover:text-blue-400': tool.color === 'blue',
                    'group-hover:text-cyan-600 dark:group-hover:text-cyan-400': tool.color === 'cyan',
                  }"
                >
                  {{ tool.title }}
                </h2>
                <p class="text-[var(--ui-text-muted)] mb-3">
                  {{ tool.description }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in tool.tags"
                    :key="tag"
                    class="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--ui-bg-accented)] text-[var(--ui-text-muted)]"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              <UIcon
                name="i-heroicons-arrow-right"
                class="w-5 h-5 text-[var(--ui-text-dimmed)] group-hover:translate-x-1 transition-all"
                :class="{
                  'group-hover:text-emerald-500': tool.color === 'emerald',
                  'group-hover:text-purple-500': tool.color === 'purple',
                  'group-hover:text-blue-500': tool.color === 'blue',
                  'group-hover:text-cyan-500': tool.color === 'cyan',
                }"
              />
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
