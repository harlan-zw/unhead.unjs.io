---
title: "The State of <head> in 2026: 660,000 Sites Audited"
navigation:
  title: "State of <head> 2026"
description: "We analyzed 660,000+ sites across 8 frameworks to answer: is your framework shipping a complete <head>? The results are worse than expected."
icon: i-ph-chart-bar-duotone
publishedAt: "2026-03-05"
updatedAt: "2026-03-05"
readTime: "22 min"
keywords:
  - state of head tags 2026
  - html head seo audit
  - framework seo comparison
  - meta tags ssr
  - core web vitals frameworks
  - head tag completeness
  - open graph tags
  - head breakers
  - duplicate meta tags
  - third party scripts head
---

37.5% of [Angular](https://angular.dev) sites show a different title after JavaScript runs than what the server sent. 68% are missing a `<meta name="description">`{lang="html"} entirely.

We queried HTTP Archive (Feb 2026) and CrUX (Jan 2026) across **660,000+ desktop origins** and 8 frameworks. Most frameworks ship incomplete `<head>`{lang="html"} tags, the causes vary, and the frameworks with the "best" heads don't have the best performance.

## What We Measured

Head tags only work if they're in the HTML before JavaScript runs. Social crawlers (Twitter, Facebook, LinkedIn, Slack, Discord) never execute JS. Googlebot does, but with a delay - meaning incorrect initial tags can persist in search results for hours to days.

We used [Wappalyzer](https://www.wappalyzer.com/) detection in [HTTP Archive](https://httparchive.org) to identify frameworks across 660,000+ desktop origins, then measured everything from basic tag presence to structural issues like head-breakers and duplicate tags. The full method is in the [Method](#method) section. We start with three core health metrics.

## Framework Scorecard

For each origin we checked three things: does the `<title>`{lang="html"} change after JS runs (indicating incomplete SSR), is a `<title>`{lang="html"} present in raw HTML at all, and is a `<meta name="description">`{lang="html"} present in raw HTML?

::ChartFrameworkHealth
::

**Under 5% title change** (Qwik, Remix, Astro): all three resolve head data before sending any HTML. Qwik blocks at the loader level. Remix's [`meta()`{lang="ts"}](https://reactrouter.com/start/framework/route-module#meta) export is synchronous. Astro resolves everything in page-level frontmatter. They trade flexibility for correctness.

**5-15%** (Next.js, Nuxt, Gatsby): these support async head data with fallback mechanisms - Next.js patches with late-streamed `<script>`{lang="html"} tags, Nuxt holds `</head>`{lang="html"} open, Gatsby pre-renders at build time. The 9-14% failure rate comes from sites that misuse or skip these mechanisms.

**Over 15%** ([SvelteKit](https://svelte.dev/docs/kit), Angular): SvelteKit flushes `<head>`{lang="html"} immediately - late data is gone. Angular's number comes from its SPA heritage: most Angular apps set titles client-side via the [`Title`{lang="ts"}](https://angular.dev/api/platform-browser/Title) service, which runs after hydration.

## The Description Problem

Titles get attention, but **descriptions are worse across every framework**. Even Astro - the most complete - is missing descriptions on 11.9% of origins. Angular hits 68.2%.

Developers treat descriptions as optional. Frameworks don't warn when a page ships without one. CMS integrations populate titles but leave descriptions empty. Unlike a missing title (which shows as a blank browser tab), a missing description fails silently.

But descriptions directly affect search click-through rates. Google uses `<meta name="description">`{lang="html"} as the snippet text. Without one, Google pulls a random sentence from the page body - usually a poor choice.

::Callout{icon="i-ph-megaphone-duotone" title="For framework authors"}
Consider treating a missing `<meta name="description">`{lang="html"} as a build warning, not a silent omission.
::

## The Social Sharing Gap

Titles and descriptions are only half the story. Social platforms don't use `<meta name="description">`{lang="html"} - they use Open Graph tags. And Open Graph completeness is worse than everything above.

The Open Graph Protocol requires four tags: `og:title`{lang="html"}, `og:type`{lang="html"}, `og:image`{lang="html"}, and `og:url`{lang="html"}. But `og:image`{lang="html"} is the one that breaks social cards. Without it:

- **Twitter/X** shows a text-only card with lower engagement
- **Facebook** renders a gray placeholder
- **LinkedIn** shows a bare link with a generic icon
- **Slack and Discord** show no image preview
- **iMessage** shows a plain URL with no rich preview

::ChartOgCompleteness
::

From our [HTTP Archive](https://httparchive.org) queries, only **~48% of desktop pages** include an `og:image`{lang="html"}. Over half the web ships broken social cards.

The reason is obvious: `og:title`{lang="html"} can be auto-populated from `<title>`{lang="html"}. `og:description`{lang="html"} can fall back to `<meta name="description">`{lang="html"}. But `og:image`{lang="html"} requires an actual image URL - there's no fallback, and CMS integrations that auto-populate text fields can't auto-generate an image.

None of these social crawlers execute JavaScript. Twitterbot, facebookexternalhit, LinkedInBot, Slackbot, Discordbot - they all parse raw HTML with aggressive timeouts (3–5 seconds). If your OG tags come from client-side rendering, they don't exist.

::Callout{icon="i-ph-share-network-duotone" title="The og:image gap"}
Frameworks that provide structured SEO APIs (`useSeoMeta()`{lang="ts"}, `generateMetadata()`{lang="ts"}) show better OG completeness because the API surfaces `ogImage` as a named field. When the right thing is easy, developers do it.
::

## What Streaming Drops

Even when tags are set correctly on the server, streaming can lose them. We sampled 10,000 Next.js pages and compared tag presence in chunked (streaming) vs non-chunked responses:

::ChartChunkedHead
::

Titles and descriptions survive streaming. **JSON-LD drops 66%**. Canonical URLs drop 18%.

JSON-LD powers rich results - review stars, recipe cards, FAQ accordions, product prices. If your structured data comes from async data (product API, CMS), streaming frameworks flush `<head>`{lang="html"} before it's ready.

Missing canonicals mean Google guesses which URL variant is authoritative. On sites with query params, pagination, or locales, this creates duplicate content. See our [streaming SSR research](/learn/research/streaming-head-performance) for how each framework handles this.

## Head-Breakers: The Silent Parser Bug

Beyond missing tags, there are tags that are *present but displaced*. A "head-breaker" is any non-metadata element inside `<head>`{lang="html"} that forces the browser to implicitly close `</head>`{lang="html"} and start `<body>`{lang="html"}. Per the [WHATWG HTML parsing spec](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inhead), only `<meta>`{lang="html"}, `<title>`{lang="html"}, `<link>`{lang="html"}, `<style>`{lang="html"}, `<script>`{lang="html"}, `<base>`{lang="html"}, `<template>`{lang="html"}, and `<noscript>`{lang="html"} are allowed. Everything else, `<div>`{lang="html"}, `<img>`{lang="html"}, `<iframe>`{lang="html"}, `<a>`{lang="html"}, triggers an implicit end tag.

::ChartHeadBreakerImpact
::

When a head-breaker fires, every tag after it is parsed as body content. The browser still applies stylesheets found after the break, but Chromium downgrades their network priority from `Highest` to `High`. On throttled connections, this delay is measurable: moving a critical `<link>`{lang="html"} above a head-breaking `<img>`{lang="html"} can [cost up to ~200ms of FCP on throttled connections](/learn/research/capo-performance-research).

The top offenders from HTTP Archive:

- **`<img>`{lang="html"} (29%)**: tracking pixels from analytics and ad platforms injected into `<head>`{lang="html"} via third-party snippets
- **`<div>`{lang="html"} (11%)**: malformed template output, WordPress plugin injection, or SSR hydration artifacts
- **`<noscript>`{lang="html"} with flow content**: GTM's `<noscript><iframe>`{lang="html"} pattern is documented to go in `<body>`{lang="html"}, but developers routinely place it in `<head>`{lang="html"}. With scripting disabled (some SEO crawlers), this breaks the head.

Chrome's preload scanner continues scanning after a head-breaker - it doesn't stop discovering resources. But the main thread parser has already switched to body mode, and resource prioritization follows. The practical impact: your `<link rel="canonical">`{lang="html"} and `<meta name="robots">`{lang="html"} tags end up in the DOM's `<body>`{lang="html"}, where some crawlers ignore them.

## Duplicate & Conflicting Tags

Component-based architecture makes duplicate head tags a structural problem. Multiple components call `useHead()`{lang="ts"}, nested layouts each set a `<title>`{lang="html"}, and plugins inject their own meta tags. Without deduplication, the HTML ships with conflicts.

::ChartDuplicateTags
::

From our HTTP Archive queries, ~3% of mobile pages have multiple `<title>`{lang="html"} elements. ~3.5% have duplicate `<meta name="description">`{lang="html"} tags. These numbers are low because most frameworks handle the easy cases. The dangerous duplicates are subtler:

**Conflicting canonicals** are the worst. [Google Search Central](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) explicitly states: if multiple `<link rel="canonical">`{lang="html"} tags point to different URLs, Google ignores all of them. Your link equity splits, tracking parameters get indexed, and duplicate content filters activate. This commonly happens when a CMS plugin and a framework layout both inject canonicals.

**Conflicting robots directives** follow a ["most restrictive wins" rule](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag). If one `<meta name="robots">`{lang="html"} says `index`{lang="html"} and another says `noindex`{lang="html"}, the page is treated as `noindex`{lang="html"}. The same applies when `<meta name="robots">`{lang="html"} conflicts with an `X-Robots-Tag`{lang="html"} HTTP header - the stricter directive wins regardless of location.

How frameworks handle deduplication:

| Framework | Strategy | Risk |
|-----------|----------|------|
| **Nuxt / Unhead** | Key-based dedup by `name`/`property`; last wins | Low - automatic |
| **Next.js** | Shallow merge; page overrides layout | Low - built-in |
| **SvelteKit** | Additive, `<svelte:head>`{lang="html"} blocks concatenate | **High**, duplicate titles ship |
| **Angular** | `addTag()`{lang="ts"} appends; must use `updateTag()`{lang="ts"} manually | **High**: appends by default |
| **WordPress** | Theme + Yoast + page builder all inject | **High**: plugin conflicts |

## Third-Party Head Pollution

The biggest source of head-breakers and displaced tags? Third-party scripts.

::ChartThirdPartyPollution
::

Per [Web Almanac 2025](https://almanac.httparchive.org/en/2025/third-parties), **92% of pages** include third-party JavaScript. On commercial sites using GTM with GA4, Facebook Pixel, and Hotjar, the ratio of third-party to first-party tags in `<head>`{lang="html"} is typically **3:1**. A standard GTM container adds 8–12 tags to `<head>`{lang="html"} after execution.

This matters for three reasons:

**Parser blocking.** A/B testing tools (Optimizely, VWO) require synchronous `<script>`{lang="html"} tags in `<head>`{lang="html"} to prevent flicker. These block the parser until fetched and executed - every millisecond of latency delays CSS discovery.

**Ordering destruction.** Unhead and Capo.js can sort first-party tags optimally on the server. But the moment third-party JavaScript runs `document.head.appendChild()`{lang="ts"}, that ordering is gone. GTM injecting a sync script before your stylesheets delays CSS parsing regardless of your server-side ordering.

**Head-breaker injection.** Third-party snippets are the primary source of the [head-breakers](#head-breakers-the-silent-parser-bug) described above - tracking pixels and misplaced GTM snippets that force the browser to close `</head>`{lang="html"} early.

::Callout{icon="i-ph-warning-duotone" title="Server-side tagging is the fix"}
Instead of GTM injecting 10 scripts into the browser, server-side tagging sends one request to a GTM server that fans out to GA4, Facebook, etc. This eliminates head pollution and is the single most impactful change for sites with heavy analytics.
::

## Why Heads Break

The sections above each describe a symptom. But these causes don't act alone - they compound. Here are the four root causes behind 660,000 origins of incomplete heads:

1. **Client-side head setting.** The framework renders a shell, then JavaScript sets tags after hydration. Angular (37.5% title mismatch) and Gatsby (13.9%) are the primary offenders. Social crawlers never see the JS-set tags.

2. **Async data not awaited.** The developer doesn't `await`{lang="ts"} CMS or API data before the framework flushes `<head>`{lang="html"}. Affects Next.js, Nuxt, and SvelteKit - the 9–14% failure rate in the [scorecard](#framework-scorecard) comes from this.

3. **First-flush head loss.** Streaming frameworks flush `<head>`{lang="html"} for fast TTFB. Late-arriving data, JSON-LD, canonicals, OG tags, [gets dropped](#what-streaming-drops). SvelteKit (17.2% missing title) and Solid Start are most affected.

4. **CMS and plugin gaps.** The framework is fine, but the CMS doesn't populate all fields. This drives the [description problem](#the-description-problem), the [OG image gap](#the-social-sharing-gap), and many [duplicate tag conflicts](#duplicate--conflicting-tags) from competing plugins.

A site running a streaming framework with a CMS that doesn't populate descriptions, a GTM container injecting tracking pixels, and multiple plugins setting canonicals hits all four at once.

## Does Any of This Affect Performance?

After all this, the natural question: if complete `<head>`{lang="html"} tags are so important, frameworks with better heads should have better Core Web Vitals. They don't.

::ChartFrameworkCWV
::

| Framework | Origins | FCP Good | LCP Good | CLS Good | INP Good |
|-----------|---------|----------|----------|----------|----------|
| [Astro](https://astro.build) | 13,851 | **44.9%** | **44.9%** | 50.1% | **52.9%** |
| [SvelteKit](https://svelte.dev) | 6,996 | 42.3% | 41.8% | 50.8% | 51.1% |
| [Angular](https://angular.dev) | 97,938 | 40.3% | 37.4% | **54.9%** | 51.7% |
| [Gatsby](https://www.gatsbyjs.com) | 9,763 | 39.6% | 37.1% | 44.8% | 44.9% |
| [Next.js](https://nextjs.org) | 209,395 | 38.2% | 36.9% | 46.5% | 46.4% |
| [Nuxt](https://nuxt.com) | 66,097 | 37.3% | 36.4% | 47.8% | 47.6% |
| [Remix](https://remix.run) | 4,316 | 33.6% | 35.5% | 46.9% | 48.1% |
| [Qwik](https://qwik.dev) | 270 | 30.1% | 29.5% | 35.5% | 38.3% |

The correlation is inverted. Angular - worst head completeness - has the **best CLS** at 54.9%. Qwik and Remix - best heads - have the worst FCP/LCP.

- **Angular's CLS**: mature enterprise apps with stable layouts, not head management
- **Astro leads FCP/LCP**: ships zero JS by default, not because it blocks the head
- **Qwik's numbers**: 270 origins, skewed toward complex early-adopter apps
- **Remix at 33.6% FCP**: data-heavy server apps with round-trips, not static marketing sites

Compare frameworks against platforms that do zero head optimization:

::ChartTheNuxtParadox
::

Shopify scores 87% good LCP with no head optimization at all. Nuxt, which auto-sorts tags via Capo.js, delays `</head>`{lang="html"} for async data, and deduplicates by key, scores 44%. The gap is TTFB (534ms vs 989ms) and architecture, not head management. See our [Capo.js performance research](/learn/research/capo-performance-research) for the full analysis.

::Callout{icon="i-ph-info-duotone" title="Head completeness is not a performance lever"}
The factors that dominate CWV, JS payload, image optimization, TTFB, hosting infrastructure, have nothing to do with whether `<title>`{lang="html"} was in the initial HTML. Head completeness doesn't show up in Lighthouse. The real cost is SEO: wrong Google snippets, broken social cards, missed rich results.
::

## What's Next

Only 2.8% of Next.js pages in our sample used chunked transfer encoding, but **65% of new framework projects** in 2026 enable streaming by default. Next.js 16 defaults to Partial Pre-Rendering, React Server Components push streaming by design, and ~12% of projects already ship `<head>`{lang="html"} tags that end up in the body due to late-streamed injection. See our [streaming SSR research](/learn/research/streaming-head-performance) for the full breakdown.

Head completeness will get worse before it gets better. The frameworks pulling ahead, Nuxt 4's delayed `</head>`{lang="html"}, Next.js's bot detection, and the new **Interop 2026 `<link rel="expect">`{lang="html"}** standard, are solving problems most developers don't know they have.

## How Unhead Addresses This

Unhead is the head manager used by [Nuxt](https://nuxt.com), available standalone for any framework. It addresses every issue in this audit:

```ts
// One call sets title, description, OG, and Twitter tags
useSeoMeta({
  title: 'My Page',
  description: 'Page description',
  ogImage: '/social-card.png',
  twitterCard: 'summary_large_image',
})
```

- **SSR-first:** `useHead()`{lang="ts"} runs on server and client - tags are always in the initial HTML
- **Async-aware:** holds `</head>`{lang="html"} open until all pending entries resolve; v3 adds `Suspense` awareness and `<link rel="expect">`{lang="html"} support
- **Streaming-safe:** `createStreamableHead()`{lang="ts"} delays head completion without blocking the body; `tagPriority: 'critical'`{lang="ts"} prevents streaming from dropping JSON-LD or canonicals
- **No head-breakers:** only outputs valid metadata elements - no `<div>`{lang="html"} or `<img>`{lang="html"} in `<head>`{lang="html"}
- **Automatic deduplication:** key-based dedup by `name`, `property`, or custom `key` - multiple `useHead()`{lang="ts"} calls produce exactly one tag per key
- **Capo.js ordering:** `<meta charset>`{lang="html"} always first, then viewport, title, preconnects, stylesheets - in the order Chrome's preload scanner expects

## Method

- **Dataset:** [HTTP Archive Feb 2026](https://httparchive.org/reports/state-of-the-web) desktop crawl, 660,000+ origins
- **Performance:** CrUX Jan 2026
- **Protocol:** HTTP/3 (QUIC) is the majority protocol supporting these streams.
- **Detection:** Wappalyzer technology signatures
- **Metrics:** `title_changed_on_render`{lang="ts"} (WebPageTest custom metric), `<title>`{lang="html"} and `<meta name="description">`{lang="html"} presence in raw response
- **OG analysis:** `og:title`{lang="html"}, `og:description`{lang="html"}, `og:image`{lang="html"}, `og:url`{lang="html"}, `twitter:card`{lang="html"} presence in raw response
- **Head-breakers:** Non-metadata elements (`<div>`{lang="html"}, `<img>`{lang="html"}, `<iframe>`{lang="html"}, `<a>`{lang="html"}) detected in raw `<head>`{lang="html"} HTML; corroborated by [Web Almanac 2025 SEO](https://almanac.httparchive.org/en/2025/seo) (10.1% of desktop sites contain invalid head elements)
- **Duplicate detection:** Multiple `<title>`{lang="html"}, `<meta name="description">`{lang="html"}, and `<link rel="canonical">`{lang="html"} tags counted per origin via regex on response bodies
- **Streaming sample:** 10,000 Next.js pages, first 5,000 bytes analyzed
- **CWV thresholds:** FCP < 1.8s, LCP < 2.5s, CLS < 0.1, INP < 200ms (Google standard)
- **Limitations:** Wappalyzer detection is imperfect. Qwik sample (393 origins) too small for confidence. Chunked sample (45 pages) is directional only. CWV reflects the population, not the framework's capability. Third-party tag counts reflect post-execution DOM snapshots; server-rendered HTML has fewer tags. OG adoption statistics from Web Almanac may differ from framework-specific HTTP Archive queries.
