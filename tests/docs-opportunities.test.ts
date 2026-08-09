import { describe, expect, it } from 'vitest'
import { getDocsOpportunity } from '../app/utils/docs-opportunities'

describe('getDocsOpportunity', () => {
  it('returns intent-matched metadata for high-impression schema pages', () => {
    const cases = [
      ['/docs/schema-org/api/schema/how-to', 'HowTo Schema Markup'],
      ['/docs/schema-org/api/schema/article', 'Article Schema Markup'],
      ['/docs/schema-org/api/schema/job-posting', 'JobPosting Schema Markup'],
      ['/docs/schema-org/api/schema/question', 'Question and Answer Schema'],
      ['/docs/schema-org/api/schema/webpage', 'WebPage Schema Markup'],
      ['/docs/schema-org/api/schema/video', 'VideoObject Schema Markup'],
      ['/docs/schema-org/api/composables/use-schema-org', 'useSchemaOrg'],
      ['/docs/schema-org/guides/recipes/e-commerce', 'Ecommerce Structured Data'],
      ['/docs/head/guides/plugins/canonical', 'Canonical URL Plugin'],
      ['/docs/head/guides/core-concepts/inner-content', 'Head Tag Inner Content'],
    ] as const

    for (const [path, titlePrefix] of cases) {
      const opportunity = getDocsOpportunity(path)
      expect(opportunity?.title.startsWith(titlePrefix)).toBe(true)
      expect(opportunity?.description.length).toBeLessThanOrEqual(160)
      expect(opportunity?.summary.length).toBeGreaterThan(80)
      expect(opportunity?.links.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('uses the same canonical opportunity for framework fallback routes', () => {
    expect(getDocsOpportunity('/docs/vue/schema-org/api/schema/how-to'))
      .toEqual(getDocsOpportunity('/docs/schema-org/api/schema/how-to'))
  })

  it('does not decorate unrelated documentation', () => {
    expect(getDocsOpportunity('/docs/head/api/composables/use-head')).toBeUndefined()
  })
})
