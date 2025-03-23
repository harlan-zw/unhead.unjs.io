<script setup lang="ts">
import { motion } from 'motion-v'
import { useFrameworkSelector } from '~/composables/frameworkSelector'

defineProps<{
  size?: 'large' | 'small'
  ignoreRedirect?: boolean
}>()
const docsNav = useDocsNav()
const { selectedFramework, switchFramework, frameworks } = useFrameworkSelector(docsNav)
</script>

<template>
  <nav class="relative h-full flex items-center justify-center w-full">
    <ul class="z-10 mr-10 text-blue-200 gap-2 flex items-center justify-center group-hover:text-blue-500 transition-all relative">
      <motion.li
        v-for="framework in frameworks"
        :key="framework.slug"
        :while-hover="{ scale: 1.2 }"
        layout
        :transition="{
          type: 'spring',
          damping: 20,
          stiffness: 300,
          duration: 2,
        }"
        :while-press="{
          scale: selectedFramework.slug === framework.slug ? 1.2 : 0.8,
          rotate: selectedFramework.slug === framework.slug ? 1.2 : 0.8,
          transform: selectedFramework.slug === framework.slug ? 'rotate(33deg)' : 'rotate(0deg)',
        }"
      >
        <UButton
          :title="`Switch to ${framework.label}`" :aria-label="framework.label" type="button"
          class="cursor-pointer transition-all "
          :to="!ignoreRedirect ? framework.to : undefined"
          :class="[framework.slug === selectedFramework.slug ? [] : ['hover:brightness-100 hover:sepia-[10%] brightness-120 sepia-[90%]']]"
          variant="ghost" @click="switchFramework(framework)"
        >
          <UIcon dynamic :name="framework.icon" :class="!size ? 'size-10' : size === 'small' ? 'size-6' : 'size-14'" />
        </UButton>
      </motion.li>
    </ul>
  </nav>
</template>
