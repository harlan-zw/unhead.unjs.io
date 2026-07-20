# Duplicate & Conflicting Tags Research Plan

Original research: **"When Your Head Fights Itself: Duplicate Tags Across 660K Sites"**

Multiple `<title>` elements, conflicting `<meta name="robots">` directives, duplicate canonicals pointing to different URLs. These aren't edge cases — they're the natural result of component-based head management where multiple components, plugins, and layouts all inject tags independently.

## Target: Section in State of Head 2026

New section showing how often sites ship conflicting head tags, which frameworks are worst, and why a head manager with deduplication matters.

## Research Questions

### 1. Duplicate Titles
- How many origins have 2+ `<title>` elements in raw HTML?
- Per-framework rates
- When there are duplicates, are they identical (harmless) or different (bug)?

### 2. Conflicting Robots
- Sites with both `<meta name="robots" content="index">` and `<meta name="robots" content="noindex">`
- Or `robots` in raw HTML conflicting with `X-Robots-Tag` header
- Which directive wins? (last one, per spec)

### 3. Duplicate Canonicals
- Sites with 2+ `<link rel="canonical">` pointing to different URLs
- Google's behavior: picks one arbitrarily — this is a real SEO bug

### 4. Conflicting Charset
- Sites with charset declared in both HTTP header and `<meta>` with different values
- Sites with charset declared multiple times

### 5. Framework Correlation
- Hypothesis: component-based frameworks (React, Vue, Svelte) have higher duplicate rates than template-based (Astro, PHP)
- Unhead deduplicates by `key` — Nuxt sites should have lowest duplicate rates

## BigQuery Approach

Parse `<head>` from response bodies, count tag occurrences:

```sql
-- Count origins with duplicate titles
SELECT
  tech,
  COUNTIF(title_count > 1) / COUNT(*) as duplicate_title_rate,
  COUNTIF(title_count > 1 AND titles_differ) / COUNT(*) as conflicting_title_rate,
  COUNTIF(canonical_count > 1) / COUNT(*) as duplicate_canonical_rate
FROM ...
```

## Unhead Angle

Unhead's tag deduplication is automatic:
- `<title>` always deduplicates (last write wins)
- `<meta>` deduplicates by `name` or `property`
- `<link rel="canonical">` deduplicates by `rel`
- Explicit `tagDuplicateStrategy` for custom behavior

This is the strongest "why you need a head manager" argument — without one, every component that calls `document.title = ...` or appends a `<meta>` creates duplicates.

## Key Hypotheses

1. 10-20% of origins have duplicate `<title>` elements
2. Angular and Gatsby have the highest rates (multiple lifecycle hooks setting title)
3. Conflicting canonicals affect 3-5% of origins (serious SEO bug)
4. Nuxt has the lowest duplicate rate due to Unhead deduplication
