# Open Graph Completeness Research Plan

Original research: **"Your Social Cards Are Broken: OG Tag Completeness Across 660K Sites"**

The state-of-head article audits `<title>` and `<meta name="description">` but doesn't touch Open Graph tags — the tags that actually power social sharing on Twitter/X, Facebook, LinkedIn, Slack, Discord, and iMessage link previews.

A site can have a perfect `<title>` and `<meta name="description">` but still show a broken social card because it's missing `og:image`, `og:title`, or `twitter:card`.

## Target: Section in State of Head 2026

New section titled "The Social Sharing Gap" or "Open Graph Completeness" using a new chart component. Directly supports the article's claim about "broken social cards" with actual data.

## Research Pillars

### 1. OG Tag Prevalence (HTTP Archive)

**Goal:** For each framework, what percentage of origins have complete OG tags?

**"Complete" means all of:**
- `og:title`
- `og:description`
- `og:image`
- `og:url`
- `og:type`

**"Social-ready" means at minimum:**
- `og:title` OR `<title>`
- `og:description` OR `<meta name="description">`
- `og:image` (no fallback — this is the one that breaks cards)

**Queries:**
- Per-framework OG tag presence rates
- Which OG tags are most commonly missing?
- `twitter:card` / `twitter:image` presence rates
- Correlation between missing description and missing og:description (are they the same sites?)

### 2. The og:image Problem

**Goal:** Quantify how many sites are missing `og:image` — the single tag most responsible for broken social cards.

Without `og:image`:
- Twitter/X shows a text-only card (dramatically lower engagement)
- Facebook shows a gray placeholder
- Slack/Discord show no preview image
- iMessage shows a plain URL

**Hypothesis:** `og:image` is the most-skipped OG tag because it requires an actual image URL, not just text content. CMS integrations that auto-populate `og:title` from `<title>` can't auto-generate an image.

### 3. SSR vs CSR OG Tags

**Goal:** Do OG tags survive SSR the same way titles do?

Cross-reference with `title_changed_on_render` metric:
- Sites where title changes on render — do they also have OG tags in raw HTML?
- Angular sites: are OG tags set client-side like titles?
- Streaming sites: do OG tags survive the first flush?

### 4. Framework OG Defaults

**Goal:** Document what each framework provides out-of-the-box for OG tags.

- Nuxt: `useHead()` / `useSeoMeta()` — does `useSeoMeta()` usage correlate with better OG completeness?
- Next.js: `generateMetadata()` — does the template encourage OG tags?
- Remix: `meta()` export — no OG-specific API
- Astro: frontmatter + `<head>` in layout
- SvelteKit: `<svelte:head>` — manual
- Gatsby: `gatsby-plugin-react-helmet` / Head API

## Data Flow

```
BigQuery queries ──► Per-framework OG completeness rates
                         │
                         ▼
                  ChartOGCompleteness component
                         │
og:image analysis ──► "The image gap" narrative
                         │
SSR cross-ref ──────► "OG tags are even worse than titles" finding
                         │
                         ▼
               Section in state-of-head-2026.md
```

## BigQuery Queries Needed

```sql
-- 1. OG tag presence per framework
SELECT
  tech,
  COUNT(DISTINCT origin) as total,
  COUNTIF(has_og_title) / COUNT(DISTINCT origin) as og_title_rate,
  COUNTIF(has_og_description) / COUNT(DISTINCT origin) as og_desc_rate,
  COUNTIF(has_og_image) / COUNT(DISTINCT origin) as og_image_rate,
  COUNTIF(has_og_url) / COUNT(DISTINCT origin) as og_url_rate,
  COUNTIF(has_twitter_card) / COUNT(DISTINCT origin) as twitter_card_rate,
  COUNTIF(has_og_title AND has_og_description AND has_og_image) / COUNT(DISTINCT origin) as social_ready_rate
FROM ...

-- 2. Missing og:image but has other OG tags
-- (sites that tried but forgot the image)

-- 3. Cross-reference: sites missing description AND og:description
-- (same sites or different?)
```

## Key Hypotheses

1. `og:image` is missing on 40-60% of origins across all frameworks
2. Frameworks with dedicated SEO APIs (`useSeoMeta()`, `generateMetadata()`) have 2x better OG completeness
3. Sites missing `<meta name="description">` are almost always also missing `og:description` (same root cause)
4. Angular has the worst OG completeness (same client-side problem as titles)
5. Astro/Remix have the best OG completeness (developers who choose these frameworks tend to be more SEO-aware)

## Unhead Angle

`useSeoMeta()` is designed to make OG tags easy:

```ts
useSeoMeta({
  title: 'My Page',
  description: 'Page description',
  ogImage: '/social-card.png',
  twitterCard: 'summary_large_image',
})
```

One function call sets title, description, OG, and Twitter tags. This is the "make the right thing easy" approach — if the API surfaces `ogImage` as a named field, developers are more likely to fill it in than if they have to manually construct `<meta property="og:image" content="...">`.
