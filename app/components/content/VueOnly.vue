<script lang="ts" setup>
const { selectedFramework } = useFrameworkSelector()
</script>
<template>
<div v-if="['vue', 'nuxt'].includes(selectedFramework.slug)">
  <slot />
</div>
</template>
