# Research Approaches

5 pillars of evidence, ordered by novelty and impact.

---

## 1. Controlled Synthetic Benchmarks

Build identical pages differing only in `<head>` tag order, run hundreds of Lighthouse/WebPageTest runs.

### Test Matrix

4 head orderings x 3 page complexity levels x 2 connection speeds = 24 test configurations

**Orderings:**
- Worst-case (reversed Capo.js order)
- Common-bad (charset after title, scripts before CSS, preconnects after stylesheets)
- Random shuffle
- Capo.js optimal

**Page complexity:**
- Minimal: 5 head tags (charset, viewport, title, 1 stylesheet, 1 script)
- Medium: 15 head tags (+ preconnects, preloads, async scripts, meta descriptions, OG tags)
- Heavy: 30+ tags (+ Google Fonts, analytics, multiple stylesheets, font preloads, JSON-LD)

**Connection speeds:**
- Fast 4G (default)
- Slow 3G (where ordering impact should be most visible)

### Metrics to Capture
- LCP (Largest Contentful Paint)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte) — control metric, should be identical
- SI (Speed Index)
- TBT (Total Blocking Time)
- **Discovery Delay** (Gemini S8) — time from first byte of HTML received to first byte of LCP resource received. This is the metric head-ordering directly improves.
- Time to first CSS byte received
- Time from HTML parse start to first resource request

### Infrastructure
- Host: Cloudflare Pages (eliminates server variability)
- Testing: `lighthouse` CLI with `--runs=50` per configuration, or WebPageTest API
- Statistical analysis: median, p95, standard deviation, Mann-Whitney U test for significance

### Key Controls
- Identical `<body>` content across all variants
- Same server, same CDN, same TLS config
- Run tests in randomized order to prevent time-of-day effects
- Discard first 5 runs as warmup

---

## 2. HTTP Archive + CrUX Large-Scale Correlation

The HTTP Archive crawls ~8M pages monthly and stores raw HTML. CrUX has real-user Core Web Vitals data. Cross-referencing them lets us ask: "Do sites with better head ordering have better performance?"

### Methodology (updated with Gemini findings)
1. Filter `httparchive.crawl.pages` to CrUX-joinable homepages (cost optimization — Gemini S2)
2. Extract `<head>` from `httparchive.crawl.bodies` (`body` field, `type = 'html'`)
3. Score via JS UDF using Capo.js 0-8 weight scale + detect head-breakers (Gemini S1)
4. Join with CrUX `device_summary` on `NET.REG_DOMAIN` (origin-level — Gemini S3)
5. Bucket by Capo.js score quartile, compare median LCP, FCP, INP, TTFB
6. Control: filter TTFB < 800ms, stratify by CMS, check fetchpriority interaction (Gemini S4/S7)

### Capo.js Score (Simplified for SQL)
Score based on penalty points for ordering violations:
- charset not in first 3 tags: -20 points
- viewport not in first 5 tags: -15 points
- title before charset: -15 points
- sync script before stylesheet: -10 points
- preconnect after stylesheet that uses it: -10 points
- meta description / OG tags before title: -5 points

### Confounders to Control (refined from Gemini S4/S7)
- **TTFB** — filter to < 800ms to isolate parsing from server speed (Gemini S7)
- **Head size in bytes** — "Network Buffer" theory: large heads delay scanner discovery on slow connections (Gemini S5)
- **Tag count** — more tags = more room for misordering
- **FetchPriority usage** — 26% adoption, may compensate for bad ordering (Gemini S4)
- **CMS/framework** — WordPress vs Next.js vs Nuxt vs other. Next.js auto-optimizes head (Gemini S7)
- **Third-party script count** — sites with many head tags often have many 3P scripts causing poor perf independently (Gemini S7)
- **Head-breaker presence** — non-metadata tags breaking DOM construction (Gemini S1)

### Expected Outcome
Even a weak correlation is novel. The real novelty angles (from Gemini S6):
1. First large-scale CrUX correlation study on head ordering
2. First study testing fetchpriority vs physical order at scale
3. First study quantifying the "Network Buffer" effect (head size × connection speed × ordering)

---

## 3. Web Almanac & Literature Review

Survey existing knowledge to contextualize our findings.

### Sources (confirmed by Gemini)
- [Rick Viscomi: Capo - The Head Tag Orderer](https://rviscomi.dev/2023/02/capo-the-head-tag-orderer/) — original motivation, 100-500ms LCP improvements
- [Harry Roberts: Get Your Head Straight](https://csswizardry.com/2018/11/get-your-head-straight/) — 11-step optimal order, definitive baseline
- [Chromium: TokenPreloadScanner](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/html/parser/html_preload_scanner.cc) — scanner internals, CSP re-evaluation
- [Web Almanac 2024: Markup](https://almanac.httparchive.org/en/2024/markup) — median head has 40+ elements
- [Web Almanac 2024: Performance](https://almanac.httparchive.org/en/2024/performance) — fetchpriority at 26% adoption
- [HTTP Archive BigQuery guide](https://har.fyi/guides/bigquery/)

### Key Research Gap (from Gemini S6)
No one has validated **fetchpriority vs physical order** at scale. This is our unique angle beyond just "first CrUX correlation study."

---

## 4. Browser-Level Performance Traces

Use Performance API and Chrome DevTools Protocol to capture what actually happens during head parsing at the millisecond level.

### Approach
- Instrument test pages with `PerformanceObserver` for resource timing
- Use Puppeteer to capture Chrome trace files (`.json`)
- Extract from traces:
  - `ParseHTML` duration
  - Time between parser encountering a resource hint and connection start
  - CSS discovery time relative to position in head
  - Speculative parse events
- Generate waterfall diagrams comparing orderings side-by-side

### Visualization
Create SVG/canvas waterfall charts showing:
- Left: poorly ordered head — CSS discovered late, preconnect wasted
- Right: Capo.js ordered head — CSS discovered early, preconnect effective
- Annotate the delta between corresponding events

These visualizations are the "hero image" of the article.

---

## 5. Real-World Before/After Case Studies

Find 2-3 sites, apply Capo.js ordering, measure the delta.

### Candidates
- unhead.unjs.io itself (we control it)
- Popular open-source project sites (Nuxt, Vue, Vite docs)
- Sites found in HTTP Archive analysis with notably bad ordering

### Measurement
- Synthetic: WebPageTest before/after (immediate)
- Real-user: CrUX API if changes deployed for 28+ days (delayed but more credible)
- Include screenshot comparisons of DevTools waterfall

### Limitation
Real-world sites change many things at once. Isolating head ordering impact is hard. This is supplementary evidence, not primary.
