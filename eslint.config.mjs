import antfu from '@antfu/eslint-config'
import harlanzw from 'eslint-plugin-harlanzw'

export default antfu(
  {
    rules: {
      'no-use-before-define': 'off',
      'node/prefer-global/process': 'off',
    },
  },
  {
    ignores: [
      'examples/*',
      '.claude/**',
      'snippets/**',
      'app/components/ui/Breadcrumb.vue',
      'app/components/ui/ContentNavigation.vue',
      'app/components/Logo.vue',
    ],
  },
  ...harlanzw({ link: true, nuxt: true, vue: true }),
  {
    rules: {
      'harlanzw/link-require-descriptive-text': 'off',
    },
  },
)
