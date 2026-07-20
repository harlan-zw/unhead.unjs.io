# Q1 2026 SEO Actions - Implementation Plan

> All actions ordered by priority. Schema content lives upstream in `unjs/unhead` (branch `v3`), site config lives in this repo.

---

## Action 1: Title Tag Template (this repo)

**Impact: High | Effort: Low | Files: 1**

The docs page at `app/pages/docs/[...slug].vue` line 27-29 sets:
```ts
useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
  titleTemplate: '%s %separator %siteName',
})
```

Titles come from content frontmatter `title` field. Schema pages have no frontmatter so title auto-generates from the first heading (e.g., `## Schema.org LocalBusiness` becomes `Schema.org LocalBusiness`).

**Current rendered titles:**
- `Schema.org LocalBusiness · Unhead`
- `Schema.org HowTo · Unhead`

**Problem:** These are API-reference style, not solution-oriented. Searchers want guides.

### Plan

No change needed to the template itself (`%s · Unhead` is fine). The fix is adding frontmatter to each schema page upstream (Action 5). The title template works correctly.

However, the overview page ranking for "vuejs seo" at pos 3.2 with 0.2% CTR has title `Welcome To Unhead · Unhead` which doesn't match search intent at all.

**Fix in upstream repo** (`unjs/unhead`, branch `v3`):

File: `docs/head/1.guides/0.get-started/0.overview.md`
```yaml
---
title: "Welcome To Unhead"
description: "Get started with Unhead, the framework-agnostic head management library for web applications"
---
```

Change to:
```yaml
---
title: "Unhead - Head Management for Vue, React, Svelte & More"
description: "Framework-agnostic library for managing HTML head tags - titles, meta tags, scripts, and structured data. Works with Vue, React, Svelte, Solid, Angular."
---
```

---

## Action 2: Schema Page Meta Descriptions (upstream: unjs/unhead)

**Impact: High | Effort: Low | Files: 7**

All 7 schema type pages have NO frontmatter, so no `description` meta tag is set. Add frontmatter with SEO-optimized title + description to each.

### Files to edit

All in `docs/schema-org/5.api/9.schema/` in the `unjs/unhead` repo (branch `v3`):

#### `local-business.md`
```yaml
---
title: "LocalBusiness Schema - JSON-LD Guide & Examples"
description: "Implement LocalBusiness structured data with Unhead. Copy-paste JSON-LD examples, required properties, subtypes (Dentist, Restaurant), and rich result setup."
---
```

#### `how-to.md`
```yaml
---
title: "HowTo Schema - JSON-LD Guide & Examples"
description: "Add HowTo structured data to your site with Unhead. Step-by-step JSON-LD examples, required properties, and Google rich result guidance."
---
```

#### `job-posting.md`
```yaml
---
title: "JobPosting Schema - JSON-LD Guide & Examples"
description: "Implement JobPosting structured data with Unhead. Copy-paste JSON-LD examples, required fields for Google Jobs, and validation tips."
---
```

#### `item-list.md`
```yaml
---
title: "ItemList Schema - JSON-LD Guide & Examples"
description: "Add ItemList structured data with Unhead. JSON-LD examples for carousels, ranked lists, and product collections with rich result support."
---
```

#### `article.md`
```yaml
---
title: "Article Schema - JSON-LD Guide & Examples"
description: "Implement Article structured data with Unhead. JSON-LD examples for BlogPosting, NewsArticle, TechArticle with datePublished and author markup."
---
```

#### `organization.md`
```yaml
---
title: "Organization Schema - JSON-LD Guide & Examples"
description: "Add Organization structured data with Unhead. JSON-LD examples for company identity, logo, sameAs social profiles, and knowledge panel setup."
---
```

#### `software-app.md`
```yaml
---
title: "SoftwareApplication Schema - JSON-LD Guide & Examples"
description: "Implement SoftwareApplication structured data with Unhead. JSON-LD examples for app listings, ratings, pricing, and Google rich results."
---
```

---

## Action 3: Schema Page Intro Sections (upstream: unjs/unhead)

**Impact: High | Effort: Medium | Files: 7**

Each schema page currently starts with the API signature. Add a search-intent-matching intro before the existing content.

### Template for each page

Insert after frontmatter, before the existing `## Schema.org X` heading:

```markdown
## What is [Type] Schema?

[1-2 sentence plain English explanation of what this schema type does and why you'd use it.]

### Quick JSON-LD Example

Here's what [Type] structured data looks like as raw JSON-LD:

```json
{
  "@context": "https://schema.org",
  "@type": "[Type]",
  ...minimal realistic example...
}
```

With Unhead, you can generate this using the `define[Type]()` composable:

[existing code example]

---
```

### Specific intros to write

#### LocalBusiness
> LocalBusiness schema tells search engines about a physical business location - its name, address, opening hours, and services. It powers Google's local business panels, Maps listings, and "near me" search results. Use a specific subtype like `Dentist`, `Restaurant`, or `ProfessionalService` for better visibility.

#### HowTo
> HowTo schema marks up step-by-step instructions so Google can display them as rich results with expandable steps. Use it for tutorials, guides, DIY instructions, and recipes-style content.

#### JobPosting
> JobPosting schema enables your job listings to appear in Google Jobs search results with salary, location, and application details. Required for Google Jobs integration.

#### ItemList
> ItemList schema represents an ordered or unordered list of items. Google uses it to display carousel rich results for recipes, products, courses, and other list-based content.

#### Article
> Article schema identifies written content like blog posts, news articles, and technical documentation. It helps search engines understand authorship, publish dates, and content type for rich results.

#### Organization
> Organization schema establishes your company or brand identity for search engines. It powers Google's Knowledge Panel, connects social profiles via sameAs, and serves as the publisher/author identity for other schema types.

#### SoftwareApplication
> SoftwareApplication schema describes a software product with its features, pricing, ratings, and platform compatibility. It enables rich result display in Google search with star ratings and pricing info.

---

## Action 4: Schema Generator Cross-links (upstream: unjs/unhead)

**Impact: Low | Effort: Low | Files: 7**

Add a callout at the top of each schema type page linking to the generator tool.

### Template

Add after the intro section on each schema page:

```markdown
::tip{icon="i-heroicons-wrench-screwdriver"}
Use the [Schema.org Generator](/tools/schema-generator) to build your structured data visually.
::
```

---

## Action 5: React Helmet Migration Freshness (upstream: unjs/unhead)

**Impact: Medium | Effort: Low | Files: 1**

File: `docs/0.react/head/guides/0.get-started/migrate-from-react-helmet.md`

### Changes

1. Update frontmatter description for 2026:
```yaml
---
title: "Migrating from React Helmet to Unhead"
description: "Replace React Helmet with Unhead - 60% smaller bundle, React 19 native hoisting, automatic Capo.js tag sorting, and full TypeScript support."
---
```

2. Add to the "Why Migrate?" section (after the existing bullet list):
```markdown
- Automatic [Capo.js-based tag sorting](/docs/head/guides/core-concepts/positions) for optimal page load performance
```

> Note: Gemini suggested "React 19 native hoisting" as a value prop but no evidence of this in unhead docs. Don't claim it.

3. Update the bundle size comparison to be more prominent - move it above the bullet list and format as a callout:
```markdown
::tip{icon="i-heroicons-scale"}
**Bundle size comparison:**
React Helmet: 26.6 kB (9.2 kB gzipped) → Unhead: 10.7 kB (4.5 kB gzipped) — **60% smaller**
::
```

---

## Action 6: Overview Page Title Fix (upstream: unjs/unhead)

**Impact: Medium | Effort: Low | Files: 1**

Covered in Action 1. The overview page at pos 3.2 for "vuejs seo" has title "Welcome To Unhead" which doesn't signal relevance to the query. See Action 1 for the fix.

---

## Action 7: /v2 Noindex (this repo)

**Impact: Low | Effort: Low | Files: 1**

File: `app/pages/docs/[...slug].vue` lines 32-36 already handle this:
```ts
if (isV2) {
  useRobotsRule(false)
  defineOgImage(false)
}
```

**Already done.** V2 pages are noindexed and have canonical pointing to v3 equivalents (line 47). No action needed.

---

## Action 8: Schema Generator SEO (this repo)

**Impact: Medium | Effort: Low | Files: 1**

File: `app/pages/tools/schema-generator.vue` line 19-24:
```ts
useSeoMeta({
  title: 'Schema.org Generator - Generate useSchemaOrg Code',
  description: 'Free Schema.org markup generator for Vue, React, Nuxt, and more. Generate useSchemaOrg() code with JSON-LD preview.',
})
```

### Changes

Current title is developer-focused ("useSchemaOrg Code"). Searchers for "schema org generator" want a general tool.

```ts
useSeoMeta({
  title: 'Schema.org Generator - Free Structured Data Markup Tool',
  description: 'Free Schema.org JSON-LD generator. Build LocalBusiness, Article, HowTo, FAQ, and Product structured data visually. Export as useSchemaOrg() or raw JSON-LD.',
  ogTitle: 'Schema.org Generator | Unhead',
  ogDescription: 'Generate Schema.org structured data visually. Export as JSON-LD or useSchemaOrg() composable code.',
})
```

---

## Summary

| # | Action | Repo | Files | Status |
|---|--------|------|-------|--------|
| 1 | Overview page title fix | upstream | 1 | Todo |
| 2 | Schema page frontmatter (title + desc) | upstream | 7 | Todo |
| 3 | Schema page intro sections | upstream | 7 | Todo |
| 4 | Schema generator cross-links | upstream | 7 | Todo |
| 5 | React Helmet migration freshness | upstream | 1 | Todo |
| 6 | Overview page title (same as #1) | upstream | - | See #1 |
| 7 | /v2 noindex | this repo | - | Already done |
| 8 | Schema generator SEO title | this repo | 1 | Todo |

**This repo changes:** Action 8 only (1 file)
**Upstream changes (unjs/unhead v3):** Actions 1-5 (8 unique files)
