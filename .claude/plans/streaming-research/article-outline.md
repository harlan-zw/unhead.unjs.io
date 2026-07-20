# Article Outline

**File:** `content/learn/streaming-head-performance.md`
**Target URL:** `/learn/streaming-head-performance`
**Working title:** "How Streaming SSR Breaks Your Head Tags — A Cross-Framework Investigation"

---

## Frontmatter

```yaml
---
title: "How Streaming SSR Breaks Your Head Tags — Original Research"
description: "We tested 8 frameworks, ran controlled benchmarks, and analyzed HTTP Archive data to find out what happens to your meta tags, stylesheets, and SEO when you enable streaming SSR."
publishedAt: "2026-04-XX"
updatedAt: "2026-04-XX"
readTime: "18 min"
keywords:
  - streaming ssr head tags
  - react streaming meta tags
  - nuxt streaming performance
  - ssr streaming seo
  - suspense head management
  - streaming html head
  - core web vitals streaming
---
```

## SEO Strategy

**Primary keyword:** "streaming ssr head tags" (virtually no competition — we define the category)
**Secondary:** "react streaming meta tags", "streaming ssr performance", "suspense seo"
**Angle:** Original cross-framework research. Nobody has compared streaming head strategies systematically. Aims to become THE reference for anyone evaluating streaming SSR's impact on head management.

**Link magnets:** Framework-specific findings will attract links from framework communities. The "surprising finding" (whatever it turns out to be) is social media bait.

---

## Article Structure

### 1. Introduction (250 words)
- Hook: "You enable streaming SSR for better performance. Your FCP drops by 200ms. But three weeks later, you notice your social cards are broken, Google is indexing the wrong title, and there's a flash of unstyled content on slow connections."
- The core tension: streaming sends HTML before everything is known. `<head>` tags from async components arrive too late.
- "We tested 8 frameworks, built 30 controlled benchmarks, and analyzed HTTP Archive data. Here's what we found."

### 2. The Streaming Head Problem (400 words)
- Visual: SSR timeline comparison (full SSR vs streaming)
- In full SSR, `<head>` contains everything — all components have rendered, all `useHead()` calls have fired
- In streaming, the server sends `<head>` as soon as the shell resolves. Components inside `<Suspense>` boundaries haven't resolved yet.
- What happens to their head tags?
- Three strategies frameworks use (brief overview — detail comes in section 4):
  1. **Wait**: Hold `</head>` until async components resolve (delays FCP)
  2. **Patch**: Send incomplete head, inject late tags via `<script>` in stream
  3. **Defer**: Send incomplete head, fix everything during client hydration
- Diagram showing each strategy's tradeoffs

### 3. Framework Comparison (800 words)

The heart of the article. For each framework:

#### 3a. React 19 / Next.js 15
- How React 19's built-in `<title>`, `<meta>`, `<link>` hoisting works with Suspense streaming
- What Next.js does on top of React's primitives
- Test results: what's in `<head>` at first chunk? After hydration?
- Key finding

#### 3b. Nuxt 4 + Unhead
- Unhead's "delay `</head>`" strategy
- How `useHead()` in async components works during streaming
- Test results
- Key finding

#### 3c. Remix / React Router 7
- `defer()` loaders and streaming — how head tags from deferred data work
- Meta function runs at route level, not component level — so streaming doesn't affect it?
- Test results
- Key finding

#### 3d. SvelteKit 2
- Svelte's streaming SSR approach
- `+page.ts` data loading vs component-level head management
- Test results
- Key finding

#### 3e. Solid Start
- Solid's out-of-order streaming — the most advanced approach
- How `<Title>` and `<Meta>` components work during streaming
- Test results
- Key finding

#### 3f. Others (Astro, Qwik, Angular)
- Brief comparison table
- Key differences worth noting

**Summary table**: Framework × {Strategy, Head complete at FCP?, FOUC risk, SEO safe?, Complexity}

### 4. Benchmark Results (600 words)

#### 4a. FCP: Who Wins?
- Chart: FCP across 5 strategies × 3 complexity levels
- "Stream everything" wins FCP by X ms
- But "delay head" only adds Y ms — is it worth it?

#### 4b. CLS: The Hidden Cost
- Chart: CLS scores across strategies
- Late-arriving stylesheets via streaming scripts cause measurable CLS
- Which strategies avoid this?

#### 4c. The Slow Async Case
- What happens with 500ms async delay?
- The "delay head" strategy adds 500ms to TTFB — that's bad
- The "patch" strategy sends head instantly but tags arrive late — how late?
- Chart: timeline comparison for the slow-async case

#### 4d. Statistical Significance
- Which differences are statistically significant?
- Effect sizes

### 5. HTTP Archive: Streaming in the Wild (500 words)

#### 5a. Adoption
- X% of SSR sites use streaming (by Transfer-Encoding + framework detection)
- Growth trend if data available across multiple months
- Breakdown by framework

#### 5b. Performance Correlation
- Streamed sites vs non-streamed: FCP comparison (CrUX data)
- Streamed sites vs non-streamed: CLS comparison
- Control for framework, page weight, etc.

#### 5c. Head Completeness in the Wild
- For sites using streaming, how often does the initial response contain complete meta tags?
- Common patterns: what's typically missing from streamed `<head>`?

### 6. The SEO Question (400 words)
- Googlebot rendering results for our test pages
- Does Googlebot see head tags injected via streaming scripts?
- Does Googlebot see head tags that only appear after hydration?
- Social crawler results (Twitter, Facebook, LinkedIn)
- **The verdict**: which streaming strategies are SEO-safe?

### 7. The Three Rules of Streaming Head Tags (300 words)
Distilled from all findings:

1. **Never stream stylesheets late** — the FOUC and CLS cost outweighs FCP gains
2. **SEO-critical tags must be in the initial `<head>`** — crawlers can't be trusted with streaming scripts
3. **The "delay head" tradeoff is usually worth it** — a 50-100ms TTFB increase for a complete, correct head is the right default

(Rules will be adjusted based on actual findings)

### 8. Unhead's Approach (250 words)
- Unhead chose "delay head" because [research findings support it]
- How to configure: default behavior, escape hatches
- What Unhead could adopt from other frameworks (if any)
- Link to Capo.js article (ordering still matters even with streaming)
- Link to Capo.js analyzer tool

### 9. Recommendations by Framework (200 words)
Quick reference: if you use X, do Y.
- Next.js: ...
- Nuxt: ...
- Remix: ...
- SvelteKit: ...
- Solid Start: ...

### 10. Methodology & Reproducibility (200 words)
- All test apps are public: [monorepo link]
- Benchmark scripts are public
- BigQuery queries are public
- "We encourage framework teams to review and correct our findings"

---

## Interactive Components

- **Streaming timeline visualizer**: Toggle between frameworks, see when each head tag arrives in the stream
- **Strategy comparison widget**: Select your framework + scenario, see recommended strategy
- **Live stream viewer**: Show actual chunked response with highlighted head tags (like a curl --raw output with annotations)

## Cross-links

- From this article → `/learn/what-is-capo` (tag ordering still matters)
- From this article → `/tools/capo-analyzer` (analyze your head)
- From Capo.js article → this article (streaming context)
- From Unhead streaming docs → this article (research backing)
