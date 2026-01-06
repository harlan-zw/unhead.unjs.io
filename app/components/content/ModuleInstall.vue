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
  code: `<code class="language-bash shiki shiki-themes github-light github-light material-theme-palenight" language="bash"><span style="--shiki-light: #6F42C1; --shiki-default: #6F42C1; --shiki-dark: #FFCB6B;">${p.command}</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #BABED8;"> ${p.install} ${props.name}</span></code>`,
  key: p.name,
  lang: 'bash',
})))
</script>

<template>
  <div class="mb-7">
    <CodeGroup>
      <UCard v-for="(codeBlock, index) in packageManagers" :key="index" v-bind="codeBlock" class="rounded-t-none ring-neutral-200 dark:ring-neutral-700 mx-[1px]">
        <div class="bg-neutral-100 dark:bg-neutral-800 ring-neutral-300 dark:ring-neutral-700 ring rounded py-2 px-4 relative">
          <div class="absolute right-3 opacity-50 top-3 text-xs font-mono">
            bash
          </div>
          <div v-html="codeBlock.code" />
        </div>
      </UCard>
    </CodeGroup>
  </div>
</template>
