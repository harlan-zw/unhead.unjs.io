import { useFrameworkSelector } from '~/composables/frameworkSelector'
import { useVersionSelector } from '~/composables/versionSelector'

export interface NavMenuLink {
  label: string
  icon: string
  to: string
  description?: string
}

export interface NavMenuCategory {
  label: string
  description: string
  items: NavMenuLink[]
}

export interface NavMenuItem {
  value: string
  label: string
  icon: string
  to: string
  cols: number
  minWidth: string
  footer?: { label: string, icon: string, to: string }
  categories: NavMenuCategory[]
}

export function useNavMenu() {
  const { selectedFramework } = useFrameworkSelector()
  const { selectedVersion } = useVersionSelector()

  const versionPrefix = computed(() => selectedVersion.value.slug === 'v2' ? '/docs/v2' : '/docs')

  function docPath(path: string) {
    return `${versionPrefix.value}/${selectedFramework.value.slug}${path}`
  }

  const megaMenuItems = computed<NavMenuItem[]>(() => [
    {
      value: 'docs',
      label: 'Docs',
      icon: 'i-carbon-document',
      to: docPath('/head/guides/get-started/overview'),
      cols: 3,
      minWidth: '620px',
      footer: { label: 'Browse all docs', icon: 'i-heroicons-book-open', to: docPath('/head/guides/get-started/overview') },
      categories: [
        {
          label: 'Head Management',
          description: 'Meta tags & SEO',
          items: [
            { label: 'Getting Started', icon: 'i-heroicons-rocket-launch', to: docPath('/head/guides/get-started/overview') },
            { label: 'useHead', icon: 'i-heroicons-code-bracket', to: docPath('/head/api/composables/use-head') },
            { label: 'useSeoMeta', icon: 'i-heroicons-magnifying-glass', to: docPath('/head/api/composables/use-seo-meta') },
            { label: 'useHeadSafe', icon: 'i-heroicons-shield-check', to: docPath('/head/api/composables/use-head-safe') },
            { label: 'useScript', icon: 'i-heroicons-play-circle', to: docPath('/head/api/composables/use-script') },
          ],
        },
        {
          label: 'Schema.org',
          description: 'Structured data',
          items: [
            { label: 'Getting Started', icon: 'i-heroicons-rocket-launch', to: docPath('/schema-org/guides/get-started/overview') },
            { label: 'useSchemaOrg', icon: 'i-heroicons-code-bracket', to: docPath('/schema-org/api/composables/use-schema-org') },
            { label: 'Nodes', icon: 'i-heroicons-cube', to: docPath('/schema-org/guides/core-concepts/nodes') },
            { label: 'Recipes', icon: 'i-heroicons-book-open', to: docPath('/schema-org/guides/recipes/identity') },
          ],
        },
        {
          label: 'Guides',
          description: 'Core concepts',
          items: [
            { label: 'Titles', icon: 'i-heroicons-document-text', to: docPath('/head/guides/core-concepts/titles') },
            { label: 'Streaming SSR', icon: 'i-heroicons-bolt', to: docPath('/head/guides/core-concepts/streaming') },
            { label: 'DOM Events', icon: 'i-heroicons-cursor-arrow-rays', to: docPath('/head/guides/core-concepts/dom-event-handling') },
            { label: 'Plugins', icon: 'i-heroicons-puzzle-piece', to: docPath('/head/guides/plugins/template-params') },
          ],
        },
      ],
    },
    {
      value: 'tools',
      label: 'Tools',
      icon: 'i-carbon-tools',
      to: '/tools',
      cols: 1,
      minWidth: '300px',
      categories: [
        {
          label: 'Tools',
          description: 'Debug & optimize',
          items: [
            { label: 'Meta Tag Generator', icon: 'i-heroicons-code-bracket', to: '/tools/meta-tag-generator', description: 'Generate meta tags for your site' },
            { label: 'OG Image Generator', icon: 'i-heroicons-photo', to: '/tools/og-image-generator', description: 'Create Open Graph images' },
            { label: 'Schema.org Generator', icon: 'i-heroicons-cube', to: '/tools/schema-generator', description: 'Build structured data markup' },
            { label: 'Capo.js Analyzer', icon: 'i-heroicons-beaker', to: '/tools/capo-analyzer', description: 'Analyze head tag ordering' },
          ],
        },
      ],
    },
    {
      value: 'learn',
      label: 'Learn',
      icon: 'i-carbon-education',
      to: '/learn/guides/what-is-capo',
      cols: 2,
      minWidth: '520px',
      footer: { label: 'Browse all articles', icon: 'i-heroicons-academic-cap', to: '/learn/guides/what-is-capo' },
      categories: [
        {
          label: 'Articles',
          description: 'Deep dives & guides',
          items: [
            { label: 'What is Capo.js?', icon: 'i-heroicons-academic-cap', to: '/learn/guides/what-is-capo', description: 'Why HTML head tag order matters' },
          ],
        },
        {
          label: 'Research',
          description: 'Original data & analysis',
          items: [
            { label: 'State of <head> in 2026', icon: 'i-heroicons-chart-bar', to: '/learn/research/state-of-head-2026', description: '660k sites audited across 8 frameworks' },
            { label: 'Streaming Head Performance', icon: 'i-heroicons-chart-bar-square', to: '/learn/research/streaming-head-performance', description: 'Cross-framework SSR SEO study' },
            { label: 'Capo.js Performance Research', icon: 'i-heroicons-beaker', to: '/learn/research/capo-performance-research', description: '120 benchmarks + 10.7M CrUX origins' },
          ],
        },
      ],
    },
  ])

  return { megaMenuItems }
}
