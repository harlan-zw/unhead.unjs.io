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
      langTsx,
      langJsx,
    ] = await Promise.all([
      import('shiki/themes/github-light.mjs'),
      import('shiki/themes/material-theme-palenight.mjs'),
      import('shiki/langs/typescript.mjs'),
      import('shiki/langs/json.mjs'),
      import('shiki/langs/html.mjs'),
      import('shiki/langs/vue.mjs'),
      import('shiki/langs/tsx.mjs'),
      import('shiki/langs/jsx.mjs'),
    ])

    highlighter.value = await createHighlighterCore({
      themes: [githubLight.default, materialPalenight.default],
      langs: [langTs.default, langJson.default, langHtml.default, langVue.default, langTsx.default, langJsx.default],
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

  const highlight = async (code: string, lang: string): Promise<string> => {
    await initHighlighter()
    if (!highlighter.value)
      return `<pre><code>${code}</code></pre>`

    const theme = colorMode.value === 'dark' ? 'material-theme-palenight' : 'github-light'
    // Map short names to full names
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'tsx',
      js: 'javascript',
      jsx: 'jsx',
    }
    const resolvedLang = langMap[lang] || lang
    try {
      return highlighter.value.codeToHtml(code, {
        lang: resolvedLang,
        theme,
      })
    }
    catch {
      return `<pre><code>${code}</code></pre>`
    }
  }

  return {
    highlight,
    highlighter,
    isLoading,
    error,
    initHighlighter,
  }
}
