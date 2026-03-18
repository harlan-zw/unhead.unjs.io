<script setup lang="ts">
defineProps<{
  date: string
  dateHuman: string
  authorName: string
  authorUsername?: string
  commitMessage: string
  commitUrl?: string
}>()
</script>

<template>
  <div class="text-sm text-dimmed">
    Last updated <time class="font-semibold" :datetime="date">{{ dateHuman }}</time> by
    <UBadge color="neutral" variant="outline">
      <NuxtLink v-if="authorUsername" :to="`https://github.com/${authorUsername}`" external target="_blank" class="inline-flex items-center gap-1.5">
        <span class="hover:text-default text-muted transition">{{ authorName }}</span>
      </NuxtLink>
      <span v-else class="text-muted">{{ authorName }}</span>
    </UBadge> in
    <UBadge variant="outline" color="neutral" class="my-1">
      <NuxtLink v-if="commitUrl" :to="commitUrl" target="_blank" external class="hover:text-default text-muted transition max-w-[250px] whitespace-nowrap overflow-hidden text-ellipsis">
        {{ commitMessage }}
      </NuxtLink>
      <span v-else class="text-muted max-w-[250px] whitespace-nowrap overflow-hidden text-ellipsis">{{ commitMessage }}</span>
    </UBadge>.
  </div>
</template>
