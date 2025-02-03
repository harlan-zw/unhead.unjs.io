import { createHighlighter } from 'shiki'
import { codeToKeyedTokens, createMagicMoveMachine } from 'shiki-magic-move/core'

const shiki = await createHighlighter({
  themes: ['github-light', 'material-theme-palenight'],
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
      light: 'github-light',
      default: 'github-light',
      dark: 'material-theme-palenight',
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
