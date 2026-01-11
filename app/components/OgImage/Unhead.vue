<script setup lang="ts">
/**
 * @credits Nuxt SEO <https://nuxtseo.com/>
 */

defineProps<{
  title?: string
  description?: string
  frameworkIcon?: string
}>()
</script>

<template>
  <div
    class="w-full h-full flex justify-between relative p-[60px] bg-zinc-900 text-zinc-50/90"
  >
    <!-- Simplified gradient overlay -->
    <div
      class="absolute inset-0"
      style="background: linear-gradient(180deg, rgba(234, 179, 8, 0.1) 0%, transparent 40%);"
    />

    <div class="h-full w-full justify-between relative flex flex-col">
      <div class="flex flex-row justify-between items-start">
        <div class="flex flex-col w-full max-w-[65%]">
          <h1 class="m-0 font-bold mb-[30px] text-[75px]">
            {{ title }}
          </h1>
          <p
            v-if="description" class="text-[35px] text-zinc-300"
          >
            {{ description }}
          </p>
        </div>
        <div v-if="frameworkIcon">
          <UIcon mode="svg" :name="frameworkIcon" class="w-25 h-25" />
        </div>
      </div>
      <div class="flex flex-row justify-end items-center text-left w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 24 24"
          class="mr-2"
        >
          <path
            stroke="#FBBF24"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            fill="transparent"
            d="M6 4v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4"
          />
        </svg>
        <p style="font-size: 35px;" class="font-bold">
          Unhead
        </p>
      </div>
    </div>
  </div>
</template>
