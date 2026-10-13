<script setup lang="ts">
/**
 * @credits Nuxt SEO <https://nuxtseo.com/>
 */

const props = defineProps<{
  title?: string
  description?: string
  frameworkIcon?: string
}>()

// Tool and learn titles run past 40 characters. At 78px a long title pushes
// the footer off the card, so the title steps down by length.
const titleFontSize = computed(() => {
  const length = props.title?.length ?? 0
  return length > 60 ? 52 : length > 36 ? 64 : 78
})
</script>

<template>
  <div
    class="w-full h-full flex flex-col justify-between relative p-[60px] bg-zinc-900 text-zinc-50"
  >
    <svg
      viewBox="0 0 1440 181"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="absolute top-0 left-0 w-[1200px] opacity-50 pointer-events-none"
    >
      <path
        d="M0 0H1440V181H0V0Z"
        fill="url(#docsOgGradient)"
        fill-opacity="0.3"
      />
      <defs>
        <linearGradient id="docsOgGradient" x1="720" y1="0" x2="720" y2="181" gradientUnits="userSpaceOnUse">
          <stop stop-color="#eab308" stop-opacity="0.3" />
          <stop offset="1" stop-color="#eab308" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>

    <div class="flex flex-row justify-between items-start w-full">
      <div class="flex flex-col" style="max-width: 820px;">
        <h1 class="m-0 font-bold text-zinc-50" :style="{ fontSize: `${titleFontSize}px`, lineHeight: 1.05, marginBottom: '28px' }">
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="text-zinc-300 m-0"
          style="font-size: 30px; line-height: 1.35;"
        >
          {{ description }}
        </p>
      </div>
      <div
        v-if="frameworkIcon"
        class="flex items-center justify-center rounded-[24px] bg-zinc-800"
        style="width: 140px; height: 140px; border: 2px solid rgba(234, 179, 8, 0.35);"
      >
        <UIcon mode="svg" :name="frameworkIcon" style="width: 90px; height: 90px;" />
      </div>
    </div>

    <div class="flex flex-row items-center">
      <LogoStatic width="52" height="52" />
      <p class="font-bold ml-[12px]" style="font-size: 42px;">
        Unhead
      </p>
      <div class="ml-[20px] text-zinc-500" style="font-size: 28px;">
        unhead.unjs.io
      </div>
    </div>
  </div>
</template>
