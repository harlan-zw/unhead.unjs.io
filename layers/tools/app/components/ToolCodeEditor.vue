<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'focus': []
  'blur': []
}>()

const value = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v),
})
</script>

<template>
  <textarea
    v-model="value"
    :placeholder="placeholder"
    class="tool-code-editor w-full rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-4 font-mono text-sm text-[var(--ui-text)] placeholder-[var(--ui-text-dimmed)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-border-accented)] resize-y"
    spellcheck="false"
    @focus="emit('focus')"
    @blur="emit('blur')"
  />
</template>

<style>
.tool-code-editor {
  min-height: 300px;
  max-height: 500px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  tab-size: 2;
  line-height: 1.5;
}
</style>
