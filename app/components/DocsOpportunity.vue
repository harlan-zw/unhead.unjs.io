<script setup lang="ts">
import type { DocsOpportunity } from '~/utils/docs-opportunities'

const { opportunity } = defineProps<{
  opportunity: DocsOpportunity
}>()
</script>

<template>
  <section class="not-prose mb-8 rounded-lg border border-default bg-elevated/50 px-5 py-4">
    <h2 class="text-base font-semibold text-highlighted">
      Implementation overview
    </h2>
    <p class="mt-2 text-sm leading-6 text-toned">
      {{ opportunity.summary }}
    </p>
    <nav class="mt-3" aria-label="Related schema documentation">
      <ul role="list" class="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <li v-for="link in opportunity.links" :key="link.to">
          <NuxtLink :to="link.to" class="font-medium text-primary underline underline-offset-4">
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </section>
</template>
