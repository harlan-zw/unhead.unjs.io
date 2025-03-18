<script setup lang="ts">
import { useFrameworkSelector } from '~/composables/frameworkSelector'

const { selectedFramework, frameworks } = useFrameworkSelector()
</script>

<template>
  <div class="relative h-full flex items-center justify-center w-full">
    <div class="z-10 mr-10 text-blue-200 grid grid-cols-3 gap-7 items-center justify-center group-hover:text-blue-500 transition-all relative">
      <UButton v-for="framework in frameworks" :key="framework.slug" :to="`/docs/${framework.slug}/head/guides/get-started/installation`" type="button" class="cursor-pointer transition-all " :class="[framework.slug === selectedFramework.slug ? [] : ['hover:brightness-50 brightness-120 sepia']]" variant="ghost">
        <UIcon dynamic :name="framework.icon" class="w-20 h-20" />
      </UButton>
    </div>
  </div>
</template>
