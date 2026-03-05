<script setup lang="ts">
import { javascript } from '@codemirror/lang-javascript'
import { Compartment, EditorState } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { basicSetup, EditorView } from 'codemirror'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'focus': []
  'blur': []
}>()

const editorRef = ref<HTMLElement>()
const colorMode = useColorMode()

let view: EditorView | null = null
const themeCompartment = new Compartment()

// Light theme
const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
})

function getTheme() {
  return colorMode.value === 'dark' ? oneDark : lightTheme
}

onMounted(() => {
  if (!editorRef.value)
    return

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      emit('update:modelValue', update.state.doc.toString())
    }
    if (update.focusChanged) {
      if (view?.hasFocus) {
        emit('focus')
      }
      else {
        emit('blur')
      }
    }
  })

  const state = EditorState.create({
    doc: props.modelValue,
    extensions: [
      basicSetup,
      javascript({ jsx: true, typescript: true }),
      themeCompartment.of(getTheme()),
      updateListener,
      EditorView.lineWrapping,
    ],
  })

  view = new EditorView({
    state,
    parent: editorRef.value,
  })
})

// Update theme on color mode change
watch(() => colorMode.value, () => {
  if (view) {
    view.dispatch({
      effects: themeCompartment.reconfigure(getTheme()),
    })
  }
})

// Update content if modelValue changes externally
watch(() => props.modelValue, (newVal) => {
  if (view && newVal !== view.state.doc.toString()) {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: newVal,
      },
    })
  }
})

onUnmounted(() => {
  view?.destroy()
})
</script>

<template>
  <div
    ref="editorRef"
    class="tool-code-editor rounded-xl border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] overflow-hidden"
  />
</template>

<style>
.tool-code-editor {
  min-height: 300px;
  max-height: 500px;
}

.tool-code-editor .cm-editor {
  height: 100%;
  min-height: 300px;
  max-height: 500px;
  font-size: 0.875rem;
}

.tool-code-editor .cm-scroller {
  overflow: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.tool-code-editor .cm-focused {
  outline: none;
}

.tool-code-editor .cm-editor.cm-focused {
  outline: none;
}

/* Selection color */
.tool-code-editor .cm-selectionBackground,
.tool-code-editor .cm-content ::selection {
  background: rgba(139, 92, 246, 0.3) !important;
}
</style>
