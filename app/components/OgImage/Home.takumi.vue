<script setup lang="ts">
const { frameworks } = useFrameworkSelector()
</script>

<template>
  <div
    class="w-full h-full flex flex-col items-center justify-center relative p-[60px] bg-zinc-900 text-zinc-50"
  >
    <svg
      viewBox="0 0 1440 181"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="absolute top-0 left-0 w-[1200px] opacity-40 pointer-events-none"
    >
      <path
        d="M0 0H1440V181H0V0Z"
        fill="url(#homeOgGradient)"
        fill-opacity="0.22"
      />
      <defs>
        <linearGradient id="homeOgGradient" x1="720" y1="0" x2="720" y2="181" gradientUnits="userSpaceOnUse">
          <stop stop-color="#eab308" stop-opacity="0.35" />
          <stop offset="1" stop-color="#eab308" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>

    <div class="flex flex-row items-center justify-center mb-[40px]">
      <LogoStatic width="100" height="100" />
      <p class="font-bold ml-[20px]" style="font-size: 90px;">
        Unhead
      </p>
    </div>

    <div class="flex flex-row items-baseline justify-center mb-[50px]" style="font-size: 42px; gap: 14px;">
      <span class="text-zinc-300">The</span>
      <span class="italic text-zinc-200">full stack</span>
      <span class="text-yellow-400">&lt;head&gt;</span>
      <span class="text-zinc-300">package for</span>
      <span class="text-green-300">any framework.</span>
    </div>

    <div class="flex flex-row gap-[24px] items-center justify-center">
      <UIcon
        v-for="framework in frameworks"
        :key="framework.slug"
        dynamic
        mode="svg"
        :name="framework.icon"
        class="w-[72px] h-[72px]"
      />
    </div>
  </div>
</template>
