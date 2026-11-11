import antfu from '@antfu/eslint-config'
import harlanzw from 'eslint-plugin-harlanzw'

export default antfu(
  {},
  ...harlanzw({
    base: {
      type: 'app',
      ignores: [
        'examples/*',
        'snippets/**',
        'app/components/ui/Breadcrumb.vue',
        'app/components/ui/ContentNavigation.vue',
        'app/components/Logo.vue',
      ],
    },
    link: true,
    nuxt: true,
    vue: true,
  }),
  {
    files: ['scripts/**', 'server/api/**'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    rules: {
      'harlanzw/link-require-descriptive-text': 'off',
      'harlanzw/ai-deslop-passive-voice': 'off',
    },
  },
  {
    files: ['pnpm-workspace.yaml'],
    rules: {
      // Nuxt tools retain TypeScript 6 alongside the native TypeScript 7 checker.
      'pnpm/yaml-no-duplicate-catalog-item': ['error', { checkDuplicates: 'exact-version' }],
    },
  },
)
