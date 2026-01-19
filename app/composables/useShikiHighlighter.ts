import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

const highlighter = shallowRef<Awaited<ReturnType<typeof createHighlighterCore>>>()
const isLoading = ref(true)
const error = ref<Error | null>(null)

let initPromise: Promise<void> | null = null

async function initHighlighter() {
  if (highlighter.value)
    return

  if (initPromise)
    return initPromise

  initPromise = (async () => {
    const [
      githubLight,
      materialPalenight,
      langTs,
      langJson,
      langHtml,
      langVue,
    ] = await Promise.all([
      import('shiki/themes/github-light.mjs'),
      import('shiki/themes/material-theme-palenight.mjs'),
      import('shiki/langs/typescript.mjs'),
      import('shiki/langs/json.mjs'),
      import('shiki/langs/html.mjs'),
      import('shiki/langs/vue.mjs'),
    ])

    highlighter.value = await createHighlighterCore({
      themes: [githubLight.default, materialPalenight.default],
      langs: [langTs.default, langJson.default, langHtml.default, langVue.default],
      engine: createJavaScriptRegexEngine(),
    })
    isLoading.value = false
  })().catch((e) => {
    error.value = e
    isLoading.value = false
  })

  return initPromise
}

export function useShikiHighlighter() {
  const colorMode = useColorMode()

  const highlight = async (code: string, lang: string) => {
    await initHighlighter()
    if (!highlighter.value)
      return code

    const theme = colorMode.value === 'dark' ? 'material-theme-palenight' : 'github-light'
    return highlighter.value.codeToHtml(code, {
      lang: lang === 'ts' ? 'typescript' : lang,
      theme,
    })
  }

  return {
    highlight,
    highlighter,
    isLoading,
    error,
    initHighlighter,
  }
}
