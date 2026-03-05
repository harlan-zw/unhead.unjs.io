<script setup lang="ts">
const props = withDefaults(defineProps<{
  colorScheme?: 'amber' | 'blue' | 'purple' | 'green' | 'cyan'
}>(), {
  colorScheme: 'amber',
})

const orbClasses = computed(() => {
  const map: Record<typeof props.colorScheme, { primary: string, secondary: string, accent: string }> = {
    amber: {
      primary: 'from-amber-500/15 via-orange-500/10 to-transparent',
      secondary: 'from-yellow-500/10 via-amber-500/8 to-transparent',
      accent: 'from-orange-400/12 to-transparent',
    },
    blue: {
      primary: 'from-blue-500/15 via-purple-500/10 to-transparent',
      secondary: 'from-cyan-500/10 via-blue-500/8 to-transparent',
      accent: 'from-indigo-400/12 to-transparent',
    },
    purple: {
      primary: 'from-purple-500/15 via-pink-500/10 to-transparent',
      secondary: 'from-blue-500/10 via-purple-500/8 to-transparent',
      accent: 'from-fuchsia-400/12 to-transparent',
    },
    green: {
      primary: 'from-green-500/15 via-emerald-500/10 to-transparent',
      secondary: 'from-teal-500/10 via-green-500/8 to-transparent',
      accent: 'from-emerald-400/12 to-transparent',
    },
    cyan: {
      primary: 'from-cyan-500/15 via-blue-500/10 to-transparent',
      secondary: 'from-teal-500/10 via-cyan-500/8 to-transparent',
      accent: 'from-sky-400/12 to-transparent',
    },
  }
  return map[props.colorScheme]
})
</script>

<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- Noise texture overlay -->
    <div
      class="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none mix-blend-overlay"
      style="background-image: url('data:image/svg+xml,%3Csvg viewBox=&quot;0 0 256 256&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cfilter id=&quot;noise&quot;%3E%3CfeTurbulence type=&quot;fractalNoise&quot; baseFrequency=&quot;0.9&quot; numOctaves=&quot;4&quot; stitchTiles=&quot;stitch&quot;/%3E%3C/filter%3E%3Crect width=&quot;100%25&quot; height=&quot;100%25&quot; filter=&quot;url(%23noise)&quot;/%3E%3C/svg%3E');"
    />

    <!-- Animated gradient mesh background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Primary orb - top right, larger and more prominent -->
      <div
        class="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[100px] bg-gradient-to-br animate-pulse"
        style="animation-duration: 8s;"
        :class="orbClasses.primary"
      />
      <!-- Secondary orb - left side -->
      <div
        class="absolute top-1/4 -left-48 w-[400px] h-[400px] rounded-full blur-[80px] bg-gradient-to-tr animate-pulse"
        style="animation-duration: 12s; animation-delay: 2s;"
        :class="orbClasses.secondary"
      />
      <!-- Accent orb - bottom center -->
      <div
        class="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[120px] bg-gradient-to-t animate-pulse"
        style="animation-duration: 10s; animation-delay: 4s;"
        :class="orbClasses.accent"
      />
    </div>

    <!-- Subtle grid pattern -->
    <div
      class="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.04]"
      style="background-image: linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px); background-size: 64px 64px;"
    />

    <UContainer class="py-16 md:py-24 relative">
      <slot />
    </UContainer>
  </div>
</template>
