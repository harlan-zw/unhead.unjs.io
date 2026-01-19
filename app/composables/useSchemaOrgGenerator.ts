export type SchemaType
  = | 'Article'
    | 'BlogPosting'
    | 'FAQPage'
    | 'Product'
    | 'LocalBusiness'
    | 'Organization'
    | 'Person'
    | 'HowTo'
    | 'Video'
    | 'Event'

export interface SchemaField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'url' | 'number' | 'datetime' | 'select' | 'array'
  placeholder?: string
  default?: string
  help?: string
  options?: { label: string, value: string }[]
  required?: boolean
}

export interface SchemaTypeConfig {
  type: SchemaType
  label: string
  icon: string
  description: string
  fields: SchemaField[]
}

export interface SchemaOrgState {
  schemaType: SchemaType
  framework: 'typescript' | 'vue' | 'react' | 'nuxt' | 'solid-js' | 'svelte' | 'angular'
  outputMode: 'useSchemaOrg' | 'jsonld'
  fields: Record<string, string>
}

export interface SchemaPreset {
  id: string
  label: string
  icon: string
  description: string
  schemaType: SchemaType
  values: Record<string, string>
}

const frameworks = [
  { icon: 'i-logos-typescript-icon', label: 'TypeScript', slug: 'typescript', import: '@unhead/schema-org' },
  { icon: 'i-logos-vue', label: 'Vue', slug: 'vue', import: '@unhead/schema-org/vue' },
  { icon: 'i-logos-react', label: 'React', slug: 'react', import: '@unhead/schema-org/react' },
  { icon: 'i-logos-nuxt-icon', label: 'Nuxt', slug: 'nuxt', import: '#imports' },
] as const

const schemaTypes: SchemaTypeConfig[] = [
  {
    type: 'Article',
    label: 'Article',
    icon: 'i-carbon-document',
    description: 'News, scholarly, or other article',
    fields: [
      { key: 'headline', label: 'Headline', type: 'text', placeholder: 'Article headline', default: 'How to Get Started with Schema.org', required: true, help: 'Required. Max 110 characters for rich results.' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief description of the article', default: 'A comprehensive guide to implementing structured data for better SEO.' },
      { key: 'image', label: 'Image URL', type: 'url', placeholder: 'https://example.com/image.jpg', default: 'https://example.com/article-image.jpg', required: true, help: 'Required for rich results.' },
      { key: 'datePublished', label: 'Date Published', type: 'datetime', required: true, help: 'Required for rich results.' },
      { key: 'dateModified', label: 'Date Modified', type: 'datetime' },
      { key: 'authorName', label: 'Author Name', type: 'text', placeholder: 'John Doe', default: 'John Doe', required: true, help: 'Required for rich results.' },
      { key: 'authorUrl', label: 'Author URL', type: 'url', placeholder: 'https://example.com/author' },
      { key: 'publisherName', label: 'Publisher Name', type: 'text', placeholder: 'Example Publisher', default: 'My Website', required: true, help: 'Required for rich results.' },
      { key: 'publisherLogo', label: 'Publisher Logo', type: 'url', placeholder: 'https://example.com/logo.png', help: 'Recommended. 60px height or 600px width max.' },
    ],
  },
  {
    type: 'BlogPosting',
    label: 'Blog Posting',
    icon: 'i-carbon-blog',
    description: 'Blog post or article',
    fields: [
      { key: 'headline', label: 'Headline', type: 'text', placeholder: 'Blog post title', default: '10 Tips for Better Web Performance', required: true, help: 'Required. Max 110 characters for rich results.' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Brief description', default: 'Learn the essential techniques to optimize your website for speed and user experience.' },
      { key: 'image', label: 'Image URL', type: 'url', placeholder: 'https://example.com/image.jpg', default: 'https://example.com/blog-image.jpg', required: true, help: 'Required for rich results.' },
      { key: 'datePublished', label: 'Date Published', type: 'datetime', required: true, help: 'Required for rich results.' },
      { key: 'dateModified', label: 'Date Modified', type: 'datetime' },
      { key: 'authorName', label: 'Author Name', type: 'text', placeholder: 'Jane Smith', default: 'Jane Smith', required: true, help: 'Required for rich results.' },
      { key: 'authorUrl', label: 'Author URL', type: 'url', placeholder: 'https://example.com/author' },
      { key: 'wordCount', label: 'Word Count', type: 'number', placeholder: '1500', default: '1500' },
      { key: 'articleSection', label: 'Section', type: 'text', placeholder: 'Technology', default: 'Technology' },
      { key: 'keywords', label: 'Keywords', type: 'text', placeholder: 'vue, javascript, web', default: 'performance, web development, optimization' },
    ],
  },
  {
    type: 'FAQPage',
    label: 'FAQ Page',
    icon: 'i-carbon-help',
    description: 'Frequently asked questions',
    fields: [
      { key: 'question1', label: 'Question 1', type: 'text', placeholder: 'What is your product?', default: 'What is Schema.org?' },
      { key: 'answer1', label: 'Answer 1', type: 'textarea', placeholder: 'Our product is...', default: 'Schema.org is a collaborative vocabulary for structured data that helps search engines understand your content.' },
      { key: 'question2', label: 'Question 2', type: 'text', placeholder: 'How does it work?', default: 'How do I implement it?' },
      { key: 'answer2', label: 'Answer 2', type: 'textarea', placeholder: 'It works by...', default: 'You can implement Schema.org using JSON-LD, which is embedded in a script tag on your page.' },
      { key: 'question3', label: 'Question 3', type: 'text', placeholder: 'What are the benefits?' },
      { key: 'answer3', label: 'Answer 3', type: 'textarea', placeholder: 'The benefits include...' },
    ],
  },
  {
    type: 'Product',
    label: 'Product',
    icon: 'i-carbon-shopping-cart',
    description: 'E-commerce product',
    fields: [
      { key: 'name', label: 'Product Name', type: 'text', placeholder: 'Premium Headphones', default: 'Premium Wireless Headphones', required: true, help: 'Required for rich results.' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'High-quality wireless headphones...', default: 'Experience crystal-clear audio with 40-hour battery life and active noise cancellation.' },
      { key: 'image', label: 'Image URL', type: 'url', placeholder: 'https://example.com/product.jpg', default: 'https://example.com/headphones.jpg', required: true, help: 'Required for rich results.' },
      { key: 'sku', label: 'SKU', type: 'text', placeholder: 'SKU-12345', default: 'WH-1000XM5' },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'Brand Name', default: 'AudioTech' },
      { key: 'price', label: 'Price', type: 'number', placeholder: '99.99', default: '299.99', required: true, help: 'Required for rich results.' },
      { key: 'priceCurrency', label: 'Currency', type: 'text', placeholder: 'USD', default: 'USD', required: true, help: 'Required for rich results.' },
      { key: 'priceValidUntil', label: 'Price Valid Until', type: 'datetime', help: 'Recommended. Date when offer expires.' },
      { key: 'availability', label: 'Availability', type: 'select', required: true, help: 'Required for rich results.', options: [
        { label: 'In Stock', value: 'https://schema.org/InStock' },
        { label: 'Out of Stock', value: 'https://schema.org/OutOfStock' },
        { label: 'Pre-Order', value: 'https://schema.org/PreOrder' },
        { label: 'Back Order', value: 'https://schema.org/BackOrder' },
      ] },
      { key: 'offerUrl', label: 'Product Page URL', type: 'url', placeholder: 'https://example.com/product/headphones', help: 'Recommended. URL where product can be purchased.' },
      { key: 'ratingValue', label: 'Rating (1-5)', type: 'number', placeholder: '4.5', default: '4.8', help: 'Requires reviewCount to be set.' },
      { key: 'reviewCount', label: 'Review Count', type: 'number', placeholder: '150', default: '256' },
    ],
  },
  {
    type: 'LocalBusiness',
    label: 'Local Business',
    icon: 'i-carbon-store',
    description: 'Physical business location',
    fields: [
      { key: 'name', label: 'Business Name', type: 'text', placeholder: 'My Coffee Shop', default: 'The Daily Grind Coffee House', required: true },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Cozy coffee shop...', default: 'Cozy neighborhood coffee shop serving artisan coffee and fresh pastries.' },
      { key: 'image', label: 'Image URL', type: 'url', placeholder: 'https://example.com/shop.jpg', default: 'https://example.com/coffee-shop.jpg' },
      { key: 'telephone', label: 'Phone', type: 'text', placeholder: '+1-555-555-5555', default: '+1-555-COFFEE' },
      { key: 'email', label: 'Email', type: 'text', placeholder: 'contact@example.com' },
      { key: 'streetAddress', label: 'Street Address', type: 'text', placeholder: '123 Main St', default: '123 Main Street' },
      { key: 'addressLocality', label: 'City', type: 'text', placeholder: 'San Francisco', default: 'San Francisco' },
      { key: 'addressRegion', label: 'State/Region', type: 'text', placeholder: 'CA', default: 'CA' },
      { key: 'postalCode', label: 'Postal Code', type: 'text', placeholder: '94102', default: '94102' },
      { key: 'addressCountry', label: 'Country', type: 'text', placeholder: 'US', default: 'US' },
      { key: 'priceRange', label: 'Price Range', type: 'text', placeholder: '$$', default: '$$' },
    ],
  },
  {
    type: 'Organization',
    label: 'Organization',
    icon: 'i-carbon-building',
    description: 'Company or organization',
    fields: [
      { key: 'name', label: 'Name', type: 'text', placeholder: 'Acme Inc.', default: 'Acme Corporation', required: true },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Leading provider of...', default: 'Leading provider of innovative solutions for modern businesses.' },
      { key: 'url', label: 'Website', type: 'url', placeholder: 'https://example.com', default: 'https://example.com' },
      { key: 'logo', label: 'Logo URL', type: 'url', placeholder: 'https://example.com/logo.png', default: 'https://example.com/logo.png' },
      { key: 'email', label: 'Email', type: 'text', placeholder: 'contact@example.com' },
      { key: 'telephone', label: 'Phone', type: 'text', placeholder: '+1-555-555-5555' },
      { key: 'foundingDate', label: 'Founded', type: 'text', placeholder: '2020', default: '2020' },
      { key: 'sameAs', label: 'Social Links', type: 'text', placeholder: 'https://twitter.com/example, https://linkedin.com/company/example', help: 'Comma-separated URLs' },
    ],
  },
  {
    type: 'Person',
    label: 'Person',
    icon: 'i-carbon-user',
    description: 'Individual person profile',
    fields: [
      { key: 'name', label: 'Name', type: 'text', placeholder: 'John Doe', default: 'John Doe', required: true },
      { key: 'givenName', label: 'First Name', type: 'text', placeholder: 'John', default: 'John' },
      { key: 'familyName', label: 'Last Name', type: 'text', placeholder: 'Doe', default: 'Doe' },
      { key: 'jobTitle', label: 'Job Title', type: 'text', placeholder: 'Software Engineer', default: 'Software Engineer' },
      { key: 'description', label: 'Bio', type: 'textarea', placeholder: 'Experienced developer...', default: 'Experienced full-stack developer specializing in Vue.js and Node.js.' },
      { key: 'image', label: 'Photo URL', type: 'url', placeholder: 'https://example.com/photo.jpg', default: 'https://example.com/john-doe.jpg' },
      { key: 'url', label: 'Website', type: 'url', placeholder: 'https://johndoe.com' },
      { key: 'email', label: 'Email', type: 'text', placeholder: 'john@example.com' },
      { key: 'sameAs', label: 'Social Links', type: 'text', placeholder: 'https://twitter.com/johndoe', help: 'Comma-separated URLs' },
    ],
  },
  {
    type: 'HowTo',
    label: 'How-To',
    icon: 'i-carbon-list-numbered',
    description: 'Step-by-step instructions',
    fields: [
      { key: 'name', label: 'Title', type: 'text', placeholder: 'How to Make Coffee', default: 'How to Set Up a Vue.js Project', required: true },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Learn how to brew...', default: 'A step-by-step guide to creating your first Vue.js application.' },
      { key: 'image', label: 'Image URL', type: 'url', placeholder: 'https://example.com/howto.jpg' },
      { key: 'totalTime', label: 'Total Time', type: 'text', placeholder: 'PT30M', default: 'PT15M', help: 'ISO 8601 duration (e.g., PT30M for 30 minutes)' },
      { key: 'step1Name', label: 'Step 1 Name', type: 'text', placeholder: 'Gather materials', default: 'Install Node.js' },
      { key: 'step1Text', label: 'Step 1 Instructions', type: 'textarea', placeholder: 'Collect coffee beans...', default: 'Download and install Node.js from the official website.' },
      { key: 'step2Name', label: 'Step 2 Name', type: 'text', placeholder: 'Grind beans', default: 'Create project' },
      { key: 'step2Text', label: 'Step 2 Instructions', type: 'textarea', placeholder: 'Use a grinder...', default: 'Run npm create vue@latest to scaffold a new project.' },
      { key: 'step3Name', label: 'Step 3 Name', type: 'text', placeholder: 'Brew coffee', default: 'Start development' },
      { key: 'step3Text', label: 'Step 3 Instructions', type: 'textarea', placeholder: 'Pour hot water...', default: 'Run npm run dev to start the development server.' },
    ],
  },
  {
    type: 'Video',
    label: 'Video',
    icon: 'i-carbon-video',
    description: 'Video content',
    fields: [
      { key: 'name', label: 'Title', type: 'text', placeholder: 'Introduction to Vue.js', default: 'Getting Started with Vue.js 3', required: true, help: 'Required for rich results.' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Learn the basics...', default: 'Learn the fundamentals of Vue.js 3 in this comprehensive tutorial.', required: true, help: 'Required for rich results.' },
      { key: 'thumbnailUrl', label: 'Thumbnail URL', type: 'url', placeholder: 'https://example.com/thumb.jpg', default: 'https://example.com/video-thumbnail.jpg', required: true, help: 'Required for rich results.' },
      { key: 'contentUrl', label: 'Video URL', type: 'url', placeholder: 'https://example.com/video.mp4', help: 'Required: provide contentUrl or embedUrl.' },
      { key: 'embedUrl', label: 'Embed URL', type: 'url', placeholder: 'https://youtube.com/embed/xxx', help: 'Required: provide contentUrl or embedUrl.' },
      { key: 'uploadDate', label: 'Upload Date', type: 'datetime', required: true, help: 'Required for rich results.' },
      { key: 'duration', label: 'Duration', type: 'text', placeholder: 'PT10M30S', default: 'PT12M30S', help: 'Recommended. ISO 8601 duration (e.g., PT10M30S)' },
    ],
  },
  {
    type: 'Event',
    label: 'Event',
    icon: 'i-carbon-calendar',
    description: 'Event or happening',
    fields: [
      { key: 'name', label: 'Event Name', type: 'text', placeholder: 'Vue.js Conference 2025', default: 'Vue.js Conference 2025', required: true, help: 'Required for rich results.' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Annual conference for...', default: 'The premier conference for Vue.js developers featuring talks, workshops, and networking.' },
      { key: 'image', label: 'Image URL', type: 'url', placeholder: 'https://example.com/event.jpg', default: 'https://example.com/conference.jpg', help: 'Recommended for rich results.' },
      { key: 'startDate', label: 'Start Date', type: 'datetime', required: true, help: 'Required for rich results.' },
      { key: 'endDate', label: 'End Date', type: 'datetime', help: 'Recommended for rich results.' },
      { key: 'eventAttendanceMode', label: 'Attendance Mode', type: 'select', required: true, help: 'Required for rich results.', options: [
        { label: 'Offline (In-Person)', value: 'https://schema.org/OfflineEventAttendanceMode' },
        { label: 'Online', value: 'https://schema.org/OnlineEventAttendanceMode' },
        { label: 'Mixed (Hybrid)', value: 'https://schema.org/MixedEventAttendanceMode' },
      ] },
      { key: 'locationName', label: 'Venue Name', type: 'text', placeholder: 'Convention Center', default: 'Tech Convention Center', help: 'Required for offline/mixed events.' },
      { key: 'locationAddress', label: 'Venue Address', type: 'text', placeholder: '123 Event St, City', default: '123 Tech Boulevard, San Francisco, CA', help: 'Required for offline/mixed events.' },
      { key: 'onlineUrl', label: 'Online Event URL', type: 'url', placeholder: 'https://example.com/event-stream', help: 'Required for online/mixed events.' },
      { key: 'organizerName', label: 'Organizer', type: 'text', placeholder: 'Vue.js Foundation', default: 'Vue.js Foundation', help: 'Recommended for rich results.' },
      { key: 'organizerUrl', label: 'Organizer URL', type: 'url', placeholder: 'https://vuejs.org' },
      { key: 'eventStatus', label: 'Status', type: 'select', options: [
        { label: 'Scheduled', value: 'https://schema.org/EventScheduled' },
        { label: 'Cancelled', value: 'https://schema.org/EventCancelled' },
        { label: 'Postponed', value: 'https://schema.org/EventPostponed' },
        { label: 'Moved Online', value: 'https://schema.org/EventMovedOnline' },
        { label: 'Rescheduled', value: 'https://schema.org/EventRescheduled' },
      ] },
      { key: 'offerPrice', label: 'Ticket Price', type: 'number', placeholder: '99', help: 'Recommended. Use 0 for free events.' },
      { key: 'offerCurrency', label: 'Ticket Currency', type: 'text', placeholder: 'USD', default: 'USD' },
      { key: 'offerUrl', label: 'Ticket URL', type: 'url', placeholder: 'https://example.com/tickets', help: 'Recommended. Where to purchase tickets.' },
      { key: 'offerAvailability', label: 'Ticket Availability', type: 'select', options: [
        { label: 'In Stock', value: 'https://schema.org/InStock' },
        { label: 'Sold Out', value: 'https://schema.org/SoldOut' },
        { label: 'Pre-Sale', value: 'https://schema.org/PreSale' },
      ] },
      { key: 'offerValidFrom', label: 'Tickets Available From', type: 'datetime', help: 'When tickets become available.' },
    ],
  },
]

const presets: SchemaPreset[] = [
  {
    id: 'blog-post',
    label: 'Blog Post',
    icon: 'i-carbon-blog',
    description: 'Standard blog article',
    schemaType: 'BlogPosting',
    values: {
      headline: 'How to Build Better Web Apps with Vue',
      description: 'Learn the best practices for building modern, performant web applications using Vue.js and the latest tools.',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop',
      authorName: 'John Doe',
      authorUrl: 'https://example.com/authors/john',
      articleSection: 'Technology',
      keywords: 'vue, javascript, web development',
      wordCount: '1500',
    },
  },
  {
    id: 'product',
    label: 'E-commerce Product',
    icon: 'i-carbon-shopping-cart',
    description: 'Product with pricing',
    schemaType: 'Product',
    values: {
      name: 'Premium Wireless Headphones',
      description: 'Experience crystal-clear audio with 40-hour battery life and active noise cancellation.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=630&fit=crop',
      brand: 'AudioTech',
      sku: 'AT-WH-001',
      price: '199.99',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      ratingValue: '4.8',
      reviewCount: '256',
    },
  },
  {
    id: 'local-business',
    label: 'Coffee Shop',
    icon: 'i-carbon-cafe',
    description: 'Local business listing',
    schemaType: 'LocalBusiness',
    values: {
      name: 'The Daily Grind Coffee House',
      description: 'Cozy neighborhood coffee shop serving artisan coffee and fresh pastries.',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&h=630&fit=crop',
      telephone: '+1-555-COFFEE',
      streetAddress: '123 Main Street',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94102',
      addressCountry: 'US',
      priceRange: '$$',
    },
  },
  {
    id: 'faq',
    label: 'FAQ Section',
    icon: 'i-carbon-help',
    description: 'Questions & answers',
    schemaType: 'FAQPage',
    values: {
      question1: 'What is Schema.org markup?',
      answer1: 'Schema.org is a collaborative vocabulary for structured data markup that helps search engines understand your content better.',
      question2: 'Why should I use structured data?',
      answer2: 'Structured data helps search engines display rich results, improving visibility and click-through rates.',
      question3: 'How do I implement Schema.org in Vue?',
      answer3: 'You can use the useSchemaOrg composable from @unhead/schema-org to easily add structured data to your Vue applications.',
    },
  },
]

export function useSchemaOrgGenerator() {
  // Get initial defaults for Article
  const initialDefaults: Record<string, string> = {}
  const articleConfig = schemaTypes.find(s => s.type === 'Article')
  if (articleConfig) {
    for (const field of articleConfig.fields) {
      if (field.default)
        initialDefaults[field.key] = field.default
    }
  }

  const state = reactive<SchemaOrgState>({
    schemaType: 'Article',
    framework: 'vue',
    outputMode: 'useSchemaOrg',
    fields: initialDefaults,
  })

  const selectedFramework = computed(() => {
    return frameworks.find(f => f.slug === state.framework) || frameworks[0]
  })

  const currentSchemaConfig = computed(() => {
    return schemaTypes.find(s => s.type === state.schemaType) || schemaTypes[0]
  })

  const hasAnyValue = computed(() => {
    return Object.values(state.fields).some(v => v && v.trim())
  })

  function generateJsonLd(): Record<string, unknown> {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': state.schemaType,
    }

    const fields = state.fields

    switch (state.schemaType) {
      case 'Article':
      case 'BlogPosting':
        if (fields.headline)
          schema.headline = fields.headline
        if (fields.description)
          schema.description = fields.description
        if (fields.image)
          schema.image = fields.image
        if (fields.datePublished)
          schema.datePublished = fields.datePublished
        if (fields.dateModified)
          schema.dateModified = fields.dateModified
        if (fields.wordCount)
          schema.wordCount = Number.parseInt(fields.wordCount)
        if (fields.articleSection)
          schema.articleSection = fields.articleSection
        if (fields.keywords)
          schema.keywords = fields.keywords
        if (fields.authorName) {
          schema.author = {
            '@type': 'Person',
            'name': fields.authorName,
            ...(fields.authorUrl && { url: fields.authorUrl }),
          }
        }
        if (fields.publisherName) {
          schema.publisher = {
            '@type': 'Organization',
            'name': fields.publisherName,
            ...(fields.publisherLogo && { logo: { '@type': 'ImageObject', 'url': fields.publisherLogo } }),
          }
        }
        break

      case 'FAQPage':
        const mainEntity: unknown[] = []
        for (let i = 1; i <= 10; i++) {
          const q = fields[`question${i}`]
          const a = fields[`answer${i}`]
          if (q && a) {
            mainEntity.push({
              '@type': 'Question',
              'name': q,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': a,
              },
            })
          }
        }
        if (mainEntity.length > 0)
          schema.mainEntity = mainEntity
        break

      case 'Product':
        if (fields.name)
          schema.name = fields.name
        if (fields.description)
          schema.description = fields.description
        if (fields.image)
          schema.image = fields.image
        if (fields.sku)
          schema.sku = fields.sku
        if (fields.brand)
          schema.brand = { '@type': 'Brand', 'name': fields.brand }
        if (fields.price || fields.availability) {
          schema.offers = {
            '@type': 'Offer',
            ...(fields.price && { price: fields.price }),
            ...(fields.priceCurrency && { priceCurrency: fields.priceCurrency }),
            ...(fields.availability && { availability: fields.availability }),
            ...(fields.priceValidUntil && { priceValidUntil: fields.priceValidUntil }),
            ...(fields.offerUrl && { url: fields.offerUrl }),
          }
        }
        if (fields.ratingValue) {
          schema.aggregateRating = {
            '@type': 'AggregateRating',
            'ratingValue': fields.ratingValue,
            ...(fields.reviewCount && { reviewCount: fields.reviewCount }),
          }
        }
        break

      case 'LocalBusiness':
        if (fields.name)
          schema.name = fields.name
        if (fields.description)
          schema.description = fields.description
        if (fields.image)
          schema.image = fields.image
        if (fields.telephone)
          schema.telephone = fields.telephone
        if (fields.email)
          schema.email = fields.email
        if (fields.priceRange)
          schema.priceRange = fields.priceRange
        if (fields.streetAddress || fields.addressLocality) {
          schema.address = {
            '@type': 'PostalAddress',
            ...(fields.streetAddress && { streetAddress: fields.streetAddress }),
            ...(fields.addressLocality && { addressLocality: fields.addressLocality }),
            ...(fields.addressRegion && { addressRegion: fields.addressRegion }),
            ...(fields.postalCode && { postalCode: fields.postalCode }),
            ...(fields.addressCountry && { addressCountry: fields.addressCountry }),
          }
        }
        break

      case 'Organization':
        if (fields.name)
          schema.name = fields.name
        if (fields.description)
          schema.description = fields.description
        if (fields.url)
          schema.url = fields.url
        if (fields.logo)
          schema.logo = fields.logo
        if (fields.email)
          schema.email = fields.email
        if (fields.telephone)
          schema.telephone = fields.telephone
        if (fields.foundingDate)
          schema.foundingDate = fields.foundingDate
        if (fields.sameAs)
          schema.sameAs = fields.sameAs.split(',').map(s => s.trim()).filter(Boolean)
        break

      case 'Person':
        if (fields.name)
          schema.name = fields.name
        if (fields.givenName)
          schema.givenName = fields.givenName
        if (fields.familyName)
          schema.familyName = fields.familyName
        if (fields.jobTitle)
          schema.jobTitle = fields.jobTitle
        if (fields.description)
          schema.description = fields.description
        if (fields.image)
          schema.image = fields.image
        if (fields.url)
          schema.url = fields.url
        if (fields.email)
          schema.email = fields.email
        if (fields.sameAs)
          schema.sameAs = fields.sameAs.split(',').map(s => s.trim()).filter(Boolean)
        break

      case 'HowTo':
        if (fields.name)
          schema.name = fields.name
        if (fields.description)
          schema.description = fields.description
        if (fields.image)
          schema.image = fields.image
        if (fields.totalTime)
          schema.totalTime = fields.totalTime
        const steps: unknown[] = []
        for (let i = 1; i <= 10; i++) {
          const name = fields[`step${i}Name`]
          const text = fields[`step${i}Text`]
          if (name || text) {
            steps.push({
              '@type': 'HowToStep',
              ...(name && { name }),
              ...(text && { text }),
            })
          }
        }
        if (steps.length > 0)
          schema.step = steps
        break

      case 'Video':
        if (fields.name)
          schema.name = fields.name
        if (fields.description)
          schema.description = fields.description
        if (fields.thumbnailUrl)
          schema.thumbnailUrl = fields.thumbnailUrl
        if (fields.contentUrl)
          schema.contentUrl = fields.contentUrl
        if (fields.embedUrl)
          schema.embedUrl = fields.embedUrl
        if (fields.uploadDate)
          schema.uploadDate = fields.uploadDate
        if (fields.duration)
          schema.duration = fields.duration
        break

      case 'Event':
        if (fields.name)
          schema.name = fields.name
        if (fields.description)
          schema.description = fields.description
        if (fields.image)
          schema.image = fields.image
        if (fields.startDate)
          schema.startDate = fields.startDate
        if (fields.endDate)
          schema.endDate = fields.endDate
        if (fields.eventStatus)
          schema.eventStatus = fields.eventStatus
        if (fields.eventAttendanceMode)
          schema.eventAttendanceMode = fields.eventAttendanceMode
        // Handle location based on attendance mode
        const isOnline = fields.eventAttendanceMode === 'https://schema.org/OnlineEventAttendanceMode'
        const isMixed = fields.eventAttendanceMode === 'https://schema.org/MixedEventAttendanceMode'
        if (isOnline && fields.onlineUrl) {
          schema.location = {
            '@type': 'VirtualLocation',
            'url': fields.onlineUrl,
          }
        }
        else if (isMixed) {
          const locations: unknown[] = []
          if (fields.locationName || fields.locationAddress) {
            locations.push({
              '@type': 'Place',
              ...(fields.locationName && { name: fields.locationName }),
              ...(fields.locationAddress && { address: fields.locationAddress }),
            })
          }
          if (fields.onlineUrl) {
            locations.push({
              '@type': 'VirtualLocation',
              'url': fields.onlineUrl,
            })
          }
          if (locations.length > 0)
            schema.location = locations
        }
        else if (fields.locationName || fields.locationAddress) {
          schema.location = {
            '@type': 'Place',
            ...(fields.locationName && { name: fields.locationName }),
            ...(fields.locationAddress && { address: fields.locationAddress }),
          }
        }
        if (fields.organizerName) {
          schema.organizer = {
            '@type': 'Organization',
            'name': fields.organizerName,
            ...(fields.organizerUrl && { url: fields.organizerUrl }),
          }
        }
        // Add offers for tickets
        if (fields.offerPrice !== undefined || fields.offerUrl || fields.offerAvailability) {
          schema.offers = {
            '@type': 'Offer',
            ...(fields.offerPrice && { price: fields.offerPrice }),
            ...(fields.offerCurrency && { priceCurrency: fields.offerCurrency }),
            ...(fields.offerUrl && { url: fields.offerUrl }),
            ...(fields.offerAvailability && { availability: fields.offerAvailability }),
            ...(fields.offerValidFrom && { validFrom: fields.offerValidFrom }),
          }
        }
        break
    }

    return schema
  }

  function generateUseSchemaOrg(): string {
    const fields = state.fields
    const lines: string[] = []

    const typeMethodMap: Record<SchemaType, string> = {
      Article: 'defineArticle',
      BlogPosting: 'defineBlogPosting',
      FAQPage: 'defineFAQPage',
      Product: 'defineProduct',
      LocalBusiness: 'defineLocalBusiness',
      Organization: 'defineOrganization',
      Person: 'definePerson',
      HowTo: 'defineHowTo',
      Video: 'defineVideo',
      Event: 'defineEvent',
    }

    const method = typeMethodMap[state.schemaType]

    switch (state.schemaType) {
      case 'Article':
      case 'BlogPosting':
        if (fields.headline)
          lines.push(`  headline: '${escapeString(fields.headline)}',`)
        if (fields.description)
          lines.push(`  description: '${escapeString(fields.description)}',`)
        if (fields.image)
          lines.push(`  image: '${escapeString(fields.image)}',`)
        if (fields.datePublished)
          lines.push(`  datePublished: '${fields.datePublished}',`)
        if (fields.dateModified)
          lines.push(`  dateModified: '${fields.dateModified}',`)
        if (fields.wordCount)
          lines.push(`  wordCount: ${fields.wordCount},`)
        if (fields.articleSection)
          lines.push(`  articleSection: '${escapeString(fields.articleSection)}',`)
        if (fields.keywords)
          lines.push(`  keywords: '${escapeString(fields.keywords)}',`)
        if (fields.authorName) {
          lines.push(`  author: {`)
          lines.push(`    name: '${escapeString(fields.authorName)}',`)
          if (fields.authorUrl)
            lines.push(`    url: '${escapeString(fields.authorUrl)}',`)
          lines.push(`  },`)
        }
        if (fields.publisherName) {
          lines.push(`  publisher: {`)
          lines.push(`    name: '${escapeString(fields.publisherName)}',`)
          if (fields.publisherLogo)
            lines.push(`    logo: '${escapeString(fields.publisherLogo)}',`)
          lines.push(`  },`)
        }
        break

      case 'FAQPage':
        const questions: string[] = []
        for (let i = 1; i <= 10; i++) {
          const q = fields[`question${i}`]
          const a = fields[`answer${i}`]
          if (q && a) {
            questions.push(`    {`)
            questions.push(`      question: '${escapeString(q)}',`)
            questions.push(`      answer: '${escapeString(a)}',`)
            questions.push(`    },`)
          }
        }
        if (questions.length > 0) {
          lines.push(`  questions: [`)
          lines.push(...questions)
          lines.push(`  ],`)
        }
        break

      case 'Product':
        if (fields.name)
          lines.push(`  name: '${escapeString(fields.name)}',`)
        if (fields.description)
          lines.push(`  description: '${escapeString(fields.description)}',`)
        if (fields.image)
          lines.push(`  image: '${escapeString(fields.image)}',`)
        if (fields.sku)
          lines.push(`  sku: '${escapeString(fields.sku)}',`)
        if (fields.brand)
          lines.push(`  brand: '${escapeString(fields.brand)}',`)
        if (fields.price || fields.availability) {
          lines.push(`  offers: {`)
          if (fields.price)
            lines.push(`    price: ${fields.price},`)
          if (fields.priceCurrency)
            lines.push(`    priceCurrency: '${fields.priceCurrency}',`)
          if (fields.availability)
            lines.push(`    availability: '${fields.availability}',`)
          if (fields.priceValidUntil)
            lines.push(`    priceValidUntil: '${fields.priceValidUntil}',`)
          if (fields.offerUrl)
            lines.push(`    url: '${escapeString(fields.offerUrl)}',`)
          lines.push(`  },`)
        }
        if (fields.ratingValue) {
          lines.push(`  aggregateRating: {`)
          lines.push(`    ratingValue: ${fields.ratingValue},`)
          if (fields.reviewCount)
            lines.push(`    reviewCount: ${fields.reviewCount},`)
          lines.push(`  },`)
        }
        break

      case 'LocalBusiness':
        if (fields.name)
          lines.push(`  name: '${escapeString(fields.name)}',`)
        if (fields.description)
          lines.push(`  description: '${escapeString(fields.description)}',`)
        if (fields.image)
          lines.push(`  image: '${escapeString(fields.image)}',`)
        if (fields.telephone)
          lines.push(`  telephone: '${escapeString(fields.telephone)}',`)
        if (fields.email)
          lines.push(`  email: '${escapeString(fields.email)}',`)
        if (fields.priceRange)
          lines.push(`  priceRange: '${escapeString(fields.priceRange)}',`)
        if (fields.streetAddress || fields.addressLocality) {
          lines.push(`  address: {`)
          if (fields.streetAddress)
            lines.push(`    streetAddress: '${escapeString(fields.streetAddress)}',`)
          if (fields.addressLocality)
            lines.push(`    addressLocality: '${escapeString(fields.addressLocality)}',`)
          if (fields.addressRegion)
            lines.push(`    addressRegion: '${escapeString(fields.addressRegion)}',`)
          if (fields.postalCode)
            lines.push(`    postalCode: '${escapeString(fields.postalCode)}',`)
          if (fields.addressCountry)
            lines.push(`    addressCountry: '${escapeString(fields.addressCountry)}',`)
          lines.push(`  },`)
        }
        break

      case 'Organization':
        if (fields.name)
          lines.push(`  name: '${escapeString(fields.name)}',`)
        if (fields.description)
          lines.push(`  description: '${escapeString(fields.description)}',`)
        if (fields.url)
          lines.push(`  url: '${escapeString(fields.url)}',`)
        if (fields.logo)
          lines.push(`  logo: '${escapeString(fields.logo)}',`)
        if (fields.email)
          lines.push(`  email: '${escapeString(fields.email)}',`)
        if (fields.telephone)
          lines.push(`  telephone: '${escapeString(fields.telephone)}',`)
        if (fields.foundingDate)
          lines.push(`  foundingDate: '${escapeString(fields.foundingDate)}',`)
        if (fields.sameAs) {
          const urls = fields.sameAs.split(',').map(s => `'${escapeString(s.trim())}'`).filter(Boolean)
          lines.push(`  sameAs: [${urls.join(', ')}],`)
        }
        break

      case 'Person':
        if (fields.name)
          lines.push(`  name: '${escapeString(fields.name)}',`)
        if (fields.givenName)
          lines.push(`  givenName: '${escapeString(fields.givenName)}',`)
        if (fields.familyName)
          lines.push(`  familyName: '${escapeString(fields.familyName)}',`)
        if (fields.jobTitle)
          lines.push(`  jobTitle: '${escapeString(fields.jobTitle)}',`)
        if (fields.description)
          lines.push(`  description: '${escapeString(fields.description)}',`)
        if (fields.image)
          lines.push(`  image: '${escapeString(fields.image)}',`)
        if (fields.url)
          lines.push(`  url: '${escapeString(fields.url)}',`)
        if (fields.email)
          lines.push(`  email: '${escapeString(fields.email)}',`)
        if (fields.sameAs) {
          const urls = fields.sameAs.split(',').map(s => `'${escapeString(s.trim())}'`).filter(Boolean)
          lines.push(`  sameAs: [${urls.join(', ')}],`)
        }
        break

      case 'HowTo':
        if (fields.name)
          lines.push(`  name: '${escapeString(fields.name)}',`)
        if (fields.description)
          lines.push(`  description: '${escapeString(fields.description)}',`)
        if (fields.image)
          lines.push(`  image: '${escapeString(fields.image)}',`)
        if (fields.totalTime)
          lines.push(`  totalTime: '${fields.totalTime}',`)
        const stepsCode: string[] = []
        for (let i = 1; i <= 10; i++) {
          const name = fields[`step${i}Name`]
          const text = fields[`step${i}Text`]
          if (name || text) {
            stepsCode.push(`    {`)
            if (name)
              stepsCode.push(`      name: '${escapeString(name)}',`)
            if (text)
              stepsCode.push(`      text: '${escapeString(text)}',`)
            stepsCode.push(`    },`)
          }
        }
        if (stepsCode.length > 0) {
          lines.push(`  step: [`)
          lines.push(...stepsCode)
          lines.push(`  ],`)
        }
        break

      case 'Video':
        if (fields.name)
          lines.push(`  name: '${escapeString(fields.name)}',`)
        if (fields.description)
          lines.push(`  description: '${escapeString(fields.description)}',`)
        if (fields.thumbnailUrl)
          lines.push(`  thumbnailUrl: '${escapeString(fields.thumbnailUrl)}',`)
        if (fields.contentUrl)
          lines.push(`  contentUrl: '${escapeString(fields.contentUrl)}',`)
        if (fields.embedUrl)
          lines.push(`  embedUrl: '${escapeString(fields.embedUrl)}',`)
        if (fields.uploadDate)
          lines.push(`  uploadDate: '${fields.uploadDate}',`)
        if (fields.duration)
          lines.push(`  duration: '${fields.duration}',`)
        break

      case 'Event':
        if (fields.name)
          lines.push(`  name: '${escapeString(fields.name)}',`)
        if (fields.description)
          lines.push(`  description: '${escapeString(fields.description)}',`)
        if (fields.image)
          lines.push(`  image: '${escapeString(fields.image)}',`)
        if (fields.startDate)
          lines.push(`  startDate: '${fields.startDate}',`)
        if (fields.endDate)
          lines.push(`  endDate: '${fields.endDate}',`)
        if (fields.eventStatus)
          lines.push(`  eventStatus: '${fields.eventStatus}',`)
        if (fields.eventAttendanceMode)
          lines.push(`  eventAttendanceMode: '${fields.eventAttendanceMode}',`)
        // Handle location based on attendance mode
        const isOnlineEvent = fields.eventAttendanceMode === 'https://schema.org/OnlineEventAttendanceMode'
        const isMixedEvent = fields.eventAttendanceMode === 'https://schema.org/MixedEventAttendanceMode'
        if (isOnlineEvent && fields.onlineUrl) {
          lines.push(`  location: {`)
          lines.push(`    '@type': 'VirtualLocation',`)
          lines.push(`    url: '${escapeString(fields.onlineUrl)}',`)
          lines.push(`  },`)
        }
        else if (isMixedEvent && (fields.locationName || fields.locationAddress || fields.onlineUrl)) {
          lines.push(`  location: [`)
          if (fields.locationName || fields.locationAddress) {
            lines.push(`    {`)
            lines.push(`      '@type': 'Place',`)
            if (fields.locationName)
              lines.push(`      name: '${escapeString(fields.locationName)}',`)
            if (fields.locationAddress)
              lines.push(`      address: '${escapeString(fields.locationAddress)}',`)
            lines.push(`    },`)
          }
          if (fields.onlineUrl) {
            lines.push(`    {`)
            lines.push(`      '@type': 'VirtualLocation',`)
            lines.push(`      url: '${escapeString(fields.onlineUrl)}',`)
            lines.push(`    },`)
          }
          lines.push(`  ],`)
        }
        else if (fields.locationName || fields.locationAddress) {
          lines.push(`  location: {`)
          if (fields.locationName)
            lines.push(`    name: '${escapeString(fields.locationName)}',`)
          if (fields.locationAddress)
            lines.push(`    address: '${escapeString(fields.locationAddress)}',`)
          lines.push(`  },`)
        }
        if (fields.organizerName) {
          lines.push(`  organizer: {`)
          lines.push(`    name: '${escapeString(fields.organizerName)}',`)
          if (fields.organizerUrl)
            lines.push(`    url: '${escapeString(fields.organizerUrl)}',`)
          lines.push(`  },`)
        }
        // Add offers for tickets
        if (fields.offerPrice !== undefined || fields.offerUrl || fields.offerAvailability) {
          lines.push(`  offers: {`)
          if (fields.offerPrice)
            lines.push(`    price: ${fields.offerPrice},`)
          if (fields.offerCurrency)
            lines.push(`    priceCurrency: '${fields.offerCurrency}',`)
          if (fields.offerUrl)
            lines.push(`    url: '${escapeString(fields.offerUrl)}',`)
          if (fields.offerAvailability)
            lines.push(`    availability: '${fields.offerAvailability}',`)
          if (fields.offerValidFrom)
            lines.push(`    validFrom: '${fields.offerValidFrom}',`)
          lines.push(`  },`)
        }
        break
    }

    if (lines.length === 0)
      return '// Fill in the form to generate code'

    const importStatement = state.framework === 'nuxt'
      ? ''
      : `import { useSchemaOrg, ${method} } from '${selectedFramework.value.import}'\n\n`

    const indentedLines = lines.map(line => `  ${line}`).join('\n')
    return `${importStatement}useSchemaOrg([\n  ${method}({\n${indentedLines}\n  }),\n])`
  }

  const generatedCode = computed(() => {
    if (state.outputMode === 'useSchemaOrg')
      return generateUseSchemaOrg()
    return JSON.stringify(generateJsonLd(), null, 2)
  })

  const codeLanguage = computed(() => {
    return state.outputMode === 'jsonld' ? 'json' : 'ts'
  })

  const jsonLdPreview = computed(() => {
    return JSON.stringify(generateJsonLd(), null, 2)
  })

  function reset() {
    state.fields = {}
  }

  function applyPreset(preset: SchemaPreset) {
    state.schemaType = preset.schemaType
    state.fields = { ...preset.values }
  }

  function setSchemaType(type: SchemaType) {
    state.schemaType = type
    const config = schemaTypes.find(s => s.type === type)
    const defaults: Record<string, string> = {}
    if (config) {
      for (const field of config.fields) {
        if (field.default)
          defaults[field.key] = field.default
      }
    }
    state.fields = defaults
  }

  return {
    state,
    frameworks,
    schemaTypes,
    presets,
    selectedFramework,
    currentSchemaConfig,
    hasAnyValue,
    generatedCode,
    codeLanguage,
    jsonLdPreview,
    reset,
    applyPreset,
    setSchemaType,
  }
}

function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\n/g, '\\n')
}
