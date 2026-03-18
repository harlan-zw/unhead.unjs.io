<script setup lang="ts">
const strategies = [
  {
    name: 'Block + Stream',
    icon: 'i-ph-shield-check-duotone',
    description: 'Block for bots, stream for users. Best of both worlds.',
    pros: ['Fast User TTFB', 'Complete Bot Heads', 'Social Cards Work'],
    cons: ['UA detection dependency', 'Unlisted bots miss out'],
  },
  {
    name: 'Blocking',
    icon: 'i-ph-lock-duotone',
    description: 'Wait for all data before sending any HTML.',
    pros: ['100% SEO Correct', 'No Layout Shift', 'Zero "Zombie" State'],
    cons: ['Slower TTFB', 'No streaming benefit'],
  },
  {
    name: 'First-Flush',
    icon: 'i-ph-lightning-duotone',
    description: 'Send head immediately. Late data is ignored by server.',
    pros: ['Fastest TTFB', 'Early CSS Unblocking'],
    cons: ['High SEO Risk', 'Broken Social Cards'],
  },
  {
    name: 'Patcher',
    icon: 'i-ph-magic-wand-duotone',
    description: 'Stream JS scripts to update the head client-side.',
    pros: ['Fast perceived speed', 'Dynamic updates'],
    cons: ['Zombie Head state', 'JS dependency', 'Scraper gaps'],
  },
]
</script>

<template>
  <div class="my-8 overflow-hidden rounded-xl border border-default bg-elevated not-prose">
    <div class="grid grid-cols-1 divide-y divide-[var(--ui-border-muted)] md:grid-cols-4 md:divide-x md:divide-y-0">
      <div v-for="strategy in strategies" :key="strategy.name" class="p-5 flex flex-col">
        <div class="mb-4">
          <div class="inline-flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1 text-xs font-bold text-[var(--ui-text-accented)] uppercase tracking-wider">
            <UIcon :name="strategy.icon" class="size-4" />
            {{ strategy.name }}
          </div>
          <p class="mt-2 text-xs text-dimmed leading-relaxed">
            {{ strategy.description }}
          </p>
        </div>

        <div class="space-y-4 mt-auto">
          <div>
            <div class="text-[10px] font-bold uppercase text-[var(--ui-text-success)] mb-1.5 opacity-80">
              Pros
            </div>
            <ul class="space-y-1">
              <li v-for="pro in strategy.pros" :key="pro" class="text-xs text-muted flex items-start gap-1.5">
                <span class="text-[var(--ui-text-success)] mt-0.5" aria-hidden="true">✓</span>
                <span class="sr-only">Pro:</span>
                {{ pro }}
              </li>
            </ul>
          </div>
          <div>
            <div class="text-[10px] font-bold uppercase text-[var(--ui-text-error)] mb-1.5 opacity-80">
              Cons
            </div>
            <ul class="space-y-1">
              <li v-for="con in strategy.cons" :key="con" class="text-xs text-muted flex items-start gap-1.5">
                <span class="text-[var(--ui-text-error)] mt-0.5 text-[10px]" aria-hidden="true">✕</span>
                <span class="sr-only">Con:</span>
                {{ con }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
