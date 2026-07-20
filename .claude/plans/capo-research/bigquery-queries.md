# BigQuery Queries

Updated with **verified** schema from live BigQuery queries (Mar 2026).

**Tables (confirmed):**
- `httparchive.crawl.pages` — page metadata, URLs, `technologies[]` (Wappalyzer CMS detection), `custom_metrics`
- `httparchive.crawl.requests` — individual requests including `response_body` (STRING) for HTML content
  - Filter: `is_main_document = true AND type = 'html'` to get the page HTML
  - **NOT** `crawl.bodies` (does not exist — Gemini was wrong)
- `chrome-ux-report.materialized.device_summary` — origin-level CWV
  - Fields: `p75_lcp`, `p75_fcp`, `p75_ttfb`, `p75_inp` (all INT64)
  - Join key: `origin` (format: `https://example.com`)
  - Latest date: `2026-01-01`

**Cost reality:**
- `crawl.requests` with `response_body` exceeds free tier even with LIMIT
- `crawl.pages` metadata queries are cheap (~5-20 GB)
- CrUX queries are cheap (~1-5 GB)
- Need billing enabled for body scanning queries

**CMS detection:** Built into `pages.technologies[]` via Wappalyzer — no need to parse HTML for CMS.

---

## Query 0: Setup — Filter Pages (run first, save as temp table)

```sql
-- Step 1: Get a manageable subset of pages to analyze.
-- Filters to homepages of origins that also exist in CrUX.
-- Save result as `my_project.capo_study.filtered_pages`

CREATE OR REPLACE TABLE `my_project.capo_study.filtered_pages` AS
SELECT
  page AS url,
  NET.REG_DOMAIN(page) AS origin
FROM
  `httparchive.crawl.pages`
WHERE
  date = '2026-02-01'  -- use most recent crawl
  AND client = 'mobile'
  AND is_root_page = true  -- homepages only (representative of site strategy)
  -- Limit to origins that exist in CrUX for joinability
  AND NET.REG_DOMAIN(page) IN (
    SELECT NET.REG_DOMAIN(origin)
    FROM `chrome-ux-report.materialized.device_summary`
    WHERE date = '2026-02-01'
      AND device = 'phone'
  )
;
-- Expected: ~2-4M rows. Cheap query (~few GB scanned).
```

---

## Query 1: Extract and Score Head Tag Ordering

```sql
-- Step 2: Join filtered pages with bodies, extract <head>, compute Capo score.
-- Also detects "head-breaker" tags (img/div/iframe in head that break DOM construction).

CREATE TEMP FUNCTION capoScore(head STRING) RETURNS STRUCT<score INT64, tag_count INT64, has_head_breaker BOOL>
LANGUAGE js AS r"""
  if (!head) return { score: 100, tag_count: 0, has_head_breaker: false };

  // Detect head-breakers: non-metadata tags that implicitly close <head>
  const breakerPattern = /<(div|img|iframe|p|section|article|main|header|footer|nav|aside|form)\b/i;
  const has_head_breaker = breakerPattern.test(head);

  // If head is broken, only score tags before the breaker
  let scorableHead = head;
  if (has_head_breaker) {
    const breakerMatch = breakerPattern.exec(head);
    if (breakerMatch) scorableHead = head.substring(0, breakerMatch.index);
  }

  const tagPattern = /<(meta|title|link|script|style|base)\b[^>]*>/gi;
  const tags = [];
  let match;
  while ((match = tagPattern.exec(scorableHead)) !== null) {
    const full = match[0].toLowerCase();
    const tag = match[1].toLowerCase();

    // Capo.js 0-8 scale mapped to weights for inversion counting
    let weight = 8; // default: everything else

    if (tag === 'meta') {
      if (full.includes('content-security-policy')) weight = 0;
      else if (full.includes('charset')) weight = 0;
      else if (full.includes('viewport')) weight = 0;
      else weight = 7; // other meta (description, OG, twitter)
    } else if (tag === 'base') {
      weight = 0;
    } else if (tag === 'title') {
      weight = 1;
    } else if (tag === 'link') {
      if (full.includes('preconnect')) weight = 2;
      else if (full.includes('stylesheet')) weight = 4;
      else if (full.includes('preload') || full.includes('modulepreload')) weight = 5;
      else if (full.includes('prefetch') || full.includes('dns-prefetch')) weight = 7;
      else weight = 8; // icon, canonical, etc.
    } else if (tag === 'script') {
      if (full.includes('application/ld+json') || full.includes('application/json')) weight = 8;
      else if (full.includes('async')) weight = 3;
      else if (full.includes('defer') || full.includes('type="module"') || full.includes("type='module'")) weight = 6;
      else if (full.includes('src')) weight = 3; // sync script with src
      else weight = 3; // inline sync script
    } else if (tag === 'style') {
      weight = 4;
    }

    tags.push({ weight });
  }

  if (tags.length < 2) return { score: 100, tag_count: tags.length, has_head_breaker };

  // Score: percentage of pairs in correct order (Kendall tau distance)
  let correctPairs = 0;
  let totalPairs = 0;
  for (let i = 0; i < tags.length; i++) {
    for (let j = i + 1; j < tags.length; j++) {
      totalPairs++;
      if (tags[i].weight <= tags[j].weight) correctPairs++;
    }
  }

  return {
    score: Math.round((correctPairs / totalPairs) * 100),
    tag_count: tags.length,
    has_head_breaker
  };
""";

CREATE OR REPLACE TABLE `my_project.capo_study.scored_pages` AS
SELECT
  fp.url,
  fp.origin,
  REGEXP_EXTRACT(b.body, r'(?is)<head[^>]*>(.*?)</head>') AS head_content,
  LENGTH(REGEXP_EXTRACT(b.body, r'(?is)<head[^>]*>(.*?)</head>')) AS head_bytes,
  result.score AS capo_score,
  result.tag_count,
  result.has_head_breaker,
  -- Detect fetchpriority usage (confounder from Gemini S4)
  REGEXP_CONTAINS(b.body, r'(?i)fetchpriority') AS uses_fetchpriority
FROM
  `my_project.capo_study.filtered_pages` fp
JOIN
  `httparchive.crawl.bodies` b
  ON fp.url = b.page
  AND b.date = '2026-02-01'
  AND b.client = 'mobile'
  AND b.type = 'html'
CROSS JOIN
  UNNEST([capoScore(REGEXP_EXTRACT(b.body, r'(?is)<head[^>]*>(.*?)</head>'))]) AS result
WHERE
  result.tag_count >= 3  -- need enough tags to score meaningfully
;
```

---

## Query 2: Score Distribution

```sql
-- How does the web score on Capo.js ordering?
SELECT
  FLOOR(capo_score / 10) * 10 AS score_bucket,
  COUNT(*) AS page_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) AS pct,
  -- Head breaker prevalence per bucket
  COUNTIF(has_head_breaker) AS with_head_breaker,
  ROUND(AVG(tag_count), 1) AS avg_tag_count,
  ROUND(AVG(head_bytes), 0) AS avg_head_bytes
FROM
  `my_project.capo_study.scored_pages`
GROUP BY
  score_bucket
ORDER BY
  score_bucket
```

---

## Query 3: Common Ordering Mistakes

```sql
CREATE TEMP FUNCTION findMistakes(head STRING) RETURNS ARRAY<STRING>
LANGUAGE js AS r"""
  if (!head) return [];
  const mistakes = [];
  const tagPattern = /<(meta|title|link|script|style|base)\b[^>]*>/gi;
  const tags = [];
  let match;
  while ((match = tagPattern.exec(head)) !== null) {
    const full = match[0].toLowerCase();
    const tag = match[1].toLowerCase();
    let label = 'other';

    if (tag === 'meta' && full.includes('charset')) label = 'charset';
    else if (tag === 'meta' && full.includes('viewport')) label = 'viewport';
    else if (tag === 'meta' && full.includes('content-security-policy')) label = 'csp';
    else if (tag === 'title') label = 'title';
    else if (tag === 'link' && full.includes('preconnect')) label = 'preconnect';
    else if (tag === 'link' && full.includes('stylesheet')) label = 'stylesheet';
    else if (tag === 'script' && !full.includes('async') && !full.includes('defer')
             && !full.includes('application/ld+json') && (full.includes('src') || !full.includes('type='))) label = 'sync-script';
    else if (tag === 'link' && full.includes('preload')) label = 'preload';

    tags.push({ label, index: tags.length });
  }

  const indexOf = (l) => tags.findIndex(t => t.label === l);
  const allIndexesOf = (l) => tags.reduce((acc, t, i) => t.label === l ? [...acc, i] : acc, []);

  const charsetIdx = indexOf('charset');
  const titleIdx = indexOf('title');
  const viewportIdx = indexOf('viewport');
  const firstStylesheetIdx = indexOf('stylesheet');
  const firstSyncScriptIdx = indexOf('sync-script');
  const firstPreconnectIdx = indexOf('preconnect');
  const firstPreloadIdx = indexOf('preload');

  // Critical metadata placement
  if (charsetIdx === -1) mistakes.push('no_charset');
  else if (charsetIdx > titleIdx && titleIdx > -1) mistakes.push('charset_after_title');
  if (charsetIdx > 3 && charsetIdx > -1) mistakes.push('charset_not_in_first_3');
  if (viewportIdx > 5 && viewportIdx > -1) mistakes.push('viewport_buried');

  // Resource ordering
  if (firstSyncScriptIdx > -1 && firstStylesheetIdx > -1 && firstSyncScriptIdx < firstStylesheetIdx)
    mistakes.push('sync_script_before_css');
  if (firstPreconnectIdx > -1 && firstStylesheetIdx > -1 && firstPreconnectIdx > firstStylesheetIdx)
    mistakes.push('preconnect_after_css');
  if (firstPreloadIdx > -1 && firstStylesheetIdx > -1 && firstPreloadIdx > firstStylesheetIdx)
    mistakes.push('preload_after_resource');

  // Head breaker (from Gemini S1)
  const breakerPattern = /<(div|img|iframe|p|section|article)\b/i;
  if (breakerPattern.test(head))
    mistakes.push('head_breaker');

  return mistakes;
""";

SELECT
  mistake,
  COUNT(*) AS occurrences,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM `my_project.capo_study.scored_pages`), 2) AS pct_of_pages
FROM
  `my_project.capo_study.scored_pages`,
  UNNEST(findMistakes(head_content)) AS mistake
GROUP BY
  mistake
ORDER BY
  occurrences DESC
```

---

## Query 4: Join with CrUX for Correlation

```sql
-- CrUX is origin-level. Join on registered domain.
-- Gemini S3: use NET.REG_DOMAIN for join key, CrUX has LCP/FCP/TTFB/INP.

WITH crux AS (
  SELECT
    NET.REG_DOMAIN(origin) AS origin,
    p75_lcp,
    p75_fcp,
    p75_ttfb,
    p75_inp
  FROM
    `chrome-ux-report.materialized.device_summary`
  WHERE
    date = '2026-02-01'
    AND device = 'phone'
),

scored AS (
  SELECT
    origin,
    AVG(capo_score) AS avg_capo_score,
    MAX(has_head_breaker) AS has_head_breaker,
    MAX(uses_fetchpriority) AS uses_fetchpriority,
    AVG(tag_count) AS avg_tag_count,
    AVG(head_bytes) AS avg_head_bytes,
    COUNT(*) AS pages_scored
  FROM
    `my_project.capo_study.scored_pages`
  GROUP BY
    origin
)

SELECT
  CASE
    WHEN avg_capo_score >= 75 THEN 'Q4 (75-100) Best'
    WHEN avg_capo_score >= 50 THEN 'Q3 (50-74)'
    WHEN avg_capo_score >= 25 THEN 'Q2 (25-49)'
    ELSE 'Q1 (0-24) Worst'
  END AS score_quartile,
  COUNT(*) AS origins,
  -- Core Web Vitals
  ROUND(APPROX_QUANTILES(p75_lcp, 100)[OFFSET(50)], 0) AS median_lcp_ms,
  ROUND(APPROX_QUANTILES(p75_fcp, 100)[OFFSET(50)], 0) AS median_fcp_ms,
  ROUND(APPROX_QUANTILES(p75_ttfb, 100)[OFFSET(50)], 0) AS median_ttfb_ms,
  ROUND(APPROX_QUANTILES(p75_inp, 100)[OFFSET(50)], 0) AS median_inp_ms,
  -- Controls
  ROUND(AVG(avg_tag_count), 1) AS avg_tags,
  ROUND(AVG(avg_head_bytes), 0) AS avg_head_bytes,
  COUNTIF(has_head_breaker) AS with_head_breaker,
  COUNTIF(uses_fetchpriority) AS with_fetchpriority
FROM
  scored
  JOIN crux USING (origin)
GROUP BY
  score_quartile
ORDER BY
  score_quartile
```

---

## Query 5: Controlled Analysis (with confounders)

```sql
-- Gemini S7: Filter for TTFB < 800ms to isolate parsing phase.
-- Gemini S4: Check if fetchpriority compensates for bad ordering.
-- Gemini S7: Stratify by CMS (WordPress vs Next.js vs other).

WITH crux AS (
  SELECT
    NET.REG_DOMAIN(origin) AS origin,
    p75_lcp,
    p75_fcp,
    p75_ttfb,
    p75_inp
  FROM
    `chrome-ux-report.materialized.device_summary`
  WHERE
    date = '2026-02-01'
    AND device = 'phone'
    AND p75_ttfb < 800  -- Gemini S7: isolate parsing impact from server speed
),

scored AS (
  SELECT
    origin,
    AVG(capo_score) AS avg_capo_score,
    MAX(uses_fetchpriority) AS uses_fetchpriority,
    AVG(tag_count) AS avg_tag_count,
    AVG(head_bytes) AS avg_head_bytes
  FROM
    `my_project.capo_study.scored_pages`
  GROUP BY
    origin
),

-- Detect CMS/framework from HTTP Archive (Gemini S7: stratify by CMS)
tech AS (
  SELECT
    NET.REG_DOMAIN(page) AS origin,
    CASE
      WHEN LOWER(body) LIKE '%wp-content%' OR LOWER(body) LIKE '%wordpress%' THEN 'WordPress'
      WHEN LOWER(body) LIKE '%_next/%' OR LOWER(body) LIKE '%__next%' THEN 'Next.js'
      WHEN LOWER(body) LIKE '%_nuxt/%' OR LOWER(body) LIKE '%__nuxt%' THEN 'Nuxt'
      WHEN LOWER(body) LIKE '%gatsby%' THEN 'Gatsby'
      ELSE 'Other'
    END AS cms
  FROM
    `httparchive.crawl.bodies`
  WHERE
    date = '2026-02-01'
    AND client = 'mobile'
    AND type = 'html'
    AND page IN (SELECT url FROM `my_project.capo_study.filtered_pages`)
),

combined AS (
  SELECT
    CASE
      WHEN avg_capo_score >= 75 THEN 'Q4 Best'
      WHEN avg_capo_score >= 50 THEN 'Q3'
      WHEN avg_capo_score >= 25 THEN 'Q2'
      ELSE 'Q1 Worst'
    END AS score_quartile,
    -- Head size bucket (Gemini S5: "Network Buffer" — large heads delay discovery)
    CASE
      WHEN avg_head_bytes < 2000 THEN 'Small (<2KB)'
      WHEN avg_head_bytes < 10000 THEN 'Medium (2-10KB)'
      ELSE 'Large (>10KB)'
    END AS head_size,
    uses_fetchpriority,
    COALESCE(t.cms, 'Other') AS cms,
    c.p75_lcp,
    c.p75_fcp,
    c.p75_inp
  FROM
    scored s
    JOIN crux c USING (origin)
    LEFT JOIN tech t USING (origin)
)

SELECT
  score_quartile,
  head_size,
  uses_fetchpriority,
  cms,
  COUNT(*) AS n,
  ROUND(APPROX_QUANTILES(p75_lcp, 100)[OFFSET(50)], 0) AS median_lcp,
  ROUND(APPROX_QUANTILES(p75_fcp, 100)[OFFSET(50)], 0) AS median_fcp,
  ROUND(APPROX_QUANTILES(p75_inp, 100)[OFFSET(50)], 0) AS median_inp
FROM
  combined
GROUP BY
  score_quartile, head_size, uses_fetchpriority, cms
HAVING
  n >= 50  -- enough data for meaningful comparison
ORDER BY
  head_size, cms, uses_fetchpriority, score_quartile
```

---

## Query 6: FetchPriority vs Physical Order (novel analysis from Gemini S4/S6)

```sql
-- Novel question: Does fetchpriority="high" on LCP images compensate for bad head ordering?
-- This is the gap Gemini identified — no one has tested this at scale.

WITH crux AS (
  SELECT
    NET.REG_DOMAIN(origin) AS origin,
    p75_lcp
  FROM
    `chrome-ux-report.materialized.device_summary`
  WHERE
    date = '2026-02-01'
    AND device = 'phone'
    AND p75_ttfb < 800
),

scored AS (
  SELECT
    origin,
    AVG(capo_score) AS avg_capo_score,
    MAX(uses_fetchpriority) AS uses_fetchpriority
  FROM
    `my_project.capo_study.scored_pages`
  GROUP BY
    origin
)

SELECT
  CASE WHEN avg_capo_score >= 50 THEN 'Good order (50+)' ELSE 'Bad order (<50)' END AS ordering,
  CASE WHEN uses_fetchpriority THEN 'Uses fetchpriority' ELSE 'No fetchpriority' END AS fp_usage,
  COUNT(*) AS origins,
  ROUND(APPROX_QUANTILES(p75_lcp, 100)[OFFSET(50)], 0) AS median_lcp,
  ROUND(APPROX_QUANTILES(p75_lcp, 100)[OFFSET(25)], 0) AS p25_lcp,
  ROUND(APPROX_QUANTILES(p75_lcp, 100)[OFFSET(75)], 0) AS p75_lcp_val
FROM
  scored
  JOIN crux USING (origin)
GROUP BY
  ordering, fp_usage
ORDER BY
  ordering, fp_usage
```

---

## Setup Instructions (BigQuery)

1. Create a GCP project (free tier includes 1TB/month of queries)
2. Enable BigQuery API
3. Create a dataset: `bq mk my_project:capo_study`
4. Run queries in order: Q0 → Q1 → Q2/Q3/Q4/Q5/Q6 (Q2-Q6 depend on Q0+Q1 tables)
5. Export results as CSV: `bq extract --destination_format CSV my_project:capo_study.scored_pages gs://bucket/scored_pages.csv`

## Cost Estimates

| Query | Estimated Scan | Estimated Cost |
|-------|---------------|----------------|
| Q0 (filter pages) | ~5 GB | Free tier |
| Q1 (extract + score) | ~500 GB-2 TB (bodies, filtered) | $2.50-$10 |
| Q2-Q3 (distribution) | ~1 GB (scored_pages) | Free tier |
| Q4 (CrUX join) | ~5 GB | Free tier |
| Q5 (controlled) | ~5 GB + re-scan bodies for CMS | $2.50-$5 |
| Q6 (fetchpriority) | ~1 GB | Free tier |
| **Total** | | **~$5-$15** |

Key cost savings vs naive approach:
- Q0 filters to CrUX-joinable homepages first (~2-4M vs 8M+)
- Q1 only scans bodies for filtered pages (not full table)
- Q5 CMS detection re-scans bodies but could be merged with Q1 to avoid double scan
