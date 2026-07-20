# Research Findings: Does Head Tag Order Actually Affect Performance? (2026 Update)

This document synthesizes current (2026) research for the unhead.unjs.io original article. It covers technical internals, dataset schemas, and prior art to guide the data-driven study.

---

## Section 1: Rick Viscomi's Original Capo.js Research

### Key Findings
- **Weighting Logic:** Viscomi’s algorithm (Capo.js) uses a 0–8 scale (or 11-step weighting in recent versions) based on the "ideal" discovery sequence.
    - `0`: Meta Charset (Critical for avoiding re-parsing)
    - `1`: Title (Required for tab UI and early rendering)
    - `2`: Preconnect (Establishing early TCP/TLS handshakes)
    - `3`: Sync Scripts (Parser-blocking, high priority)
    - `4`: Sync CSS (Render-blocking, high priority)
    - `5`: Preload (Resource discovery hints)
    - `6`: Async/Defer Scripts (Non-blocking but vital)
    - `7`: Metadata (SEO, Social tags)
    - `8`: Everything else (Icons, etc.)
- **The "Head-Breaker" Phenomenon:** Placing non-metadata tags (like an `<img>` or `<iframe>`) in the `<head>` causes the browser to implicitly close the `<head>` and move subsequent tags to the `<body>`. The **Web Almanac 2025** confirms that invalid head markup (e.g., `<img>` in head) remains a significant issue for 22% of mobile pages with invalid heads.
- **Experimental Evidence:** "Sorted" heads reduce **LCP** by 100ms–500ms by ensuring critical resources (CSS/Preloads) are discovered before blocking scripts.

### Deep Analysis & Actionable for Claude
- **Implementation:** Detect the first "Head-Breaker" tag. Tags after a `<div>` or `<img>` in the `<head>` should be flagged, as their physical order is ignored by the DOM builder.
- **The "Points" Strategy:** Use the 0–8 scale to calculate a **"Capo Score"** based on inversions compared to the ideal order.

### Sources
- [Capo.js GitHub](https://github.com/rviscomi/capo.js)
- [Rick Viscomi: Capo - The Head Tag Orderer](https://rviscomi.dev/2023/02/capo-the-head-tag-orderer/)
- [Web Almanac 2025: Markup - Performance Divide](https://almanac.httparchive.org/en/2025/markup)

---

## Section 2: HTTP Archive BigQuery Schema (2025/2026)

### Key Findings
- **The `crawl` Dataset:** Use **`httparchive.crawl.pages`** and **`httparchive.crawl.bodies`**.
- **Content Storage:**
    - **Field:** `body` (STRING) in `crawl.bodies`.
    - **Truncation:** As of March 2025, the storage truncation threshold is **5MB** (up from 1MB). Googlebot indexing remains limited to the first **2MB** of HTML.
- **Freshness:** Partitions for 2026-01 and 2026-02 are available.

### Deep Analysis & Actionable for Claude
- **Query Optimization:** Join `pages` first to filter for the top 100k URLs to limit `crawl.bodies` scanning.
- **SQL Snippet:**
  ```sql
  SELECT page, body
  FROM `httparchive.crawl.bodies`
  WHERE date = '2026-02-01'
    AND type = 'html'
    AND page IN (SELECT url FROM my_filtered_pages_table)
  ```

### Sources
- [Common Crawl: March 2025 Release Notes (5MB Truncation)](https://commoncrawl.org/blog/march-2025-release-notes)
- [HTTP Archive: BigQuery Dataset Guide](https://har.fyi/guides/bigquery/)

---

## Section 3: Core Web Vitals (2026 Trends)

### Key Findings
- **LCP Benchmark:** Still 2.5s. `fetchpriority="high"` on LCP images is now considered the "single most effective fix."
- **INP (Interaction to Next Paint):** Now a mature metric. Messy heads (heavy with JS) correlate with poor INP due to "Loading phase" main-thread contention.
- **Median Page Weight:** Median mobile page weight reached **2.36 MB** in 2026, increasing the cost of parsing "bloated" heads.

### Sources
- [CrUX Release Notes 2025/2026](https://developer.chrome.com/docs/crux/release-notes/)

---

## Section 4: Web Almanac & Adoption Statistics (2026)

### Key Findings
- **Fetch Priority Adoption:** Now used by **37.8% of all page loads** (up from 26% in 2024).
- **HTTP/3 Adoption:** Reached **38.1%**, significantly improving the efficacy of priority hints by solving Head-of-Line blocking.
- **AI Crawling:** New `llms.txt` standard has hit **2% adoption** (324,000+ files) as sites manage AI crawler discovery.

### Sources
- [Web Almanac 2025: Markup](https://almanac.httparchive.org/en/2025/markup)
- [HTTP Archive 2026 Statistics: Fetch Priority Usage](https://httparchive.org/reports/)

---

## Section 5: Chrome Preload Scanner Internals

### Key Findings
- **The CSP Exception:** A `<meta http-equiv="Content-Security-Policy">` tag causes the Chromium Preload Scanner to **stall or disable itself** (Issue 40273969). This forces sequential loading, often adding seconds to page load on high-latency connections.
- **Network Buffer Theory:** On slow 3G/4G, the scanner can't find resources at the bottom of a 200KB head until the bytes arrive. "Lean heads" remain faster despite preloading.

### Sources
- [Chromium Source: Issue 40273969 (CSP Meta Stall)](https://issues.chromium.org/issues/40273969)
- [Chromium Source: TokenPreloadScanner](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/html/parser/html_preload_scanner.cc)

---

## Section 6: Existing Research

### Key Findings
- **Harry Roberts ("Get Your Head Straight"):** Baseline for 11-step optimal order.
- **Gap:** Validating **Physical Order vs. FetchPriority** in the age of HTTP/3 and universal browser support.

---

## Section 10: CMS Head Patterns

### 1. WordPress: Hook-Based Bloat
- Plugins inject sync scripts mid-head, breaking discovery. WordPress 6.x+ has improved default `fetchpriority` for LCP images.

### 2. Next.js: Metadata API
- App Router centralized Metadata API. Automatic hoisting of CSS to the `<head>` remains a potential LCP bottleneck if not managed.

### 3. Nuxt: Built-in Capo.js
- Nuxt 3.7+ (`experimental.headNext`) is the "gold standard," reordering the entire head sequence automatically via **Unhead**.

### Sources
- [Nuxt Documentation: headNext](https://nuxt.com/docs/guide/going-further/experimental#headnext)
- [Next.js Documentation: Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
