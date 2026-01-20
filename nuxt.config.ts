import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'pathe'

export default defineNuxtConfig({
  extends: ['./layers/admin'],

  modules: [
    'nuxt-content-twoslash',
    'motion-v/nuxt',
    '@nuxt/ui',
    '@nuxtjs/seo',
    'radix-vue/nuxt',
    '@vueuse/nuxt',
    'nitro-cloudflare-dev',
    '@nuxt/fonts',
    '@nuxt/content',
    'nuxt-ai-ready',
    '@nuxt/scripts',
    '@nuxt/image',
    'nuxt-skew-protection',
    'nuxt-rebundle',
    'nuxt-auth-utils',
    // 'nuxt-build-cache',
    async (_, nuxt) => {
      // addBuildPlugin(UnheadImportsPlugin({ sourcemap: true }))
      nuxt.hooks.hook('nitro:init', (nitro) => {
        // from sponsorkit
        nitro.options.alias.sharp = 'unenv/mock/empty'
        nitro.options.alias.pnpapi = 'unenv/mock/empty' // ?
      })
    },
  ],

  ui: {
    mdc: true,
    content: true,
    theme: {
      transitions: true,
    },
  },

  mdc: {
    components: {
      prose: true,
    },
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
        'svelte',
      ],
    },
  },

  aiReady: {
    debug: true,
    database: {
      type: 'd1',
      bindingName: 'DB',
    },
    cron: true,
    runtimeSync: true,
    indexNow: true,
  },

  sitemap: {
    exclude: [
      '**/.navigation',
    ],
    xslColumns: [
      { label: 'URL', width: '100%' },
    ],
  },

  future: {
    compatibilityVersion: 5,
  },

  runtimeConfig: {
    oauth: {
      github: {
        clientId: '', // NUXT_OAUTH_GITHUB_CLIENT_ID
        clientSecret: '', // NUXT_OAUTH_GITHUB_CLIENT_SECRET
      },
    },
    session: {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      password: '', // NUXT_SESSION_PASSWORD
      cookie: {
        sameSite: 'lax',
        secure: true,
      },
    },
    githubAccessToken: '', // NUXT_GITHUB_ACCESS_TOKEN
    cloudflareAccountId: '', // NUXT_CLOUDFLARE_ACCOUNT_ID
    cloudflareAnalyticsApiToken: '', // NUXT_CLOUDFLARE_ANALYTICS_API_TOKEN
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
    preset: 'cloudflare-pages',
    unenv: {
      external: ['node:process'],
    },
    prerender: {
      failOnError: false,
      crawlLinks: true,
      routes: ['/', '/404.html'],
      ignore: ['/auth/github', '/admin/'],
    },
    cloudflare: {
      pages: {
        routes: {
          exclude: [
            '/guides/*',
            '/schema-org/*',
            '/docs/*',
            '/plugins/*',
            '/usage/*',
            '/llms.txt',
          ],
        },
      },
      wrangler: {
        analytics_engine_datasets: [
          {
            binding: 'TOOL_ANALYTICS',
            dataset: 'unhead_tool_usage',
          },
        ],
        vars: {
          NUXT_SESSION_PASSWORD: process.env.NUXT_SESSION_PASSWORD || '',
          NUXT_OAUTH_GITHUB_CLIENT_ID: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID || '',
          NUXT_OAUTH_GITHUB_CLIENT_SECRET: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET || '',
          NUXT_CLOUDFLARE_ANALYTICS_API_TOKEN: process.env.NUXT_CLOUDFLARE_ANALYTICS_API_TOKEN || '',
          NUXT_CLOUDFLARE_ACCOUNT_ID: process.env.NUXT_CLOUDFLARE_ACCOUNT_ID || '',
        },
      },
    },
    storage: {
      cache: {
        driver: 'cloudflare-kv-binding',
        binding: 'CACHE',
      },
      kv: {
        driver: 'cloudflare-kv-binding',
        binding: 'KV',
      },
    },
  },

  linkChecker: {
    report: {
      // generate both a html and markdown report
      html: true,
      markdown: true,
      json: true,
      publish: true,
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
            'svelte',
          ],
        },
      },
    },
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  hooks: {
    'components:extend': function (components) {
      for (const component of components) {
        if (component.pascalName === 'UAlert') {
          component.global = true
        }
      }
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
      '/api/stats.json': { prerender: true },
      '/api/github/sponsors.json': { prerender: true },
      '/api/_mdc/highlight': { cache: { group: 'mdc', name: 'highlight', maxAge: 60 * 60 } },
      '/__nuxt_content/**': { cache: { group: 'content', name: 'query', maxAge: 60 * 60 } },
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
    // auth endpoints must not be cached (cookies need to be set fresh)
    '/auth/**': { prerender: false, cache: false, headers: { 'cache-control': 'no-store' } },
    '/admin/**': { prerender: false },
    '/api/admin/**': { prerender: false, cache: false },
    '/api/tools/**': { prerender: false, cache: false },
    '/usage/composables/use-head': { redirect: { to: '/api/use-head', statusCode: 301 } },
    '/usage/composables/use-seo-meta': { redirect: { to: '/api/use-seo-meta', statusCode: 301 } },
    '/usage/composables/use-head-safe': { redirect: { to: '/api/use-head-safe', statusCode: 301 } },
    '/api/core/hooks': { redirect: { to: '/guides/hooks', statusCode: 301 } },
  },

  css: [
    '~/css/global.css',
  ],

  ogImage: {
    enabled: true,
    zeroRuntime: true,
    defaults: {
      component: 'Unhead',
    },
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
      meta: [
        { name: 'google-site-verification', content: 'SnwVo-uFg39U69WHDoKma6bdT7hoh7sNYrviT8QuJww' },
      ],
      link: [
        {
          rel: 'author',
          href: 'https://harlanzw.com/',
        },
      ],
      templateParams: {
        separator: '·',
      },

    },
  },

  compatibilityDate: '2024-07-12',
})
