<script setup lang="ts">
import { motion } from 'motion-v'

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i) => {
    const delay = i * 0.3
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay, type: 'spring', duration: 1.5, bounce: 0 },
        opacity: { delay, duration: 0.01 },
      },
    }
  },
}

const shape = {
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  strokeWidth: 3,
  fill: 'transparent',
}
</script>

<template>
  <div class="flex items-center">
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      initial="hidden"
      animate="visible"
      class="mr-1"
    >
      <defs>
        <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FBBF24" />
          <stop offset="100%" style="stop-color:#f0db4f" />
        </linearGradient>
        <mask id="cutoutMask">
          <rect width="100%" height="100%" fill="white" />
          <path d="M12 32 L1 32 L15 15 Z" fill="black" />
        </mask>
      </defs>

      <!-- U shape with animation -->
      <motion.path
        stroke="url(#modernGradient)"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="3"
        d="M6 4v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4"
        mask="url(#cutoutMask)"
        :variants="draw"
        :style="shape"
      />
    </motion.svg>
    <motion.span
      v-for="(l, i) in 'Unhead'"
      :initial="{ opacity: 0, x: -5 + 1 * i }"
      :animate="{ opacity: 1, x: 0 + 1 }"
      :transition="{ delay: 0.8, duration: 0.3 + i * 0.1 }"
    >
      {{ l }}
    </motion.span>
  </div>
</template>
