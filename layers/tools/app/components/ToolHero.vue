<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <section class="max-w-3xl mb-12">
    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.1] text-highlighted mb-3">
      {{ title }}
    </h1>
    <p class="text-sm sm:text-base text-muted max-w-2xl">
      {{ description }}
    </p>
  </section>
</template>
