import { existsSync } from 'node:fs'
import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'pathe'
import { SENTRY_DSN, sentryBuildTarget } from './shared/sentry'

const hasSentryAuthToken = Boolean(process.env.SENTRY_AUTH_TOKEN)
  || existsSync('.env.sentry-build-plugin')

const sentryTarget = sentryBuildTarget()

export default defineNuxtConfig({
  extends: ['./layers/admin', './layers/tools'],

  nuxtDx: {
    report: true,
    sizeBudget: {
      overridesKb: { 'server/plugins/sentry.ts': 326 },
    },
  },

  modules: [
    '@harlan-zw/nuxt-dx',
    '@harlan-zw/nuxt-wide-events',
    '@harlan-zw/nuxt-github-sponsors',
    '@nuxt/ui',
    '@nuxtjs/seo',
    'radix-vue/nuxt',
    '@vueuse/nuxt',
    'nitro-cloudflare-dev',
    '@nuxt/fonts',
    '@nuxt/content',
    'nuxt-ai-ready',
    '@nuxt/scripts',
    'nuxt-skew-protection',
    'nuxt-auth-utils',
    '@sentry/nuxt/module',
    // 'nuxt-build-cache',
    async (_, nuxt) => {
      // addBuildPlugin(UnheadImportsPlugin({ sourcemap: true }))
      nuxt.hooks.hook('nitro:init', (nitro) => {
        // from sponsorkit
        nitro.options.alias.sharp = 'unenv/mock/empty'
        nitro.options.alias.pnpapi = 'unenv/mock/empty' // ?
        nitro.options.alias['better-sqlite3'] = 'unenv/mock/empty'
        if (!nitro.options.dev) {
          nitro.hooks.hook('rollup:before', (_nitro, rollupConfig) => {
            rollupConfig.input = resolve('./server/cloudflare-pages-worker.ts')
          })
        }
      })
    },
  ],

  wideEvents: {
    request: true,
    service: 'unhead.unjs.io',
    fields: [
      'auth.github.failed',
      'cache.kind',
      'cache.name',
      'cache.operation',
      'cache.outcome',
      'toolAnalytics.fetchFailed',
      'toolTracking.analyticsEngineWriteFailed',
      'toolTracking.d1WriteFailed',
    ],
  },

  ui: {
    mdc: true,
    content: true,
    theme: {
      transitions: true,
    },
  },

  experimental: {
    checkOutdatedBuildInterval: 5 * 60 * 1000,
  },

  skewProtection: {
    updateStrategy: 'polling',
    reloadStrategy: 'prompt',
  },

  mdc: {
    components: {
      prose: true,
    },
    highlight: {
      theme: {
        light: 'github-light-high-contrast',
        default: 'github-light-high-contrast',
        dark: 'github-dark-high-contrast',
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
      '/admin',
      '/docs/v2/**',
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
    sentry: {
      dsn: SENTRY_DSN,
      enabled: sentryTarget._tag === 'enabled',
      environment: sentryTarget._tag === 'enabled' ? sentryTarget.environment : 'development',
      release: sentryTarget._tag === 'enabled' ? sentryTarget.release : '',
      tracesSampleRate: 0.05,
    },
  },

  githubSponsors: {
    login: 'harlan-zw',
    mode: 'prerender',
    route: '/api/github/sponsors.json',
    tiers: [
      { key: 'top', minimumMonthlyDollars: 50 },
      { key: 'gold', minimumMonthlyDollars: 25 },
    ],
    overrides: {
      'Kintell-labs': { name: 'Kintell', websiteUrl: 'https://kintell.com' },
      'Massive Monster': { websiteUrl: 'https://massivemonster.co' },
    },
  },

  fonts: {
    experimental: {
      processCSSVariables: true,
    },
    families: [
      { name: 'Hubot Sans', stretch: '75% 125%', global: true },
      { name: 'Nunito Sans' },
    ],
  },

  nitro: {
    preset: 'cloudflare-pages',
    rollupConfig: {
      plugins: [{
        name: 'preserve-unhead-stream-runtime',
        transform(code, id) {
          if (!id.replaceAll('\\', '/').endsWith('/unhead/dist/stream/iife.mjs'))
            return null

          // Nitro's textual `typeof window` replacement otherwise corrupts
          // Unhead's JavaScript source string before Rollup parses the module.
          return code.replaceAll('typeof window', 'typeof globalThis.window')
        },
      }],
    },
    prerender: {
      autoSubfolderIndex: false,
      failOnError: false,
      crawlLinks: false,
      routes: ['/404.html'],
      ignore: ['/auth/github', '/admin/**'],
    },
    cloudflare: {
      nodeCompat: true,
      pages: {
        routes: {
          exclude: [
            // '/guides/*',
            // '/schema-org/*',
            // '/docs/*',
            // '/plugins/*',
            // '/usage/*',
            '/llms.txt',
          ],
        },
      },
      wrangler: {
        compatibility_flags: ['nodejs_compat'],
        observability: {
          enabled: true,
          logs: {
            enabled: true,
            head_sampling_rate: 1,
          },
        },
        analytics_engine_datasets: [
          {
            binding: 'TOOL_ANALYTICS',
            dataset: 'unhead_tool_usage',
          },
        ],
        // Nitro's generated Wrangler type currently lags Wrangler's rate-limit binding schema.
        ...{
          ratelimits: [
            {
              name: 'RL_FREE_TOOLS',
              namespace_id: '1001',
              simple: { limit: 10, period: 60 },
            },
          ],
        },
        vars: {
          NUXT_CLOUDFLARE_ACCOUNT_ID: process.env.NUXT_CLOUDFLARE_ACCOUNT_ID || '',
        },
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
    database: { type: 'd1', bindingName: 'DB' },
    build: {
      markdown: {
        highlight: {
          theme: {
            light: 'github-light-high-contrast',
            default: 'github-light-high-contrast',
            dark: 'github-dark-high-contrast',
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
        if (component.pascalName === 'UAlert' || component.pascalName.startsWith('Prose')) {
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
    '/api/debug/**': { prerender: false, cache: false },
    '/tools/og-image-generator': { prerender: false },
    '/releases/v3': { redirect: { to: '/docs/releases/v3', statusCode: 301 } },
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

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'fuse.js',
        'reka-ui',
        'tailwind-variants',
        '@unhead/schema-org/vue',
        'zod',
      ],
    },
  },

  app: {
    layoutTransition: false,
    pageTransition: false,
    head: {
      meta: [
        { name: 'google-site-verification', content: 'SnwVo-uFg39U69WHDoKma6bdT7hoh7sNYrviT8QuJww' },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
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

  sentry: {
    // `wrangler dev` and `nuxt preview` build with NODE_ENV=production too, so a
    // release identity is what separates a deploy from a local sandbox. Without
    // it the module must not inject the client entry, or a review sandbox's
    // browser errors report against the production project.
    enabled: sentryTarget._tag === 'enabled',
    org: 'harlan-zw',
    project: 'unhead',
    authToken: process.env.SENTRY_AUTH_TOKEN,
    release: { name: sentryTarget._tag === 'enabled' ? sentryTarget.release : undefined },
    sourcemaps: {
      disable: !hasSentryAuthToken,
      filesToDeleteAfterUpload: ['**/*.map'],
    },
    bundleSizeOptimizations: {
      excludeReplayShadowDom: true,
      excludeReplayIframe: true,
      excludeReplayWorker: true,
    },
    telemetry: false,
  },

  sourcemap: {
    client: hasSentryAuthToken ? 'hidden' : false,
    server: false,
  },

  compatibilityDate: '2026-07-20',
})
