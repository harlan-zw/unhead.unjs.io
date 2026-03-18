<script setup lang="ts">
const route = useRoute()

const tools = [
  {
    id: 'meta-tag-generator',
    title: 'Meta Tag Generator',
    description: 'Generate useSeoMeta() code with live SERP and social card preview.',
    icon: 'i-carbon-code',
    to: '/tools/meta-tag-generator',
    color: 'emerald',
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
  {
    id: 'capo-analyzer',
    title: 'Capo.js Head Analyzer',
    description: 'Analyze your HTML head tag order for optimal page load performance.',
    icon: 'i-carbon-chart-evaluation',
    to: '/tools/capo-analyzer',
    color: 'cyan',
  },
]

const filteredTools = computed(() => {
  return tools.filter(t => t.to !== route.path)
})

const colorMap: Record<string, string> = {
  emerald: 'hover:border-emerald-500/40 text-emerald-500',
  purple: 'hover:border-purple-500/40 text-purple-500',
  blue: 'hover:border-blue-500/40 text-blue-500',
  cyan: 'hover:border-cyan-500/40 text-cyan-500',
}
</script>

<template>
  <div class="mt-24 sm:mt-32">
    <div class="flex items-center gap-4 mb-8">
      <h3 class="text-sm font-bold text-muted uppercase tracking-widest whitespace-nowrap">
        Discover More Tools
      </h3>
      <div class="h-px flex-1 bg-[var(--ui-border)]" />
    </div>

    <div class="grid md:grid-cols-2 gap-4">
      <NuxtLink
        v-for="tool in filteredTools"
        :key="tool.id"
        :to="tool.to"
        :aria-label="tool.title"
        class="group p-5 rounded-2xl border border-default bg-default transition-all duration-200 hover:shadow-md"
        :class="colorMap[tool.color]"
      >
        <div class="flex items-start gap-4">
          <div class="p-3 rounded-xl bg-accented">
            <UIcon :name="tool.icon" class="w-6 h-6" />
          </div>
          <div>
            <h4 class="font-bold text-highlighted group-hover:text-inherit transition-colors mb-1">
              {{ tool.title }}
            </h4>
            <p class="text-sm text-muted leading-relaxed">
              {{ tool.description }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
