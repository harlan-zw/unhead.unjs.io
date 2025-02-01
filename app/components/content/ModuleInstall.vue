<script setup lang="ts">
// credits: https://github.com/unjs/undocs
const props = defineProps({
  name: { type: String, required: true },
})

const { data: packageManagers } = await useAsyncData(`module-install-${props.name}`, async () => {
  return await Promise.all([
    { name: 'pnpm', command: 'pnpm', install: 'add', run: '', x: 'pnpm dlx ' },
    { name: 'bun', command: 'bun', install: 'i', run: 'run ', x: 'bunx ' },
    { name: 'npm', command: 'npm', install: 'i', run: 'run ', x: 'npx ' },
    { name: 'yarn', command: 'yarn', install: 'add', run: '', x: 'yarn dlx ' },
  ].map(async pm => ({
    filename: pm.name,
    code: `<code class="language-bash shiki shiki-themes github-light github-light material-theme-palenight" language="bash"><span style="--shiki-light: #6F42C1; --shiki-default: #6F42C1; --shiki-dark: #FFCB6B;">${pm.command}</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #BABED8;"> ${pm.install} ${props.name}</span></code>`,
    key: pm.name,
    lang: 'bash',
  })))
})
</script>

<template>
  <div class="mb-12">
    <CodeGroup>
      <UCard v-for="(codeBlock, index) in packageManagers" :key="index" v-bind="codeBlock" class="rounded-t-none ring-gray-200 dark:ring-gray-700 mx-[1px]">
        <div class="mb-7 bg-gray-100 dark:bg-gray-800 ring-gray-300 dark:ring-gray-700 ring rounded py-2 px-4 relative">
          <div class="absolute right-3 opacity-50 top-3 text-xs font-mono">
            bash
          </div>
          <div v-html="codeBlock.code" />
        </div>
      </UCard>
    </CodeGroup>
  </div>
</template>
