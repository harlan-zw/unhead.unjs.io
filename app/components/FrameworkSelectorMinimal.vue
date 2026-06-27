<script setup lang="ts">
import { useFrameworkSelector } from '~/composables/frameworkSelector'

defineProps<{
  size?: 'large' | 'small'
  ignoreRedirect?: boolean
}>()
const route = useRoute()
const docsNav = useDocsNav()
const docsNavForFrameworks = computed(() => route.path.startsWith('/docs') ? docsNav.value : undefined)
const { selectedFramework, switchFramework, frameworks } = useFrameworkSelector(docsNavForFrameworks)
</script>

<template>
  <nav class="relative h-full flex items-center justify-center w-full">
    <ul class="z-10 mr-10 text-blue-200 gap-2 flex items-center justify-center group-hover:text-blue-500 transition-all relative">
      <li
        v-for="framework in frameworks"
        :key="framework.slug"
        class="transition-transform hover:scale-110 active:scale-95"
      >
        <UButton
          :title="`Switch to ${framework.label}`" :aria-label="framework.label" type="button"
          class="cursor-pointer transition-all "
          :to="!ignoreRedirect ? framework.to : undefined"
          :class="[framework.slug === selectedFramework.slug ? [] : ['grayscale opacity-40 hover:grayscale-0 hover:opacity-100 dark:opacity-50 dark:hover:opacity-100']]"
          variant="ghost" @click="switchFramework(framework)"
        >
          <UIcon dynamic :name="framework.icon" :class="!size ? 'size-10' : size === 'small' ? 'size-6' : 'size-14'" />
        </UButton>
      </li>
    </ul>
  </nav>
</template>
