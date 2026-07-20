# Article Outline

**File:** `content/learn/capo-performance-research.md`
**Target URL:** `/learn/capo-performance-research`
**Working title:** "Does Head Tag Order Actually Affect Performance? We Tested 8 Million Pages to Find Out"

---

## Frontmatter

```yaml
---
title: "Does Head Tag Order Actually Affect Performance? Original Research"
description: "We analyzed 8 million pages from the HTTP Archive, ran 1,200 controlled benchmarks, and captured browser traces to measure the real performance impact of HTML head tag ordering."
publishedAt: "2026-04-XX"
updatedAt: "2026-04-XX"
readTime: "15 min"
keywords:
  - capo.js performance
  - head tag order performance
  - html head optimization
  - LCP optimization
  - core web vitals head tags
  - preload scanner
  - critical rendering path
---
```

## SEO Strategy

**Primary keyword:** "head tag order performance" (low competition, high intent)
**Secondary:** "capo.js performance", "html head optimization", "does head order matter", "fetchpriority vs head order"
**Angle:** Original research — first large-scale study correlating head ordering with CrUX data. First study testing fetchpriority vs physical order at scale (Gemini S6 gap). Aims for featured snippets on "does html head tag order matter" queries.

---

## Article Structure

### 1. Introduction (200 words)
- Hook: "Everyone says head tag order matters. The Capo.js rules. The Chrome DevRel talks. Harry Roberts' definitive ordering guide. But how much does it actually matter in 2026 — with HTTP/3, `fetchpriority`, and modern preload scanners? We decided to find out."
- What we did: 3-sentence summary of methodology
- Key finding preview (the most surprising result)
- Framing (from Gemini S6): "We know the *theory* (Roberts/Viscomi). We are testing the *reality* in the age of HTTP/3, FetchPriority, and the 2026 Preload Scanner."

### 2. Background (300 words)
- Brief explanation of Capo.js (link to our existing article)
- Prior art: Rick Viscomi's 100-500ms LCP improvements (Gemini S1), Harry Roberts' "Get Your Head Straight" (Gemini S6)
- What the browser does when parsing `<head>` — sequential, blocking
- The preload scanner: Chrome's speculative parser that scans ahead past blocking scripts (Gemini S5) — but can't help if bytes haven't arrived yet ("Network Buffer" theory)
- The head-breaker problem: non-metadata tags in `<head>` that break DOM construction (Gemini S1)
- The `fetchpriority` question: does it make physical ordering obsolete? (Gemini S4: 26% adoption, no one has tested this at scale)
- "But theory isn't data. Let's look at the data."

### 3. Methodology (400 words)
Three approaches, briefly described:

#### 3a. Controlled Benchmarks
- 24 test configurations (4 orderings x 3 complexities x 2 speeds)
- 50 Lighthouse runs per config = 1,200 total runs
- Hosted on Cloudflare Pages, tested from consistent location
- Statistical significance via Mann-Whitney U test

#### 3b. HTTP Archive at Scale
- Extracted `<head>` from ~8M pages in HTTP Archive (month YYYY-MM)
- Scored each against simplified Capo.js rules
- Joined with CrUX origin-level data
- Controlled for page weight, TTFB, CDN, HTTP version

#### 3c. Browser Traces
- Puppeteer-captured Chrome traces on test pages
- Extracted resource discovery timing, parse duration, connection timing
- Visualized as waterfall comparisons

### 4. Results: Controlled Benchmarks (600 words)

#### 4a. Minimal pages (5 head tags)
- Table: LCP/FCP across 4 orderings
- Finding: Likely small or negligible difference on fast connections
- Finding: Difference emerges on slow 3G

#### 4b. Medium pages (15 head tags)
- Table: LCP/FCP across 4 orderings
- Finding: X ms difference between worst and optimal
- Chart: box plot of LCP distributions

#### 4c. Heavy pages (30+ head tags)
- Table: LCP/FCP across 4 orderings
- Finding: This is where it matters most
- Chart: box plot of LCP distributions
- Highlight: the specific mistake that caused the biggest delta

#### 4d. Statistical Significance
- Which comparisons were statistically significant?
- Effect size (Cohen's d or similar)

### 5. Results: HTTP Archive at Scale (600 words)

#### 5a. How the Web Orders Its Head Tags
- Distribution of Capo.js scores across 8M pages
- Most common ordering mistakes (ranked)
- "X% of pages have charset after the title"
- Chart: histogram of scores

#### 5b. Correlation with Core Web Vitals
- Table: median LCP/FCP/INP by Capo.js score quartile
- Chart: scatter plot (score vs LCP) with trend line
- After controlling for confounders (TTFB < 800ms, head size, CMS): does the correlation hold?
- Honest assessment: correlation vs causation

#### 5c. Does FetchPriority Compensate for Bad Ordering? (Novel — Gemini S4/S6)
- 2x2 table: good order + fetchpriority, good order - fetchpriority, bad order + fetchpriority, bad order - fetchpriority
- "No one has validated the impact of FetchPriority vs Physical Order at scale" — we're the first
- Finding: [does fetchpriority rescue bad ordering?]

#### 5d. The Mistakes That Correlate Most with Poor Performance
- Ranked list of specific ordering mistakes and their CWV correlation
- "Pages with sync scripts before stylesheets had X% worse LCP on average"
- Head-breaker prevalence and its correlation with CWV

### 6. Results: Browser Traces (400 words)
- Side-by-side waterfall diagrams: bad order vs optimal
- Annotated: "CSS discovered 120ms later because sync script blocked the parser"
- Annotated: "Preconnect established but stylesheet requesting that origin came 200ms later anyway"
- These are the visual proof that make the article shareable

### 7. Discussion (400 words)

#### When Does Head Order Matter Most?
- Slow connections (3G): yes, measurably
- Heavy heads (30+ tags): yes
- Pages with external fonts/resources: yes (preconnect ordering)
- Simple pages on fast connections: minimal impact

#### The Preload Scanner Complicates Things
- Chrome's preload scanner scans past blocking scripts (Gemini S5), but...
- It can't discover resources until the *bytes arrive* — "Network Buffer" theory (Gemini S5): large heads on slow connections delay discovery regardless of scanner
- CSP meta-tag after speculative preloads can cause re-evaluation (Gemini S5, Chromium source)
- Safari/Firefox scanners may differ — our findings are Chrome-centric (~70% of web) (Gemini gaps)

#### The FetchPriority Factor
- Sites using `fetchpriority` may partially compensate for bad ordering
- But only 26% adoption (Web Almanac 2024) — most sites don't have this safety net

#### HTTP/3 Multiplexing
- Does H3 make discovery order less relevant? (Gemini gap: hypothesis is no, browser still needs to *know* about resources before requesting)

#### Correlation vs Causation
- HTTP Archive correlation doesn't prove causation
- Sites with bad head ordering may have other performance issues
- But combined with controlled benchmarks, the signal is clear

### 8. The 3 Mistakes That Matter Most (300 words)
Ranked by measured impact, with code fixes:
1. [Whatever the data shows]
2. [Whatever the data shows]
3. [Whatever the data shows]

### 9. How Unhead Fixes This Automatically (200 words)
- Unhead implements all 14 Capo.js weight levels
- Zero configuration — `useHead()` sorts tags automatically
- Link to Capo.js analyzer tool
- Link to "What is Capo.js?" article
- Brief `useHead()` code example

### 10. Reproducibility (200 words)
- All test pages are public: [link]
- BigQuery queries are public: [link]
- Raw data is available: [link]
- Methodology is fully documented
- "We encourage others to reproduce and extend this research"

---

## Interactive Components (optional)

If the data warrants it, build Vue components for:
- **Waterfall comparison widget** — toggle between orderings, see the trace difference
- **"Score your site" inline CTA** — mini version of the Capo.js analyzer embedded in the article
- **Interactive chart** — hover over HTTP Archive histogram to see stats per bucket

## Cross-links

- From this article -> `/learn/what-is-capo` (theory)
- From this article -> `/tools/capo-analyzer` (test your site)
- From `/learn/what-is-capo` -> this article (evidence)
- From `/tools/capo-analyzer` -> this article (research backing)
