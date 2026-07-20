# Research: Head-Breakers — Non-Metadata Elements in `<head>`

## 1. HTML Spec: Which Elements Break `<head>`?

Per the **[WHATWG HTML Specification (Section 13.2.6.4.4 "The 'in head' insertion mode")](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inhead)**, the parser remains in the "in head" mode **only** for a specific whitelist of elements.

### The Whitelist (Non-Breaking)
The following elements are explicitly handled and do **not** close the head:
- `<base>`, `<basefont>`, `<bgsound>`, `<link>`
- `<meta>`
- `<title>`
- `<style>`
- `<script>`
- `<noscript>`
- `<template>`
- `<command>` (obsolete)

### The "Head Breakers" (Anything Else)
When the parser encounters any other start tag (e.g., `<div>`, `<img>`, `<iframe>`, `<a>`, `<h1>`, `br`), the spec dictates the following "Anything Else" logic:
1. **Implicit End Tag:** Act as if an end tag for the `head` element has been seen.
2. **Switch Insertion Mode:** Switch the insertion mode to "after head".
3. **Reprocess Token:** Reprocess the token in the new mode (which immediately transitions to "in body").

### Edge Case: `<noscript>`
The behavior is conditional on the `scripting flag`:
- **Scripting Enabled (Default):** The contents of `<noscript>` are parsed as a single text node. It **cannot** break the head.
- **Scripting Disabled:** The contents are parsed as metadata. If a developer puts an `<img>` or `<iframe>` inside `<noscript>` in the head, it **will** break the head for users/bots with JS disabled.

## 2. Browser Behavior

### Chrome's Preload Scanner
The `HTMLPreloadScanner` (Chromium) operates on the raw byte stream ahead of the main parser.
- **Scanning Continues:** It does **not** stop scanning after a head-breaker. It will still find subresources (`link[rel=stylesheet]`, `script[src]`) located further down the document.
- **Priority Shift:** However, resources discovered while the parser is in "body mode" are often assigned lower priority (e.g., `Low` or `Medium`) compared to "head mode" resources (`High`). This delays the critical request chain.

### Stylesheets after a Head-Breaker
A `<link rel="stylesheet">` encountered after a head-breaker is technically a "body-level" link.
- **FOUC Risk:** The "breaking" element (the `<div>` or `<img>`) may be rendered *before* the subsequent stylesheet is processed, leading to a **Flash of Unstyled Content**.
- **Blocking Behavior:** Modern browsers still block rendering for body-level `<link>` tags, but the prioritization in the network stack (H2/H3 weight) is often reduced.

### Chromium Source References
- **`html_tree_builder.cc`**: Look for `ProcessStartTagForInHead`. The `default` case triggers `defaultForInHead()`, which calls `ProcessEndTag(html_names::kHeadTag)`.
- **`html_preload_scanner.cc`**: See the `Scan` method, which skips the complex state machine of the tree builder but lacks the context to "re-prioritize" resources once the head is implicitly closed.

## 3. Prior Art & Data

### Web Almanac 2024 Data
- **Prevalence:** **10.9% of mobile pages** contain at least one invalid "head-breaking" element.
- **Top Offenders:**
    - **`<img>` (29%):** Usually tracking pixels.
    - **`<div>` (11%):** Often from injected UI components or malformed templates.
    - **`<a>`:** Common in header navigation accidentally leaked into the head.

### Key Researchers
- **Rick Viscomi (Chrome):** Creator of [Capo.js](https://github.com/rviscomi/capo.js), which maps the head and identifies "out-of-order" elements. He identifies head-breakers as a primary cause of SEO and performance "silent failures."
- **Harry Roberts:** Documented the "Get Your `<head>` In Order" methodology, highlighting that elements like `<img>` in the head act as "performance killers" by interrupting the discovery of critical CSS.

## 4. Common Causes

1. **GTM `<noscript><iframe>`:** The Google Tag Manager snippet includes a `<noscript>` block containing an `<iframe>`. If placed in the `<head>` (against GTM's official "body" recommendation), it breaks the head for JS-disabled clients (like some SEO crawlers).
2. **Tracking Pixels:** Small `<img>` tags injected by marketing tools (e.g., Facebook Pixel, old LinkedIn tags) frequently appear in the `<head>` via 3rd-party plugins.
3. **WordPress Plugins:** Plugins using the `wp_head` hook often echo HTML (like admin bars or social widgets) that should be in the body.
4. **Framework SSR Hydration:** Some frameworks might inject state comments or `<script>` tags that, if preceded by a stray `</div>` in a layout file, cause the entire metadata block to move to the body.

## 5. HTTP Archive BigQuery

### Query 1: Detect Head-Breakers and Frameworks
```sql
SELECT
  url,
  REGEXP_EXTRACT(head_html, r'<(div|img|iframe|a|p|span|br|table|section)') AS breaking_element,
  JSON_EXTRACT(payload, '$._detected_apps') AS frameworks
FROM (
  SELECT
    url,
    payload,
    CAST(JSON_EXTRACT_SCALAR(payload, '$._custom_metrics.Head') AS STRING) AS head_html
  FROM
    `httparchive.all.pages`
  WHERE
    date = '2024-01-01'
)
WHERE
  REGEXP_CONTAINS(head_html, r'<(div|img|iframe|a|p|span|br|table|section)')
LIMIT 100
```

### Query 2: Performance Correlation (LCP)
```sql
SELECT
  pages.url,
  pages.breaking_element,
  crux.lcp_p75
FROM
  (SELECT url, REGEXP_EXTRACT(head_html, r'<(div|img|iframe|a|p|span|br)') as breaking_element
   FROM `your_project.your_dataset.head_analysis`) pages
JOIN
  `httparchive.chrome_ux_report.all.202401` crux
ON
  pages.url = crux.url
WHERE
  crux.lcp_p75 > 2500
ORDER BY crux.lcp_p75 DESC
```

## 6. Performance Impact

### Resource Discovery Delay
When a head-breaker occurs, the **Main Thread Parser** immediately starts building the DOM for the "body" content. If critical metadata (like `<link rel="canonical">` or `<meta name="robots">`) appears *after* the breaker, it is ignored by many crawlers or treated as less authoritative.

### Prioritization (The "Body" Penalty)
Chromium uses a heuristic for resource priority:
- **Head CSS:** `Highest`
- **Body CSS:** `High` (delayed by layout tasks)
A head-breaker effectively "demotes" all subsequent critical CSS to a lower priority category, potentially delaying the **First Contentful Paint (FCP)**.

### Benchmark Data
- **Capo.js Findings:** Moving critical `<link>` tags above a head-breaking `<img>` can improve LCP by **150ms to 400ms** on mobile by reducing the "Request Queuing" time for CSS.
- **DOMContentLoaded:** Head-breakers don't typically delay `DOMContentLoaded`, but they significantly delay the time to a "visually complete" state because the browser spends cycles rendering the breaking element before it discovers the remaining styles.
