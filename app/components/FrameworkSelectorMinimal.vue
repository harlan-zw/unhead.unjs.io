<script setup lang="ts">
import { useFrameworkSelector } from '~/composables/frameworkSelector'

defineProps<{
  size?: 'large' | 'small'
}>()
const docsNav = useDocsNav()
const { selectedFramework, switchFramework, frameworks } = useFrameworkSelector(docsNav)
</script>

<template>
  <div class="relative h-full flex items-center justify-center w-full">
    <div :key="selectedFramework" class="z-10 mr-10 text-blue-200 gap-2 flex items-center justify-center group-hover:text-blue-500 transition-all relative">
      <UButton v-for="framework in frameworks" :key="framework.slug" :to="framework.to" :title="`Switch to ${framework.label}`" :aria-label="framework.slug" type="button" class="cursor-pointer transition-all " :class="[framework.slug === selectedFramework.slug ? [] : ['hover:brightness-50 brightness-120 sepia-[75%]']]" variant="ghost" @click="switchFramework(framework, false)">
        <UIcon dynamic :name="framework.icon" :class="!size ? 'size-10' : size === 'small' ? 'size-6' : 'size-14'" />
      </UButton>
    </div>
  </div>
</template>
