<script setup lang="ts">
const route = useRoute()

const tools = [
  {
    id: 'meta-tag-generator',
    title: 'Meta Tag Generator',
    description: 'Generate useSeoMeta() code with live SERP and social card preview.',
    icon: 'i-carbon-code',
    to: '/tools/meta-tag-generator',
    color: 'amber',
  },
  {
    id: 'og-image-generator',
    title: 'OG Image Generator',
    description: 'Design and generate beautiful Open Graph images for your website.',
    icon: 'i-carbon-image',
    to: '/tools/og-image-generator',
    color: 'purple',
  },
  {
    id: 'schema-generator',
    title: 'Schema.org Generator',
    description: 'Build structured data for articles, products, and more.',
    icon: 'i-carbon-data-structured',
    to: '/tools/schema-generator',
    color: 'blue',
  },
]

const filteredTools = computed(() => {
  return tools.filter(t => t.to !== route.path)
})

const colorMap = {
  amber: 'hover:border-amber-500/40 hover:bg-amber-500/5 text-amber-500',
  purple: 'hover:border-purple-500/40 hover:bg-purple-500/5 text-purple-500',
  blue: 'hover:border-blue-500/40 hover:bg-blue-500/5 text-blue-500',
}
</script>

<template>
  <div class="mt-24 sm:mt-32">
    <div class="flex items-center gap-4 mb-8">
      <h3 class="text-sm font-bold text-[var(--ui-text-muted)] uppercase tracking-widest whitespace-nowrap">
        Discover More Tools
      </h3>
      <div class="h-px flex-1 bg-gradient-to-r from-[var(--ui-border)] to-transparent" />
    </div>

    <div class="grid md:grid-cols-2 gap-4">
      <NuxtLink
        v-for="tool in filteredTools"
        :key="tool.id"
        :to="tool.to"
        class="group p-5 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)]/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        :class="colorMap[tool.color as keyof typeof colorMap]"
      >
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-[var(--ui-bg-accented)] group-hover:bg-white dark:group-hover:bg-black transition-colors shadow-inner">
            <UIcon :name="tool.icon" class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-bold text-[var(--ui-text-highlighted)] group-hover:text-inherit transition-colors mb-1">
              {{ tool.title }}
            </h4>
            <p class="text-sm text-[var(--ui-text-muted)] leading-relaxed">
              {{ tool.description }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
