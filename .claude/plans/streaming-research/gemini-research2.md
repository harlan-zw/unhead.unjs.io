# Streaming Research Phase 2 (Updated March 2026)

## Task A: Draft BigQuery SQL Queries (2026 Edition)

### A1: Streaming Detection Query
This query detects streaming by checking for `Transfer-Encoding: chunked` (HTTP/1.1), missing `Content-Length` (HTTP/2/3 proxy), large TTFB vs Total Download gaps, and framework-specific streaming markers in the HTML body.

```sql
WITH streaming_requests AS (
  SELECT
    r.pageid,
    r.url,
    r.requestid,
    -- Time to First Byte vs Total time gap. A large gap often indicates streaming.
    (r.time - r.ttfb) AS download_time_gap
  FROM
    `httparchive.all.requests` r
  WHERE
    r.date = '2026-01-01' -- Updated to latest 2026 dataset
    AND r.client = 'desktop'
    AND r.is_main_document = true
    AND (
      -- HTTP/1.1 Chunked Transfer
      EXISTS(SELECT 1 FROM UNNEST(r.response_headers) WHERE LOWER(name) = 'transfer-encoding' AND value = 'chunked')
      -- HTTP/2 or 3 often drop chunked but omit content-length for streams
      OR NOT EXISTS(SELECT 1 FROM UNNEST(r.response_headers) WHERE LOWER(name) = 'content-length')
    )
)

SELECT
  sr.url,
  -- Detect framework markers indicating out-of-order streaming or suspense
  REGEXP_CONTAINS(b.body, r'<!--\$\??-->') AS is_react_suspense,
  REGEXP_CONTAINS(b.body, r'<template id="B:') AS is_react_streaming_flush,
  REGEXP_CONTAINS(b.body, r'__NUXT_DATA__') AS is_nuxt,
  -- NEW: Detect <link rel="expect"> usage (Interop 2026)
  REGEXP_CONTAINS(b.body, r'<link[^>]*rel=["\']expect["\']') AS uses_link_expect,
  CASE
    WHEN REGEXP_CONTAINS(b.body, r'<!--\$\??-->') THEN 'React/Next.js'
    WHEN REGEXP_CONTAINS(b.body, r'__NUXT_DATA__') THEN 'Nuxt'
    ELSE 'Unknown/Other'
  END AS detected_framework,
  -- Combine signals to confirm streaming
  (sr.download_time_gap > 1000 OR REGEXP_CONTAINS(b.body, r'<!--\$\??-->|<template id="B:')) AS is_streaming
FROM
  streaming_requests sr
JOIN
  `httparchive.all.response_bodies` b
ON
  sr.pageid = b.pageid AND sr.requestid = b.requestid
WHERE
  b.date = '2026-01-01'
  AND b.client = 'desktop'
  AND b.is_main_document = true
```

### A2: Streaming vs Non-Streaming CWV (2026)
This query joins our streaming detection logic with Core Web Vitals to compare performance metrics.

```sql
WITH streaming_pages AS (
  SELECT
    pageid,
    CASE WHEN REGEXP_CONTAINS(body, r'<!--\$\??-->') THEN 'React/Next' ELSE 'Other' END AS framework,
    TRUE AS is_streaming
  FROM `httparchive.all.response_bodies`
  WHERE date = '2026-01-01' AND REGEXP_CONTAINS(body, r'<!--\$\??-->')
)

SELECT
  sp.framework,
  sp.is_streaming,
  COUNT(p.pageid) AS sample_size,
  -- Core Web Vitals p75 metrics
  APPROX_QUANTILES(p.crux_fcp, 100)[OFFSET(75)] AS p75_fcp,
  APPROX_QUANTILES(p.crux_lcp, 100)[OFFSET(75)] AS p75_lcp,
  APPROX_QUANTILES(p.crux_cls, 100)[OFFSET(75)] AS p75_cls,
  APPROX_QUANTILES(p.crux_inp, 100)[OFFSET(75)] AS p75_inp,
  -- Control metrics
  APPROX_QUANTILES(p.bytesTotal, 100)[OFFSET(50)] AS median_page_weight
FROM
  `httparchive.all.pages` p
LEFT JOIN
  streaming_pages sp ON p.pageid = sp.pageid
WHERE
  p.date = '2026-01-01'
  AND p.client = 'desktop'
GROUP BY
  sp.framework,
  sp.is_streaming
HAVING sample_size > 100
```

---

## Task B: Real-World Streaming Head Breakage & 2026 Evolutions

1. **Next.js 16 PPR and SEO Consistency**
   - **Framework:** Next.js 16.1 (Stable)
   - **2026 Update:** Partial Pre-Rendering (PPR) is now the default pattern. The static shell is sent instantly, but developers still run into "SEO lag" where the dynamic title arrives too late for simple scrapers.
   - **The Fix:** Continued use of UA-detection for social crawlers and the emergence of **`<link rel="expect">`** to synchronize the paint of critical meta-aware components.

2. **Nuxt 4 `app/` Directory and Unhead v2 Integration**
   - **Framework:** Nuxt 4.3 (Stable)
   - **2026 Update:** The move to the `app/` directory and Nitro v3 has streamlined the streaming lifecycle. Unhead v2 handles "patching" automatically, but developers must now `await` route-dependent meta data due to the strict async nature of Nuxt 4 params.
   - **Status/Fix:** Use `useHead` with reactive properties that resolve as part of the stream.

3. **The Rise of `<link rel="expect">` (Interop 2026)**
   - **New for 2026:** Browsers now natively support blocking rendering until a specific element (like `#main-meta`) arrives in the stream.
   - **Impact:** This reduces the reliance on framework-specific script hacks for updating the head, as the browser won't "reveal" the page until the head-influencing components are parsed.

---

## Task C: Draft Article Sections (2026 Perspective)

### C1: Section 2 — "The Streaming Head Problem in the PPR Era"

In 2026, we’ve moved past simple SSR. With Partial Pre-Rendering (PPR) becoming the default in frameworks like Next.js 16, the "First Flush" problem has evolved. We now send a static shell in milliseconds, but the real data—the data that dictates our `<title>` and `<meta>`—might not arrive for another 500ms.

This gap creates a "zombie head" state. For half a second, your page has a generic title and no description. If a scraper or a low-spec browser processes your page during this window, you lose your SEO edge. The industry's answer in 2026 is a mix of pragmatic hacks (UA-blocking) and the new **`<link rel="expect">`** standard, which finally gives us a native browser API to say: "Here is my shell, but don't you dare paint it until the metadata arrives."

---

## Task D: Research Unhead v2/v3 Streaming Implementation

### Deep Dive: Unhead v2 Patching (Nuxt 4 Default)

Unhead v2 (the engine powering Nuxt 4) has perfected the "out-of-order" patching technique.

**2026 Mechanics:**
- **Native Async Awareness:** Unhead now natively understands the `Suspense` lifecycle of Vue 3.5+.
- **`<link rel="expect">` Injection:** Unhead v3 (beta) has begun automatically injecting `<link rel="expect">` tags when it detects that a `useHead` call is pending within a critical async component, ensuring the browser waits for the metadata before the first paint.
- **Priority Engine:** The priority system (`tagPriority`) now includes a `blocking` flag that maps directly to the browser's new rendering hints.
