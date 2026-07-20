# Third-Party Head Pollution Research Plan

Original research: **"Who Owns Your Head? Third-Party Tag Pollution Across Frameworks"**

How much of `<head>` is third-party scripts vs first-party metadata? GTM alone can inject 5-15 tags into `<head>`. Combined with analytics, A/B testing, ad scripts, and chat widgets, third-party tags often outnumber first-party ones.

## Target: Section in State of Head 2026

Supports the performance narrative — head tag ordering matters less when 60% of your head is third-party scripts you don't control.

## Research Questions

### 1. Tag Ratio
- Average number of tags in `<head>` per framework
- What percentage are third-party? (identified by external domains in `src`/`href`)
- Which third-party services inject the most tags?

### 2. GTM Dominance
- What percentage of framework sites use GTM?
- How many tags does GTM typically inject into `<head>`?
- Does GTM's `<noscript>` placement cause head-breakers? (cross-reference with head-breakers research)

### 3. Performance Impact
- Sites with 10+ third-party head tags vs sites with 0-2: FCP/LCP difference (CrUX)
- Does the number of third-party head tags correlate with worse CWV independent of total page weight?

### 4. Ordering Chaos
- Third-party scripts often inject at unpredictable positions
- Do they break Capo.js ordering? (sync scripts before stylesheets, etc.)
- Does Unhead's ordering survive third-party injection?

## BigQuery Approach

```sql
-- Count first-party vs third-party tags in <head>
SELECT
  tech,
  AVG(total_head_tags) as avg_total,
  AVG(third_party_tags) as avg_third_party,
  AVG(third_party_tags) / AVG(total_head_tags) as third_party_ratio
FROM (
  -- Parse <head>, classify each tag by src/href domain vs page origin
)
```

## Unhead Angle

Unhead controls first-party tags. Third-party injection happens outside Unhead's scope (GTM runs client-side, injects directly into DOM). But Unhead's server-side ordering ensures first-party critical tags (charset, viewport, title, stylesheets) are always first — before third-party scripts can push them down.

The `tagPriority: 'critical'` feature ensures your most important tags survive even when third-party scripts bloat the head.

## Key Hypotheses

1. Average `<head>` contains 15-25 tags; 30-50% are third-party on commercial sites
2. GTM is present on 40-60% of framework sites
3. Sites with 10+ third-party head tags have 15-25% worse FCP than sites with 0-2
4. Third-party injection is the #1 reason real-world head ordering doesn't match Capo.js recommendations
