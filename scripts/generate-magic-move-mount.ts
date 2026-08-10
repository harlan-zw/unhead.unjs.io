import { codeToKeyedTokens, createMagicMoveMachine } from '@shikijs/magic-move/core'
import { createHighlighter } from 'shiki'

const shiki = await createHighlighter({
  themes: ['github-light-high-contrast', 'github-dark-high-contrast'],
  langs: ['html'],
})

const codeSteps = [
  `<!DOCTYPE html>
<html class="light">
  <head>
    <title>Hello World</title>
  </head>
  <body>
  <!-- Your app -->
  </body>
</html>`,
  `<!DOCTYPE html>
<html class="dark">
  <head>
    <title>Subscribe now!</title>
    <link rel="preload"
        href="https://3p.com/subscribe.js"
        as="script">
  </head>
  <body style="overflow: hidden;"
    data-modal>
  <!-- Your app -->
  </body>
</html>`,
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
await Bun.write('../app/magic-move-mount.ts', `export const MagicMoveTokens = ${JSON.stringify(compiledSteps, null, 2)}`)

console.log(compiledSteps)
