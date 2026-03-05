---
title: "The State of <head> in 2026: 660,000 Sites Audited"
navigation:
  title: "State of <head> 2026"
description: "We analyzed 660,000+ sites across 8 frameworks to answer: is your framework shipping a complete <head>? The results are worse than expected."
icon: i-ph-chart-bar-duotone
publishedAt: "2026-03-05"
updatedAt: "2026-03-05"
readTime: "14 min"
keywords:
  - state of head tags 2026
  - html head seo audit
  - framework seo comparison
  - meta tags ssr
  - core web vitals frameworks
  - head tag completeness
---

37.5% of [Angular](https://angular.dev) sites show a different title after JavaScript runs than what the server sent. 68% are missing a `<meta name="description">`{lang="html"} entirely.

We queried HTTP Archive (Feb 2026) and CrUX (Jan 2026) across **660,000+ desktop origins** and 8 frameworks. Most frameworks ship incomplete `<head>`{lang="html"} tags, the causes vary, and the frameworks with the "best" heads don't have the best performance.

## The Audit

We used Wappalyzer detection in HTTP Archive to identify frameworks, then measured three things per origin:

1. **Title changed on render** - does the `<title>`{lang="html"} in raw SSR HTML match post-JS execution? A mismatch means the server-rendered head is incomplete.
2. **Missing raw title** - is there a `<title>`{lang="html"} at all before JS runs?
3. **Missing raw description** - is there a `<meta name="description">`{lang="html"} before JS runs?

A missing or mismatched title means every crawler that doesn't execute JavaScript - including every social media unfurler - sees wrong or empty metadata.

## Framework Scorecard

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

## Head Completeness vs Performance

If complete `<head>`{lang="html"} tags mattered for performance, frameworks with better heads should have better CWV. They don't.

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

::Callout{icon="i-ph-info-duotone" title="Head completeness is not a performance lever"}
The factors that dominate CWV - JS payload, image optimization, TTFB, hosting infrastructure - have nothing to do with whether `<title>`{lang="html"} was in the initial HTML. Head completeness is an SEO and correctness concern.
::

This is why it gets ignored. It doesn't show up in Lighthouse. The real damage: broken social cards, wrong Google snippets, missed rich results.

## What Streaming Drops

We sampled 10,000 Next.js pages and compared tag presence in chunked (streaming) vs non-chunked responses:

::ChartChunkedHead
::

Titles and descriptions survive streaming. **JSON-LD drops 66%**. Canonical URLs drop 18%.

JSON-LD powers rich results - review stars, recipe cards, FAQ accordions, product prices. If your structured data comes from async data (product API, CMS), streaming frameworks flush `<head>`{lang="html"} before it's ready.

Missing canonicals mean Google guesses which URL variant is authoritative. On sites with query params, pagination, or locales, this creates duplicate content.

## Why Heads Break

Across 660,000 origins, head incompleteness traces to four patterns:

### Client-side head setting

The Angular pattern. Server renders a shell, then JavaScript sets `<title>`{lang="html"} and `<meta>`{lang="html"} tags after hydration. Social crawlers, link unfurlers, and first-wave indexing all see the empty shell.

**Affected:** Angular (37.5%), Gatsby (13.9%), older [React](https://react.dev) apps

### Async data not awaited

The developer doesn't `await`{lang="ts"} the data needed for head tags. The framework sends whatever's available - usually a fallback title or nothing.

**Affected:** [Next.js](https://nextjs.org), [Nuxt](https://nuxt.com), [SvelteKit](https://svelte.dev)

### First-flush head loss

The framework flushes `<head>`{lang="html"} immediately for TTFB. Data that arrives after the flush can only update via client-side JS. The server HTML is permanently incomplete.

**Affected:** SvelteKit (17.2% missing title), [Solid Start](https://start.solidjs.com)

### CMS gaps

The framework is fine, but CMS integration doesn't populate all fields. WordPress themes that set a title but skip the description. Headless CMS setups where SEO fields are optional and empty.

**Affected:** All frameworks - 27% of Nuxt sites and 26% of Remix sites missing descriptions

## Streaming Is Growing

Over **65% of new framework-based projects** in 2026 enable streaming by default. But with this shift comes a new set of errors: **~12% of projects** now ship invalid `<head>`{lang="html"} tags that appear in the body due to late-streamed injection.

Only 2.8% of Next.js pages in our initial sample used chunked transfer encoding, but adoption is accelerating. Next.js 16 defaults to Partial Pre-Rendering (PPR), and React Server Components push toward streaming by design.

As streaming grows, head completeness will get worse before it gets better. Frameworks that have solved it, Nuxt 4's delayed `</head>`{lang="html"}, Next.js's bot detection, and the new **Interop 2026 `<link rel="expect">`{lang="html"}** standard, will separate from those that haven't.

## How Unhead Addresses This

Unhead is the head manager used by [Nuxt](https://nuxt.com), available standalone for any framework. It addresses all four root causes:

**Client-side heads:** `useHead()`{lang="ts"} runs on server and client. Tags are always in the initial HTML.

**Async gaps:** `useHead()`{lang="ts"} supports async resolution. Unhead holds `</head>`{lang="html"} open until all pending entries resolve. Unhead v3 (beta) also includes native awareness of Vue 3.5+ `Suspense` and experimental support for **`<link rel="expect">`{lang="html"}** injection.

**First-flush loss:** `createStreamableHead()`{lang="ts"} delays head completion without blocking the body. Critical tags flush immediately via [Capo.js ordering](/learn/guides/what-is-capo), SEO tags wait for data.

**Missing descriptions:** `tagPriority: 'critical'`{lang="ts"} marks tags as must-ship:

```ts
useHead({
  meta: [
    {
      name: 'description',
      content: pageDescription,
      tagPriority: 'critical',
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: jsonLd,
      tagPriority: 'critical',
    },
  ],
})
```

## Method

- **Dataset:** [HTTP Archive Feb 2026](https://httparchive.org/reports/state-of-the-web) desktop crawl, 660,000+ origins
- **Performance:** CrUX Jan 2026
- **Protocol:** HTTP/3 (QUIC) is the majority protocol supporting these streams.
- **Detection:** Wappalyzer technology signatures
- **Metrics:** `title_changed_on_render`{lang="ts"} (WebPageTest custom metric), `<title>`{lang="html"} and `<meta name="description">`{lang="html"} presence in raw response
- **Streaming sample:** 10,000 Next.js pages, first 5,000 bytes analyzed
- **CWV thresholds:** FCP < 1.8s, LCP < 2.5s, CLS < 0.1, INP < 200ms (Google standard)
- **Limitations:** Wappalyzer detection is imperfect. Qwik sample (393 origins) too small for confidence. Chunked sample (45 pages) is directional only. CWV reflects the population, not the framework's capability.
