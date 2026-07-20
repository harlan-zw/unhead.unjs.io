# Head-Breakers Research Plan

Original research: **"Head-Breakers: The Silent Parser Bug on 1 in 5 Framework Sites"**

A "head-breaker" is any non-metadata element inside `<head>` that forces the browser to implicitly close `</head>` and start `<body>`. When this happens, everything after the breaker — stylesheets, preconnects, meta tags — gets parsed as body content. The browser still applies them, but the preload scanner misses them and resource discovery is delayed.

Nobody has quantified:
- How prevalent head-breakers are across frameworks
- Which elements cause them most often
- The measured performance impact (FCP/LCP delta)
- Whether frameworks or third-party scripts are the primary source

## Target: Section in State of Head 2026

This research becomes a new section in `state-of-head-2026.md` using the existing `ChartHeadBreakerImpact` component. Could also become a standalone article if findings are strong enough.

## Research Pillars

### 1. HTTP Archive Prevalence

**Goal:** Quantify head-breaker prevalence across frameworks.

**Method:** BigQuery on HTTP Archive response bodies. Scan for non-metadata elements inside `<head>`:
- `<div>`, `<span>`, `<p>`, `<img>`, `<a>`, `<section>`, `<header>`, `<footer>`, `<main>`, `<nav>`
- Bare text nodes (not inside a `<title>` or `<script>`)
- `<noscript>` containing flow content (technically a breaker in some parsers)

**Queries needed:**
- Count origins with head-breakers per framework
- Identify which elements appear most frequently
- Cross-reference with CrUX FCP/LCP

### 2. Root Cause Classification

**Goal:** Determine whether head-breakers come from frameworks, third-party scripts, or developer error.

**Method:** For a sample of 1,000 pages with head-breakers:
- Classify the breaking element source: GTM/analytics injection, ad script, framework SSR bug, developer error, WordPress plugin
- Common patterns: GTM `<noscript>` in head, inline `<img>` for tracking pixels, malformed SSR output

### 3. Controlled Performance Benchmarks

**Goal:** Measure FCP/LCP impact of head-breakers at different positions.

**Method:** Build test pages with intentional head-breakers:
- Early break (after charset, before stylesheets) — maximum damage
- Mid break (between stylesheets and preconnects)
- Late break (after all critical tags, before deferred scripts) — minimal damage
- No break (control)

Run with CDP throttling (same methodology as capo-research benchmarks).

**Expected finding:** Early breaks delay stylesheet discovery by the preload scanner, causing measurable FCP regression.

### 4. Browser Trace Analysis

**Goal:** Visualize exactly how the preload scanner behaves when it hits a head-breaker.

**Method:** Capture Chrome traces (Performance panel) showing:
- When each resource is discovered
- Parser yield points
- The gap between "break point" and "would-have-been discovered" timing

These traces become the visual proof for the article.

## Data Flow

```
BigQuery (prevalence) ──► Framework breakdown chart (ChartHeadBreakerImpact)
                              │
Test pages (benchmarks) ──► FCP/LCP delta table
                              │
Chrome traces ──────────► Waterfall comparison screenshots
                              │
                              ▼
                    Section in state-of-head-2026.md
```

## Gemini Research Tasks

- Which HTML elements trigger implicit `</head>` closure per the HTML spec?
- Do `<noscript>` elements inside `<head>` always break parsing? (spec says content model changes)
- Does Chrome's preload scanner continue scanning after a head-breaker? (Chromium source)
- GTM's `<noscript>` injection pattern — does it go inside `<head>` or `<body>`?
- Prior art: has anyone published head-breaker prevalence data?

## Key Hypotheses

1. GTM is the #1 source of head-breakers (its `<noscript><iframe>` pattern often lands in `<head>`)
2. Angular and WordPress sites have the highest head-breaker rates
3. Early head-breakers cause 50-200ms FCP regression on throttled connections
4. Modern frameworks (Nuxt, Next.js, Remix) have near-zero head-breaker rates because SSR output is well-formed
