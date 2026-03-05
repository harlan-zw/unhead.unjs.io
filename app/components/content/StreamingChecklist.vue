<script setup lang="ts">
const rules = [
  {
    title: 'Never defer SEO tags',
    description: '<title>, <meta name="description">, Open Graph, and JSON-LD must be in the initial <head>. await SEO-critical fields in your data fetchers, while deferring non-critical UI data.',
    icon: 'i-ph-warning-duotone',
    color: 'text-[var(--ui-text-error)]',
    critical: true,
  },
  {
    title: 'Block for bots, stream for users',
    description: 'Use bot detection to switch to blocking SSR for social crawlers and search bots that lack modern JS support. This ensures they see the full metadata even if the stream is slow.',
    icon: 'i-ph-robot-duotone',
    color: 'text-[var(--ui-text-accented)]',
    critical: false,
  },
  {
    title: 'Protect structured data',
    description: 'JSON-LD is the tag most commonly lost in streaming. If your rich snippets depend on async data, use tagPriority: "critical" (in Unhead) to ensure they are flushed before the head closes.',
    icon: 'i-ph-brackets-curly-duotone',
    color: 'text-[var(--ui-text-success)]',
    critical: true,
  },
]
</script>

<template>
  <div class="my-8 space-y-4 not-prose">
    <div v-for="rule in rules" :key="rule.title" class="flex items-start gap-4 p-5 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] group transition-all duration-200 hover:border-[var(--ui-border-accented)] hover:shadow-sm focus-within:border-[var(--ui-border-accented)] focus-within:shadow-sm">
      <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--ui-bg-muted)] border border-[var(--ui-border-muted)] flex items-center justify-center text-xl">
        <UIcon :name="rule.icon" :class="rule.color" class="size-5" />
      </div>
      <div>
        <h3 class="text-sm font-bold text-[var(--ui-text)] mb-1 flex items-center gap-2">
          {{ rule.title }}
          <span v-if="rule.critical" class="text-[10px] font-bold uppercase tracking-widest text-[var(--ui-text-error)] bg-[var(--ui-bg-muted)] px-1.5 py-0.5 rounded">Critical</span>
        </h3>
        <p class="text-xs text-[var(--ui-text-muted)] leading-relaxed">
          {{ rule.description }}
        </p>
      </div>
    </div>
  </div>
</template>
