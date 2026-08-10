import { codeToKeyedTokens, createMagicMoveMachine } from '@shikijs/magic-move/core'
import { createHighlighter } from 'shiki'

const shiki = await createHighlighter({
  themes: ['github-light-high-contrast', 'github-dark-high-contrast'],
  langs: ['html'],
})

const codeSteps = [
  `<head>
  <script defer src="defer-script.js"></script>
  <script src="sync-script.js"></script>
  <style>.sync-style { color: red }</style>
  <link rel="modulepreload" href="modulepreload.js">
  <script src="async-script.js" async></script>
  <link rel="preload" href="preload.js">
  <link rel="stylesheet" href="sync-styles.css">
  <title>title</title>
  <link rel="preconnect" href="https://example.com">
  <link rel="dns-prefetch" href="https://example.com">
  <link rel="prefetch" href="https://example.com">
  <link rel="prerender" href="https://example.com">
  <meta name="description" content="description">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>`,
  `<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>title</title>
  <link rel="preconnect" href="https://example.com">
  <script src="async-script.js" async></script>
  <script src="sync-script.js"></script>
  <style>.sync-style { color: red }</style>
  <link rel="stylesheet" href="sync-styles.css">
  <link rel="modulepreload" href="modulepreload.js">
  <link rel="preload" href="preload.js">
  <script defer src="defer-script.js"></script>
  <link rel="dns-prefetch" href="https://example.com">
  <link rel="prefetch" href="https://example.com">
  <link rel="prerender" href="https://example.com">
  <meta name="description" content="description">
</head>`,
]

const machine = createMagicMoveMachine(
  code => codeToKeyedTokens(shiki, code, {
    themes: {
      light: 'github-light-high-contrast',
      default: 'github-light-high-contrast',
      dark: 'github-dark-high-contrast',
    },
    lang: 'html',
  }),
  {
    // options
  },
)

const compiledSteps = codeSteps.map(code => machine.commit(code).current)

// bun write to file
await Bun.write('../app/magic-move.ts', `export const MagicMoveTokens = ${JSON.stringify(compiledSteps, null, 2)}`)

console.log(compiledSteps)
