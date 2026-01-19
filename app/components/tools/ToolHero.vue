<script setup lang="ts">
import { Motion } from 'motion-v'

const props = withDefaults(defineProps<{
  title: string
  description: string
  prefix?: string
  colorScheme?: 'amber' | 'blue' | 'purple' | 'green'
}>(), {
  prefix: '$ unhead tools',
  colorScheme: 'amber',
})

const colorClasses = computed(() => {
  const map: Record<typeof props.colorScheme, { gradient: string, glow: string, accent: string }> = {
    amber: {
      gradient: 'from-amber-500 via-orange-500 to-yellow-500',
      glow: 'from-amber-500/20 via-orange-500/15 to-yellow-500/10',
      accent: 'bg-amber-500',
    },
    blue: {
      gradient: 'from-blue-500 via-cyan-500 to-purple-500',
      glow: 'from-blue-500/20 via-cyan-500/15 to-purple-500/10',
      accent: 'bg-blue-500',
    },
    purple: {
      gradient: 'from-purple-500 via-pink-500 to-blue-500',
      glow: 'from-purple-500/20 via-pink-500/15 to-blue-500/10',
      accent: 'bg-purple-500',
    },
    green: {
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      glow: 'from-green-500/20 via-emerald-500/15 to-teal-500/10',
      accent: 'bg-green-500',
    },
  }
  return map[props.colorScheme]
})
</script>

<template>
  <div class="max-w-3xl mb-16 relative">
    <!-- Animated glow background -->
    <div
      class="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r rounded-3xl blur-3xl opacity-50 animate-pulse"
      style="animation-duration: 4s;"
      :class="colorClasses.glow"
    />

    <div class="relative">
      <!-- Terminal-style prefix with typing effect -->
      <Motion
        :initial="{ opacity: 0, x: -20 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }"
      >
        <div class="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-[var(--ui-bg-elevated)]/80 backdrop-blur-sm border border-[var(--ui-border)] shadow-lg shadow-black/5">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" :class="colorClasses.accent" />
            <span class="relative inline-flex rounded-full h-2 w-2" :class="colorClasses.accent" />
          </span>
          <span class="font-mono text-sm text-[var(--ui-text-muted)]">{{ prefix }}</span>
          <span class="w-2 h-4 bg-[var(--ui-text-muted)] animate-pulse" style="animation-duration: 1s;" />
        </div>
      </Motion>

      <!-- Title with gradient accent -->
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.2 }"
      >
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[var(--ui-text-highlighted)] tracking-tight">
          {{ title }}
          <span class="inline-block w-3 h-3 rounded-full ml-2 align-middle animate-bounce" style="animation-duration: 2s;" :class="colorClasses.accent" />
        </h1>
      </Motion>

      <!-- Description with refined typography -->
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.3 }"
      >
        <p class="text-lg md:text-xl text-[var(--ui-text-muted)] leading-relaxed max-w-2xl">
          {{ description }}
        </p>
      </Motion>

      <!-- Decorative line -->
      <Motion
        :initial="{ scaleX: 0 }"
        :animate="{ scaleX: 1 }"
        :transition="{ duration: 0.8, delay: 0.5 }"
        class="origin-left"
      >
        <div class="mt-8 h-px w-32 bg-gradient-to-r opacity-50" :class="colorClasses.gradient" />
      </Motion>
    </div>
  </div>
</template>
