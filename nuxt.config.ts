import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'pathe'
import { logger } from './logger'

logger.info(`🚀 Using Nuxt UI Pro License: ${!!process.env.NUXT_UI_PRO_LICENSE}`)

export default defineNuxtConfig({
  modules: [
    'nuxt-content-twoslash',
    '@vueuse/motion/nuxt',
    '@nuxt/ui-pro',
    '@nuxtjs/seo',
    'radix-vue/nuxt',
    '@vueuse/nuxt',
    '@nuxthub/core',
    '@nuxt/fonts',
    '@nuxt/content',
    '@nuxt/scripts',
    '@nuxt/image',
    // maybe buggy
    'nuxt-rebundle',
    'nuxt-build-cache',
    async (_, nuxt) => {
      // addBuildPlugin(UnheadImportsPlugin({ sourcemap: true }))
      nuxt.hooks.hook('nitro:init', (nitro) => {
        // from sponsorkit
        nitro.options.alias.sharp = 'unenv/runtime/mock/empty'
        nitro.options.alias.pnpapi = 'unenv/runtime/mock/empty' // ?
      })
    },
  ],

  ui: {
    theme: {
      transitions: true,
    },
  },

  sitemap: {
    xslColumns: [
      { label: 'URL', width: '100%' },
    ],
  },

  hub: {
    database: true,
    cache: true,
    kv: true,
  },

  future: {
    compatibilityVersion: 4,
  },

  runtimeConfig: {
    githubAccessToken: '', // NUXT_GITHUB_ACCESS_TOKEN
    githubAuthToken: '', // NUXT_GITHUB_AUTH_TOKEN
    githubAuthClientId: 'cabace556bd9519d9299', // NUXT_GITHUB_AUTH_CLIENT_ID
    githubAuthClientSecret: '', // NUXT_GITHUB_AUTH_SECRET_ID
  },

  twoslash: {
    floatingVueOptions: {
      classMarkdown: 'prose prose-primary dark:prose-invert bg-blue-500',
    },
    // Skip Twoslash in dev to improve performance. Turn this on when you want to explictly test twoslash in dev.
    enableInDev: true,
    // Do not throw when twoslash fails, the typecheck should be down in github.com/nuxt/nuxt's CI
    throws: true,
  },

  fonts: {
    experimental: {
      processCSSVariables: true,
    },
    families: [
      { name: 'Hubot Sans', provider: 'local', weight: [200, 900], stretch: '75% 125%' },
    ],
  },

  nitro: {
    prerender: {
      failOnError: false,
      crawlLinks: true,
      routes: ['/'],
    },
    cloudflare: {
      pages: {
        routes: {
          exclude: [
            '/docs/*',
          ],
        },
      },
    },
  },

  linkChecker: {
    report: {
      // generate both a html and markdown report
      html: true,
      markdown: true,
    },
  },

  site: {
    url: 'https://unhead.unjs.io/',
    name: 'Unhead',
    description: 'Unhead is the any-framework document head manager built for performance and delightful developer experience.',
  },

  imports: {
    autoImport: true,
  },

  typescript: {
    strict: false,
  },

  content: {
    database: { type: 'd1', binding: 'DB' },
    build: {
      markdown: {
        highlight: {
          theme: {
            light: 'github-light',
            default: 'github-light',
            dark: 'material-theme-palenight',
          },
          langs: [
            'ts',
            'tsx',
            'vue',
            'json',
            'html',
            'bash',
            'xml',
            'diff',
            'md',
            'dotenv',
          ],
        },
      },
    },
  },

  // CI Not picking this up for some reason ?
  uiPro: {
    license: process.env.NUXT_UI_PRO_LICENSE,
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  llms: {
    domain: 'https://unhead.unjs.io',
    title: 'Unhead',
    description: 'Unhead is the any-framework document head manager built for performance and delightful developer experience.',
    notes: [
      'The documentation only includes Unhead v2 docs.',
      'The content is automatically generated from the same source as the official documentation.',
    ],
    full: {
      title: 'Complete Documentation',
      description: 'The complete documentation including all content',
    },
  },

  hooks: {
    'components:extend': function (components) {
      for (const component of components) {
        if (component.pascalName === 'UAlert') {
          component.global = true
        }
      }
    },
  },

  mdc: {
    highlight: {
      theme: {
        light: 'github-light',
        default: 'github-light',
        dark: 'material-theme-palenight',
      },
      langs: [
        'ts',
        'tsx',
        'vue',
        'json',
        'html',
        'bash',
        'xml',
        'diff',
        'md',
        'dotenv',
      ],
    },
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Unhead',
      logo: '/logo.svg',
    },
  },

  $production: {
    routeRules: {
      '/api/_mdc/highlight': { cache: { group: 'mdc', name: 'highlight', maxAge: 60 * 60 } },
      '/api/_content/query/**': { cache: { group: 'content', name: 'query', maxAge: 60 * 60 } },
      '/api/_nuxt_icon': { cache: { group: 'icon', name: 'icon', maxAge: 60 * 60 * 24 * 7 } },
    },
    scripts: {
      registry: {
        fathomAnalytics: {
          site: 'BRDEJWKJ',
        },
      },
    },
  },

  routeRules: {
    '/usage/composables/use-head': { redirect: { to: '/api/use-head', statusCode: 301 } },
    '/usage/composables/use-seo-meta': { redirect: { to: '/api/use-seo-meta', statusCode: 301 } },
    '/usage/composables/use-head-safe': { redirect: { to: '/api/use-head-safe', statusCode: 301 } },
    '/api/core/hooks': { redirect: { to: '/guides/hooks', statusCode: 301 } },
  },

  css: [
    '~/css/global.css',
  ],

  ogImage: {
    zeroRuntime: true,
    fonts: [
      'Hubot+Sans:400',
      'Hubot+Sans:700',
    ],
  },

  icon: {
    customCollections: [{
      prefix: 'custom',
      dir: resolve('./app/assets/icons'),
    }],
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
    provider: 'iconify',
  },

  seo: {
    meta: {
      themeColor: [
        { content: '#18181b', media: '(prefers-color-scheme: dark)' },
        { content: 'white', media: '(prefers-color-scheme: light)' },
      ],
    },
  },

  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
    head: {
      templateParams: {
        separator: '·',
      },

    },
  },

  compatibilityDate: '2024-07-12',
})
