<script setup lang="ts">
import { ShikiMagicMovePrecompiled } from 'shiki-magic-move/vue'
import { MagicMoveTokens } from '~/magic-move'

const toggleCapo = ref(false)
</script>

<template>
  <div>
    <ProsePre class="prose  shiki">
      <ShikiMagicMovePrecompiled
        animate
        :steps="MagicMoveTokens"
        :step="Number(toggleCapo)"
      />
    </ProsePre>
    <USwitch
      unchecked-icon="i-lucide-x"
      checked-icon="i-lucide-check"
      default-value
      size="xl"
      label="Enable Capo.js"
      :model-value="toggleCapo"
      @update:model-value="toggleCapo = !toggleCapo"
    />
  </div>
</template>
