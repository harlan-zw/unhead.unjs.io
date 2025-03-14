<script lang="ts" setup>
import type { modules } from '../../../src/const'
import { toRefs } from 'vue'
import { useStats } from '~/composables/data'
import { humanNumber } from '~/composables/format'
import { useModule } from '~/composables/module'

const { version = true, module: _module, slug, size = 'md' } = defineProps<{
  module?: any
  slug?: typeof modules[number]['slug']
  size?: 'sm' | 'md' | 'lg'
  version?: boolean
}>()

// as refs
const propsAsRefs = toRefs(reactive({
  module: _module,
  slug,
  size,
  version,
}))

const module = _module ? propsAsRefs.module : useModule(await useStats(), propsAsRefs.slug)
</script>

<template>
  <div class="group w-full hover:shadow-[0_0_15px_5px_rgba(20,255,209,0.05)] transition-all relative min-w-[250px] inline-flex transition-all flex-col rounded-lg font-bold border bg-gradient-to-r from-yellow-700/10 to-yellow-700/20 border-red-700/20 px-2 py-2 gap-1">
    <div class="z-1 flex flex-col justify-between h-full">
      <div>
        <div class="items-center justify-between flex gap-1">
          <div class="font-mono text-sm">
            {{ module.label.replace('@unhead/typescript', 'unhead') }}
          </div>
          <UTooltip text="Downloads in last 90 days.">
            <div class="justify-end dark:text-neutral-500 text-[10px] text-neutral-700/75 inline-flex items-center gap-[2px]">
              <UIcon name="i-carbon-download" class="w-3 h-3 " />
              <div class="font-mono font-normal">
                {{ humanNumber(module.totalDownloads90) }}
              </div>
            </div>
          </UTooltip>
        </div>
        <div>
          <div class="text-xs text-(--ui-text-muted) font-normal" v-html="module.description" />
        </div>
      </div>
    </div>
  </div>
</template>
