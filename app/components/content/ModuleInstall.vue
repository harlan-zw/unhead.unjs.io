<script setup lang="ts">
// credits: https://github.com/unjs/undocs
const props = defineProps({
  name: { type: String, required: true },
})

const packageManagersList = [
  { name: 'pnpm', command: 'pnpm', install: 'add' },
  { name: 'bun', command: 'bun', install: 'i' },
  { name: 'npm', command: 'npm', install: 'i' },
  { name: 'yarn', command: 'yarn', install: 'add' },
]

const packageManagers = computed(() => packageManagersList.map(p => ({
  filename: p.name,
  code: `<code class="language-bash shiki shiki-themes github-light-high-contrast github-light-high-contrast github-dark-high-contrast" language="bash"><span style="--shiki-light: #512598; --shiki-default: #512598; --shiki-dark: #FFCB6B;">${p.command}</span><span style="--shiki-light: #0E1116; --shiki-default: #0E1116; --shiki-dark: #BABED8;"> ${p.install} ${props.name}</span></code>`,
  key: p.name,
})))
</script>

<template>
  <div class="mb-7">
    <CodeGroup>
      <UCard v-for="(codeBlock, index) in packageManagers" :key="index" v-bind="codeBlock" class="rounded-t-none ring-neutral-200 dark:ring-neutral-700 mx-[1px]">
        <div class="bg-neutral-100 dark:bg-neutral-800 ring-neutral-300 dark:ring-neutral-700 ring rounded py-2 px-4 relative">
          <div class="absolute right-3 top-3 text-xs font-mono text-muted">
            bash
          </div>
          <div v-html="codeBlock.code" />
        </div>
      </UCard>
    </CodeGroup>
  </div>
</template>
