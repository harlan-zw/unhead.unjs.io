import { getPathWithoutFramework } from '../../utils/urls'

export interface DocsOpportunityLink {
  label: string
  to: string
}

export interface DocsOpportunity {
  title: string
  description: string
  summary: string
  links: DocsOpportunityLink[]
}

const opportunities = {
  '/docs/schema-org/api/schema/how-to': {
    title: 'HowTo Schema Markup API and JSON-LD Example',
    description: 'Create HowTo schema markup with defineHowTo. Learn required properties, defaults, steps, images, timing fields, and TypeScript examples.',
    summary: 'Use defineHowTo() to create JSON-LD for a step-by-step guide. This API reference covers required name and step values, stable identifiers, images, timing fields, and complete TypeScript examples.',
    links: [
      { label: 'HowTo recipe', to: '/docs/schema-org/guides/recipes/how-to' },
      { label: 'WebPage schema', to: '/docs/schema-org/api/schema/webpage' },
    ],
  },
  '/docs/schema-org/api/schema/article': {
    title: 'Article Schema Markup API and JSON-LD Examples',
    description: 'Create Article schema markup with defineArticle. Learn required properties, author and publisher defaults, subtypes, and JSON-LD examples.',
    summary: 'Use defineArticle() to describe articles with valid JSON-LD. This reference explains headline, image, author, publisher, dates, article subtypes, route metadata defaults, and complete TypeScript examples.',
    links: [
      { label: 'Blog article recipe', to: '/docs/schema-org/guides/recipes/blog' },
      { label: 'WebPage schema', to: '/docs/schema-org/api/schema/webpage' },
    ],
  },
  '/docs/schema-org/api/schema/job-posting': {
    title: 'JobPosting Schema Markup API for Google Jobs',
    description: 'Create JobPosting schema markup with defineJobPosting. Learn required job fields, locations, salary, employment type, and JSON-LD examples.',
    summary: 'Use defineJobPosting() to publish complete job data as JSON-LD. This reference covers required descriptions, hiring organizations, locations and dates, plus salary, remote-work, and employment fields.',
    links: [
      { label: 'Organization schema', to: '/docs/schema-org/api/schema/organization' },
      { label: 'Identity recipe', to: '/docs/schema-org/guides/recipes/identity' },
      { label: 'LocalBusiness schema', to: '/docs/schema-org/api/schema/local-business' },
    ],
  },
  '/docs/schema-org/api/schema/question': {
    title: 'Question and Answer Schema API with JSON-LD',
    description: 'Create Question and Answer schema with defineQuestion. Learn accepted answers, stable IDs, page relationships, and TypeScript examples.',
    summary: 'Use defineQuestion() to connect a question with its accepted answer in JSON-LD. This reference covers required values, generated identifiers, WebPage relationships, aliases, and complete TypeScript examples.',
    links: [
      { label: 'FAQ schema recipe', to: '/docs/schema-org/guides/recipes/faq' },
      { label: 'WebPage schema', to: '/docs/schema-org/api/schema/webpage' },
    ],
  },
  '/docs/schema-org/api/schema/webpage': {
    title: 'WebPage Schema Markup API and JSON-LD Examples',
    description: 'Create WebPage schema markup with defineWebPage. Learn page subtypes, primary images, breadcrumbs, actions, and JSON-LD relationships.',
    summary: 'Use defineWebPage() to describe the purpose and primary content of a page. This reference covers WebPage subtypes, images, breadcrumbs, actions, dates, and relationships with other schema nodes.',
    links: [
      { label: 'Breadcrumb recipe', to: '/docs/schema-org/guides/recipes/breadcrumbs' },
      { label: 'Article schema', to: '/docs/schema-org/api/schema/article' },
    ],
  },
  '/docs/schema-org/api/schema/video': {
    title: 'VideoObject Schema Markup API and JSON-LD',
    description: 'Create VideoObject schema markup with defineVideo. Learn required video metadata, thumbnails, upload dates, clips, and JSON-LD examples.',
    summary: 'Use defineVideo() to publish complete VideoObject structured data. This reference explains names, descriptions, thumbnails, upload dates, durations, content URLs, clips, and TypeScript examples.',
    links: [
      { label: 'ImageObject schema', to: '/docs/schema-org/api/schema/image' },
      { label: 'WebPage schema', to: '/docs/schema-org/api/schema/webpage' },
    ],
  },
  '/docs/schema-org/api/composables/use-schema-org': {
    title: 'useSchemaOrg: Add Schema.org JSON-LD to Vue and Nuxt',
    description: 'Use useSchemaOrg to add reactive Schema.org JSON-LD in Vue and Nuxt. Learn node definitions, references, deduplication, and TypeScript usage.',
    summary: 'useSchemaOrg() adds typed, reactive Schema.org nodes to the document head. This guide explains node definitions, graph relationships, deduplication, framework imports, and server-rendered JSON-LD output.',
    links: [
      { label: 'Schema.org nodes', to: '/docs/schema-org/guides/core-concepts/nodes' },
      { label: 'Identity recipe', to: '/docs/schema-org/guides/recipes/identity' },
    ],
  },
  '/docs/schema-org/guides/recipes/e-commerce': {
    title: 'Ecommerce Structured Data with Product Schema',
    description: 'Add ecommerce structured data with Product, Offer, Organization, WebPage, and Breadcrumb schema. Follow a complete typed JSON-LD recipe.',
    summary: 'Build an ecommerce schema graph that connects your organization, product pages, offers, images, breadcrumbs, and website identity. This recipe shows how the nodes work together in typed JSON-LD.',
    links: [
      { label: 'Product schema', to: '/docs/schema-org/api/schema/product' },
      { label: 'Organization schema', to: '/docs/schema-org/api/schema/organization' },
      { label: 'Breadcrumb recipe', to: '/docs/schema-org/guides/recipes/breadcrumbs' },
    ],
  },
  '/docs/head/guides/plugins/canonical': {
    title: 'Canonical URL Plugin for Consistent Head Tags',
    description: 'Generate consistent canonical URLs, og:url values, and language alternates with Unhead. Learn query filtering and canonical URL customization.',
    summary: 'Use the canonical plugin to keep canonical links, Open Graph URLs, and language alternates aligned. This guide covers URL resolution, query filtering, custom canonical values, and duplicate prevention.',
    links: [
      { label: 'Template parameters', to: '/docs/head/guides/plugins/template-params' },
      { label: 'Infer SEO meta tags', to: '/docs/head/guides/plugins/infer-seo-meta-tags' },
    ],
  },
  '/docs/head/guides/core-concepts/inner-content': {
    title: 'Head Tag Inner Content for Scripts, Styles, and JSON',
    description: 'Set safe inner content for script, style, noscript, and template tags with Unhead. Learn children, innerHTML, textContent, and JSON values.',
    summary: 'Configure inline content for script, style, noscript, and template tags with Unhead. This guide compares children, innerHTML, and textContent, including safe JSON serialization and XSS handling.',
    links: [
      { label: 'useScript', to: '/docs/head/api/composables/use-script' },
      { label: 'useHeadSafe', to: '/docs/head/api/composables/use-head-safe' },
    ],
  },
} satisfies Record<string, DocsOpportunity>

export function getDocsOpportunity(path: string): DocsOpportunity | undefined {
  const canonicalPath = getPathWithoutFramework(path).replace(/\/$/, '')
  return opportunities[canonicalPath as keyof typeof opportunities]
}
