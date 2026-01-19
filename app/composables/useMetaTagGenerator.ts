export interface MetaTagState {
  // Basic
  title: string
  description: string

  // Open Graph
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogImageAlt: string
  ogImageWidth: string
  ogImageHeight: string
  ogType: 'website' | 'article' | 'product'
  ogUrl: string
  ogSiteName: string
  ogLocale: string

  // Twitter
  twitterCard: 'summary' | 'summary_large_image'
  twitterSite: string
  twitterCreator: string
  twitterImage: string
  twitterLabel1: string
  twitterData1: string
  twitterLabel2: string
  twitterData2: string

  // Article (when ogType is 'article')
  articlePublishedTime: string
  articleModifiedTime: string
  articleAuthor: string
  articleSection: string
  articleTag: string

  // Technical
  canonical: string
  robots: string
  author: string
  colorScheme: 'light' | 'dark' | 'light dark' | ''
  themeColor: string
  applicationName: string
  fbAppId: string

  // Output
  framework: 'typescript' | 'vue' | 'react' | 'nuxt' | 'solid-js' | 'svelte' | 'angular'
  outputMode: 'useSeoMeta' | 'useHead' | 'html'
}

export interface MetaTagPreset {
  id: string
  label: string
  icon: string
  description: string
  values: Partial<MetaTagState>
}

const frameworks = [
  { icon: 'i-logos-typescript-icon', label: 'TypeScript', slug: 'typescript', import: 'unhead' },
  { icon: 'i-logos-vue', label: 'Vue', slug: 'vue', import: '@unhead/vue' },
  { icon: 'i-logos-react', label: 'React', slug: 'react', import: '@unhead/react' },
  { icon: 'i-logos-svelte-icon', label: 'Svelte', slug: 'svelte', import: '@unhead/svelte' },
  { icon: 'i-logos-solidjs-icon', label: 'Solid.js', slug: 'solid-js', import: '@unhead/solid-js' },
  { icon: 'i-logos-angular-icon', label: 'Angular', slug: 'angular', import: '@unhead/angular' },
  { icon: 'i-logos-nuxt-icon', label: 'Nuxt', slug: 'nuxt', import: '#imports' },
] as const

const presets: MetaTagPreset[] = [
  {
    id: 'blog',
    label: 'Blog Post',
    icon: 'i-carbon-blog',
    description: 'Article with author attribution',
    values: {
      title: 'How to Build Better Web Apps',
      description: 'Learn the best practices for building modern, performant web applications with the latest frameworks and tools.',
      ogImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop',
      ogImageAlt: 'Code on a computer screen',
      ogImageWidth: '1200',
      ogImageHeight: '630',
      ogType: 'article',
      ogUrl: 'https://example.com/blog/build-better-web-apps',
      ogSiteName: 'Example Blog',
      ogLocale: 'en_US',
      twitterCard: 'summary_large_image',
      twitterSite: '@example',
      twitterCreator: '@yourhandle',
      articleSection: 'Technology',
      articleTag: 'javascript, web development, best practices',
      author: 'John Doe',
      canonical: 'https://example.com/blog/build-better-web-apps',
      robots: 'index, follow',
      twitterLabel1: 'Reading time',
      twitterData1: '5 min read',
      twitterLabel2: 'Written by',
      twitterData2: 'John Doe',
    },
  },
  {
    id: 'product',
    label: 'Product Page',
    icon: 'i-carbon-shopping-cart',
    description: 'E-commerce product listing',
    values: {
      title: 'Premium Wireless Headphones - $99',
      description: 'Experience crystal-clear audio with our premium wireless headphones. 40-hour battery life, active noise cancellation, and premium comfort.',
      ogImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=630&fit=crop',
      ogType: 'product',
      ogUrl: 'https://example.com/products/wireless-headphones',
      twitterCard: 'summary_large_image',
      twitterSite: '@examplestore',
      canonical: 'https://example.com/products/wireless-headphones',
      robots: 'index, follow',
    },
  },
  {
    id: 'landing',
    label: 'Landing Page',
    icon: 'i-carbon-rocket',
    description: 'Marketing or homepage',
    values: {
      title: 'Build Apps Faster | Your Product Name',
      description: 'The all-in-one platform for building, deploying, and scaling your web applications. Start free, scale infinitely.',
      ogImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=630&fit=crop',
      ogImageAlt: 'Team collaborating on laptops',
      ogImageWidth: '1200',
      ogImageHeight: '630',
      ogType: 'website',
      ogUrl: 'https://example.com',
      ogSiteName: 'Your Product Name',
      twitterCard: 'summary_large_image',
      twitterSite: '@yourproduct',
      canonical: 'https://example.com',
      robots: 'index, follow',
      themeColor: '#6366f1',
      colorScheme: 'light dark',
      applicationName: 'Your Product Name',
    },
  },
  {
    id: 'docs',
    label: 'Documentation',
    icon: 'i-carbon-document',
    description: 'Technical documentation page',
    values: {
      title: 'Getting Started - Documentation',
      description: 'Learn how to install, configure, and use the library in your project. Includes examples and API reference.',
      ogImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&h=630&fit=crop',
      ogType: 'website',
      ogUrl: 'https://example.com/docs/getting-started',
      twitterCard: 'summary',
      twitterSite: '@yourlibrary',
      canonical: 'https://example.com/docs/getting-started',
      robots: 'index, follow',
    },
  },
]

export function useMetaTagGenerator() {
  const activePreset = ref<string | null>('blog')

  const state = reactive<MetaTagState>({
    title: '',
    description: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogImageAlt: '',
    ogImageWidth: '',
    ogImageHeight: '',
    ogType: 'website',
    ogUrl: '',
    ogSiteName: '',
    ogLocale: '',
    twitterCard: 'summary_large_image',
    twitterSite: '',
    twitterCreator: '',
    twitterImage: '',
    twitterLabel1: '',
    twitterData1: '',
    twitterLabel2: '',
    twitterData2: '',
    articlePublishedTime: '',
    articleModifiedTime: '',
    articleAuthor: '',
    articleSection: '',
    articleTag: '',
    canonical: '',
    robots: '',
    author: '',
    colorScheme: '',
    themeColor: '',
    applicationName: '',
    fbAppId: '',
    framework: 'vue',
    outputMode: 'useSeoMeta',
  })

  const selectedFramework = computed(() => {
    return frameworks.find(f => f.slug === state.framework) || frameworks[0]
  })

  const hasAnyValue = computed(() => {
    return state.title || state.description || state.ogImage || state.canonical
  })

  const titleLength = computed(() => state.title.length)
  const descriptionLength = computed(() => state.description.length)

  const titleWarning = computed(() => {
    if (state.title.length > 60)
      return 'Title exceeds 60 characters'
    if (state.title.length > 0 && state.title.length < 30)
      return 'Title is short (aim for 50-60 characters)'
    return null
  })

  const descriptionWarning = computed(() => {
    if (state.description.length > 160)
      return 'Description exceeds 160 characters'
    if (state.description.length > 0 && state.description.length < 70)
      return 'Description is short (aim for 150-160 characters)'
    return null
  })

  function generateUseSeoMeta(): string {
    const lines: string[] = []

    if (state.title)
      lines.push(`  title: '${escapeString(state.title)}',`)
    if (state.description)
      lines.push(`  description: '${escapeString(state.description)}',`)
    if (state.author)
      lines.push(`  author: '${escapeString(state.author)}',`)
    if (state.colorScheme)
      lines.push(`  colorScheme: '${state.colorScheme}',`)
    if (state.themeColor)
      lines.push(`  themeColor: '${escapeString(state.themeColor)}',`)
    if (state.applicationName)
      lines.push(`  applicationName: '${escapeString(state.applicationName)}',`)

    // Open Graph
    if (state.ogTitle || state.title)
      lines.push(`  ogTitle: '${escapeString(state.ogTitle || state.title)}',`)
    if (state.ogDescription || state.description)
      lines.push(`  ogDescription: '${escapeString(state.ogDescription || state.description)}',`)
    if (state.ogImage)
      lines.push(`  ogImage: '${escapeString(state.ogImage)}',`)
    if (state.ogImageAlt)
      lines.push(`  ogImageAlt: '${escapeString(state.ogImageAlt)}',`)
    if (state.ogImageWidth)
      lines.push(`  ogImageWidth: ${state.ogImageWidth},`)
    if (state.ogImageHeight)
      lines.push(`  ogImageHeight: ${state.ogImageHeight},`)
    if (state.ogType !== 'website')
      lines.push(`  ogType: '${state.ogType}',`)
    if (state.ogUrl)
      lines.push(`  ogUrl: '${escapeString(state.ogUrl)}',`)
    if (state.ogSiteName)
      lines.push(`  ogSiteName: '${escapeString(state.ogSiteName)}',`)
    if (state.ogLocale)
      lines.push(`  ogLocale: '${escapeString(state.ogLocale)}',`)

    // Article (only when ogType is 'article')
    if (state.ogType === 'article') {
      if (state.articlePublishedTime)
        lines.push(`  articlePublishedTime: '${escapeString(state.articlePublishedTime)}',`)
      if (state.articleModifiedTime)
        lines.push(`  articleModifiedTime: '${escapeString(state.articleModifiedTime)}',`)
      if (state.articleAuthor)
        lines.push(`  articleAuthor: '${escapeString(state.articleAuthor)}',`)
      if (state.articleSection)
        lines.push(`  articleSection: '${escapeString(state.articleSection)}',`)
      if (state.articleTag)
        lines.push(`  articleTag: '${escapeString(state.articleTag)}',`)
    }

    // Twitter
    if (state.twitterCard)
      lines.push(`  twitterCard: '${state.twitterCard}',`)
    if (state.twitterSite)
      lines.push(`  twitterSite: '${escapeString(state.twitterSite)}',`)
    if (state.twitterCreator)
      lines.push(`  twitterCreator: '${escapeString(state.twitterCreator)}',`)
    if (state.twitterImage)
      lines.push(`  twitterImage: '${escapeString(state.twitterImage)}',`)
    if (state.twitterLabel1)
      lines.push(`  twitterLabel1: '${escapeString(state.twitterLabel1)}',`)
    if (state.twitterData1)
      lines.push(`  twitterData1: '${escapeString(state.twitterData1)}',`)
    if (state.twitterLabel2)
      lines.push(`  twitterLabel2: '${escapeString(state.twitterLabel2)}',`)
    if (state.twitterData2)
      lines.push(`  twitterData2: '${escapeString(state.twitterData2)}',`)

    // Technical
    if (state.robots)
      lines.push(`  robots: '${escapeString(state.robots)}',`)
    if (state.fbAppId)
      lines.push(`  fbAppId: '${escapeString(state.fbAppId)}',`)

    if (lines.length === 0)
      return '// Add some meta tags to generate code'

    const importStatement = state.framework === 'nuxt'
      ? ''
      : `import { useSeoMeta } from '${selectedFramework.value.import}'\n\n`

    return `${importStatement}useSeoMeta({\n${lines.join('\n')}\n})`
  }

  function generateUseHead(): string {
    const meta: string[] = []
    const link: string[] = []

    if (state.title)
      meta.push(`    { name: 'title', content: '${escapeString(state.title)}' },`)
    if (state.description)
      meta.push(`    { name: 'description', content: '${escapeString(state.description)}' },`)
    if (state.author)
      meta.push(`    { name: 'author', content: '${escapeString(state.author)}' },`)
    if (state.colorScheme)
      meta.push(`    { name: 'color-scheme', content: '${state.colorScheme}' },`)
    if (state.themeColor)
      meta.push(`    { name: 'theme-color', content: '${escapeString(state.themeColor)}' },`)
    if (state.applicationName)
      meta.push(`    { name: 'application-name', content: '${escapeString(state.applicationName)}' },`)

    // Open Graph
    if (state.ogTitle || state.title)
      meta.push(`    { property: 'og:title', content: '${escapeString(state.ogTitle || state.title)}' },`)
    if (state.ogDescription || state.description)
      meta.push(`    { property: 'og:description', content: '${escapeString(state.ogDescription || state.description)}' },`)
    if (state.ogImage)
      meta.push(`    { property: 'og:image', content: '${escapeString(state.ogImage)}' },`)
    if (state.ogImageAlt)
      meta.push(`    { property: 'og:image:alt', content: '${escapeString(state.ogImageAlt)}' },`)
    if (state.ogImageWidth)
      meta.push(`    { property: 'og:image:width', content: '${state.ogImageWidth}' },`)
    if (state.ogImageHeight)
      meta.push(`    { property: 'og:image:height', content: '${state.ogImageHeight}' },`)
    if (state.ogType !== 'website')
      meta.push(`    { property: 'og:type', content: '${state.ogType}' },`)
    if (state.ogUrl)
      meta.push(`    { property: 'og:url', content: '${escapeString(state.ogUrl)}' },`)
    if (state.ogSiteName)
      meta.push(`    { property: 'og:site_name', content: '${escapeString(state.ogSiteName)}' },`)
    if (state.ogLocale)
      meta.push(`    { property: 'og:locale', content: '${escapeString(state.ogLocale)}' },`)

    // Article (only when ogType is 'article')
    if (state.ogType === 'article') {
      if (state.articlePublishedTime)
        meta.push(`    { property: 'article:published_time', content: '${escapeString(state.articlePublishedTime)}' },`)
      if (state.articleModifiedTime)
        meta.push(`    { property: 'article:modified_time', content: '${escapeString(state.articleModifiedTime)}' },`)
      if (state.articleAuthor)
        meta.push(`    { property: 'article:author', content: '${escapeString(state.articleAuthor)}' },`)
      if (state.articleSection)
        meta.push(`    { property: 'article:section', content: '${escapeString(state.articleSection)}' },`)
      if (state.articleTag)
        meta.push(`    { property: 'article:tag', content: '${escapeString(state.articleTag)}' },`)
    }

    // Twitter
    if (state.twitterCard)
      meta.push(`    { name: 'twitter:card', content: '${state.twitterCard}' },`)
    if (state.twitterSite)
      meta.push(`    { name: 'twitter:site', content: '${escapeString(state.twitterSite)}' },`)
    if (state.twitterCreator)
      meta.push(`    { name: 'twitter:creator', content: '${escapeString(state.twitterCreator)}' },`)
    if (state.twitterImage)
      meta.push(`    { name: 'twitter:image', content: '${escapeString(state.twitterImage)}' },`)
    if (state.twitterLabel1)
      meta.push(`    { name: 'twitter:label1', content: '${escapeString(state.twitterLabel1)}' },`)
    if (state.twitterData1)
      meta.push(`    { name: 'twitter:data1', content: '${escapeString(state.twitterData1)}' },`)
    if (state.twitterLabel2)
      meta.push(`    { name: 'twitter:label2', content: '${escapeString(state.twitterLabel2)}' },`)
    if (state.twitterData2)
      meta.push(`    { name: 'twitter:data2', content: '${escapeString(state.twitterData2)}' },`)

    // Technical
    if (state.robots)
      meta.push(`    { name: 'robots', content: '${escapeString(state.robots)}' },`)
    if (state.fbAppId)
      meta.push(`    { property: 'fb:app_id', content: '${escapeString(state.fbAppId)}' },`)
    if (state.canonical)
      link.push(`    { rel: 'canonical', href: '${escapeString(state.canonical)}' },`)

    if (meta.length === 0 && link.length === 0)
      return '// Add some meta tags to generate code'

    const lines: string[] = []
    if (state.title)
      lines.push(`  title: '${escapeString(state.title)}',`)
    if (meta.length > 0)
      lines.push(`  meta: [\n${meta.join('\n')}\n  ],`)
    if (link.length > 0)
      lines.push(`  link: [\n${link.join('\n')}\n  ],`)

    const importStatement = state.framework === 'nuxt'
      ? ''
      : `import { useHead } from '${selectedFramework.value.import}'\n\n`

    return `${importStatement}useHead({\n${lines.join('\n')}\n})`
  }

  function generateHtml(): string {
    const tags: string[] = []

    if (state.title)
      tags.push(`<title>${escapeHtml(state.title)}</title>`)
    if (state.description)
      tags.push(`<meta name="description" content="${escapeHtml(state.description)}">`)
    if (state.author)
      tags.push(`<meta name="author" content="${escapeHtml(state.author)}">`)
    if (state.colorScheme)
      tags.push(`<meta name="color-scheme" content="${state.colorScheme}">`)
    if (state.themeColor)
      tags.push(`<meta name="theme-color" content="${escapeHtml(state.themeColor)}">`)
    if (state.applicationName)
      tags.push(`<meta name="application-name" content="${escapeHtml(state.applicationName)}">`)

    // Open Graph
    if (state.ogTitle || state.title)
      tags.push(`<meta property="og:title" content="${escapeHtml(state.ogTitle || state.title)}">`)
    if (state.ogDescription || state.description)
      tags.push(`<meta property="og:description" content="${escapeHtml(state.ogDescription || state.description)}">`)
    if (state.ogImage)
      tags.push(`<meta property="og:image" content="${escapeHtml(state.ogImage)}">`)
    if (state.ogImageAlt)
      tags.push(`<meta property="og:image:alt" content="${escapeHtml(state.ogImageAlt)}">`)
    if (state.ogImageWidth)
      tags.push(`<meta property="og:image:width" content="${state.ogImageWidth}">`)
    if (state.ogImageHeight)
      tags.push(`<meta property="og:image:height" content="${state.ogImageHeight}">`)
    if (state.ogType !== 'website')
      tags.push(`<meta property="og:type" content="${state.ogType}">`)
    if (state.ogUrl)
      tags.push(`<meta property="og:url" content="${escapeHtml(state.ogUrl)}">`)
    if (state.ogSiteName)
      tags.push(`<meta property="og:site_name" content="${escapeHtml(state.ogSiteName)}">`)
    if (state.ogLocale)
      tags.push(`<meta property="og:locale" content="${escapeHtml(state.ogLocale)}">`)

    // Article (only when ogType is 'article')
    if (state.ogType === 'article') {
      if (state.articlePublishedTime)
        tags.push(`<meta property="article:published_time" content="${escapeHtml(state.articlePublishedTime)}">`)
      if (state.articleModifiedTime)
        tags.push(`<meta property="article:modified_time" content="${escapeHtml(state.articleModifiedTime)}">`)
      if (state.articleAuthor)
        tags.push(`<meta property="article:author" content="${escapeHtml(state.articleAuthor)}">`)
      if (state.articleSection)
        tags.push(`<meta property="article:section" content="${escapeHtml(state.articleSection)}">`)
      if (state.articleTag)
        tags.push(`<meta property="article:tag" content="${escapeHtml(state.articleTag)}">`)
    }

    // Twitter
    if (state.twitterCard)
      tags.push(`<meta name="twitter:card" content="${state.twitterCard}">`)
    if (state.twitterSite)
      tags.push(`<meta name="twitter:site" content="${escapeHtml(state.twitterSite)}">`)
    if (state.twitterCreator)
      tags.push(`<meta name="twitter:creator" content="${escapeHtml(state.twitterCreator)}">`)
    if (state.twitterImage)
      tags.push(`<meta name="twitter:image" content="${escapeHtml(state.twitterImage)}">`)
    if (state.twitterLabel1)
      tags.push(`<meta name="twitter:label1" content="${escapeHtml(state.twitterLabel1)}">`)
    if (state.twitterData1)
      tags.push(`<meta name="twitter:data1" content="${escapeHtml(state.twitterData1)}">`)
    if (state.twitterLabel2)
      tags.push(`<meta name="twitter:label2" content="${escapeHtml(state.twitterLabel2)}">`)
    if (state.twitterData2)
      tags.push(`<meta name="twitter:data2" content="${escapeHtml(state.twitterData2)}">`)

    // Technical
    if (state.robots)
      tags.push(`<meta name="robots" content="${escapeHtml(state.robots)}">`)
    if (state.fbAppId)
      tags.push(`<meta property="fb:app_id" content="${escapeHtml(state.fbAppId)}">`)
    if (state.canonical)
      tags.push(`<link rel="canonical" href="${escapeHtml(state.canonical)}">`)

    if (tags.length === 0)
      return '<!-- Add some meta tags to generate code -->'

    return tags.join('\n')
  }

  const generatedCode = computed(() => {
    if (state.outputMode === 'useSeoMeta')
      return generateUseSeoMeta()
    if (state.outputMode === 'useHead')
      return generateUseHead()
    return generateHtml()
  })

  const codeLanguage = computed(() => {
    return state.outputMode === 'html' ? 'html' : 'ts'
  })

  function clearState() {
    state.title = ''
    state.description = ''
    state.ogTitle = ''
    state.ogDescription = ''
    state.ogImage = ''
    state.ogImageAlt = ''
    state.ogImageWidth = ''
    state.ogImageHeight = ''
    state.ogType = 'website'
    state.ogUrl = ''
    state.ogSiteName = ''
    state.ogLocale = ''
    state.twitterCard = 'summary_large_image'
    state.twitterSite = ''
    state.twitterCreator = ''
    state.twitterImage = ''
    state.twitterLabel1 = ''
    state.twitterData1 = ''
    state.twitterLabel2 = ''
    state.twitterData2 = ''
    state.articlePublishedTime = ''
    state.articleModifiedTime = ''
    state.articleAuthor = ''
    state.articleSection = ''
    state.articleTag = ''
    state.canonical = ''
    state.robots = ''
    state.author = ''
    state.colorScheme = ''
    state.themeColor = ''
    state.applicationName = ''
    state.fbAppId = ''
  }

  function reset() {
    activePreset.value = null
    clearState()
  }

  function applyPreset(preset: MetaTagPreset) {
    // Toggle off if same preset clicked
    if (activePreset.value === preset.id) {
      reset()
      return
    }
    clearState()
    activePreset.value = preset.id
    Object.assign(state, preset.values)
  }

  // Initialize with blog preset
  const blogPreset = presets.find(p => p.id === 'blog')
  if (blogPreset)
    Object.assign(state, blogPreset.values)

  return {
    state,
    frameworks,
    presets,
    activePreset,
    selectedFramework,
    hasAnyValue,
    titleLength,
    descriptionLength,
    titleWarning,
    descriptionWarning,
    generatedCode,
    codeLanguage,
    reset,
    applyPreset,
  }
}

function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
