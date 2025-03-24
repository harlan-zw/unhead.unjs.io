<script lang="ts" setup>
const colorMode = useColorMode()

const src = computed(() => {
  return colorMode.value === 'dark'
    ? 'https://npm.chart.dev/embed/unhead?primary=amber&gray=stone&theme=dark'
    : 'https://npm.chart.dev/embed/unhead?primary=amber&gray=stone&theme=light'
})
</script>

<template>
  <div style="padding:56.25% 0 0 0;position:relative;min-height: 700px;">
    <ClientOnly>
      <iframe :src="src" frameborder="0" loading="lazy" allow="clipboard-write;" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="NPM Chart" />
    </ClientOnly>
  </div>
</template>
