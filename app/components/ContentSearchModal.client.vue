<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

interface ContentSearchFile {
  id: string
  title: string
  titles: string[]
  level: number
  content: string
}

defineProps<{
  files: ContentSearchFile[]
  navigation: ContentNavigationItem[]
  fuse?: any
  shortcut?: string
}>()

const searchTerm = defineModel<string>('searchTerm', { default: '' })
</script>

<template>
  <UContentSearch
    v-model:search-term="searchTerm"
    :shortcut="shortcut"
    :files="files"
    :navigation="navigation"
    :fuse="fuse"
  />
</template>
