---
title: "What is Capo.js? Why HTML Head Tag Order Matters"
navigation:
  title: "What is Capo.js?"
description: "How HTML head tag ordering affects page load performance. Complete Capo.js weight reference, common mistakes, and how Unhead automates optimal ordering."
icon: i-ph-sort-ascending-duotone
publishedAt: "2026-03-05"
updatedAt: "2026-03-05"
readTime: "10 min"
keywords: ["capo.js", "head tag order", "html head performance", "critical request chains", "LCP optimization"]
---

## What is Capo.js?

[Capo.js](https://github.com/nickvdh/capo.js) is a set of rules by [Rick Viscomi](https://rviscomi.dev/) (Chrome DevRel) defining the optimal order of HTML `<head>`{lang="html"} tags for page load performance. Named after the guitar capo - it tunes your `<head>`{lang="html"} by putting every tag in the right position.

Browsers parse `<head>`{lang="html"} top-to-bottom. Wrong order means delayed rendering, unnecessary re-parsing, and slower LCP.

::Callout{icon="i-ph-rocket-launch-duotone"}
**Unhead implements Capo.js sorting automatically.** Every tag from `useHead()`{lang="ts"} is placed in optimal position - zero config.
::

## Why order matters

The HTML parser processes `<head>`{lang="html"} sequentially:

- `<meta charset>`{lang="html"} **after the title** → browser re-parses the document when it discovers a different encoding
- **Sync** `<script>`{lang="html"} **before CSS** → blocks both rendering and stylesheet loading
- `<link rel="preconnect">`{lang="html"} **after the resource it helps** → arrives too late to matter
- **Render-blocking resources before critical metadata** → delays the browser's understanding of the page

Bad order:

```html
<head>
  <title>My Page</title>
  <script src="/app.js"></script>
  <link rel="stylesheet" href="/style.css">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <link rel="preconnect" href="https://fonts.googleapis.com">
</head>
```

Problems: charset after title triggers re-parse, sync script blocks CSS, preconnect comes after the stylesheet that needs it.

With Capo.js ordering:

```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>My Page</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="/style.css">
  <script src="/app.js"></script>
</head>
```

## Complete Weight Reference

Unhead implements all 14 Capo.js weight levels. Lower weight = placed first in `<head>`{lang="html"}:

| Priority | Weight | Tag | Why |
|----------|--------|-----|-----|
| 1 | -30 | `<meta http-equiv="Content-Security-Policy">`{lang="html"} | **The Preload Scanner Stall:** Must be first. Late CSP tags can [disable the Chromium preload scanner](https://issues.chromium.org/issues/40273969), forcing resources to load sequentially. |
| 2 | -20 | `<meta charset>`{lang="html"} | Encoding must be in first 1024 bytes |
| 3 | -15 | `<meta name="viewport">`{lang="html"} | Prevents mobile layout shifts |
| 4 | -10 | `<base>`{lang="html"} | Affects all relative URLs after it |
| 5 | 10 | `<title>`{lang="html"} | First visible content in browser tab |
| 6 | 20 | `<link rel="preconnect">`{lang="html"} | Early DNS + TLS for critical origins |
| 7 | 30 | `<script async>`{lang="html"} | Fetch ASAP, non-blocking |
| 8 | 40 | `<style>`{lang="html"} with `@import`{lang="css"} | Render-blocking; must discover imports early |
| 9 | 50 | `<script src>`{lang="html"} (sync) | Render-blocking but unavoidable |
| 10 | 60 | `<link rel="stylesheet">`{lang="html"} / `<style>`{lang="html"} | Render-blocking CSS |
| 11 | 70 | `<link rel="preload">`{lang="html"} / `<link rel="modulepreload">`{lang="html"} | Hints for soon-needed resources |
| 12 | 80 | `<script defer>`{lang="html"} / `<script type="module">`{lang="html"} | Non-blocking, post-parse execution |
| 13 | 90 | `<link rel="prefetch">`{lang="html"} / `<link rel="dns-prefetch">`{lang="html"} | Low-priority future navigation hints |
| 14 | 100 | Everything else | `<meta name="description">`{lang="html"}, OG tags, JSON-LD |

### Weight groups

**-30 to -10 (critical metadata)** must appear first - `<meta charset>`{lang="html"} after 1024 bytes forces re-parsing, late viewport causes mobile layout shifts.

**10-20 (content & connections):** `<title>`{lang="html"} for the browser tab, `<link rel="preconnect">`{lang="html"} to establish connections before they're needed.

**30-60 (render-blocking resources):** `<script async>`{lang="html"} gets discovered early for fetching. Sync `<script>`{lang="html"} and `<link rel="stylesheet">`{lang="html"} in their optimal relative order.

**70-100 (deferred & hints):** `<link rel="preload">`{lang="html"}, `<script defer>`{lang="html"}, `<link rel="prefetch">`{lang="html"}, and everything else. These don't affect initial rendering.

## Common Mistakes

### The "Head-Breaker"

A common mistake is placing an invalid tag (like `<img>`{lang="html"} or `<iframe>`{lang="html"}) inside the `<head>`{lang="html"}. The browser's DOM builder implicitly closes the `<head>`{lang="html"} and moves everything after the invalid tag to the `<body>`{lang="html"}.

::ChartHeadBreakerImpact
::

According to the **Web Almanac 2025**, invalid head markup remains a significant issue for **22% of all mobile pages**. This "breaks" SEO and performance because critical meta tags and styles are discovered too late by the parser.

### Charset after the title

```html
<!-- Bad -->
<title>My Page</title>
<meta charset="utf-8">

<!-- Good -->
<meta charset="utf-8">
<title>My Page</title>
```

The [HTML spec](https://html.spec.whatwg.org/multipage/semantics.html#charset) requires `<meta charset>`{lang="html"} within the first 1024 bytes. Content before it may trigger re-parsing.

### CSS before preconnects

```html
<!-- Bad: preconnect arrives too late -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- Good -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">
```

### Sync scripts blocking CSS

```html
<!-- Bad: script blocks CSS loading -->
<script src="/analytics.js"></script>
<link rel="stylesheet" href="/style.css">

<!-- Good -->
<link rel="stylesheet" href="/style.css">
<script src="/analytics.js"></script>
```

Better - make analytics async:

```html
<script async src="/analytics.js"></script>
<link rel="stylesheet" href="/style.css">
```

### Preloads after what they preload

```html
<!-- Bad: preload discovered after stylesheet -->
<link rel="stylesheet" href="/style.css">
<link rel="preload" href="/font.woff2" as="font" crossorigin>

<!-- Good -->
<link rel="preload" href="/font.woff2" as="font" crossorigin>
<link rel="stylesheet" href="/style.css">
```

## Automatic Sorting with Unhead

Every `useHead()`{lang="ts"} call produces Capo.js-ordered output:

```ts
import { useHead } from 'unhead'

useHead({
  meta: [
    { charset: 'utf-8' }, // weight: -20
    { name: 'viewport', content: 'width=device-width' }, // weight: -15
    { name: 'description', content: 'My page' }, // weight: 100
  ],
  title: 'My Page', // weight: 10
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' }, // weight: 20
    { rel: 'stylesheet', href: '/style.css' }, // weight: 60
  ],
})
```

Output is sorted by weight regardless of input order.

### Custom priority

Override the default ordering with `tagPriority`{lang="ts"}:

```ts
useHead({
  script: [
    {
      src: '/critical-polyfill.js',
      tagPriority: 'critical', // -8 offset (higher priority)
    },
    {
      src: '/analytics.js',
      tagPriority: 'low', // +2 offset (lower priority)
    },
  ],
})
```

Priority aliases (applied as offsets to the tag's calculated weight):
- `'critical'`{lang="ts"} - subtracts 8 from weight
- `'high'`{lang="ts"} - subtracts 1
- `'low'`{lang="ts"} - adds 2
- Any number - exact weight override

Relative positioning with `before:`{lang="ts"} and `after:`{lang="ts"} prefixes:

```ts
useHead({
  script: [
    {
      src: '/my-script.js',
      tagPriority: 'before:script:analytics',
    },
  ],
})
```

## Check Your Site

::Callout{icon="i-ph-magnifying-glass-duotone" to="/tools/capo-analyzer" title="Capo Analyzer"}
Paste HTML or enter a URL to get instant feedback on your head tag ordering, with specific suggestions for improvement.
::

For the measured performance impact of head tag ordering, including the **"Nuxt Paradox"** where automatic ordering isn't enough to fix slow LCP, see [Does Head Tag Order Affect Performance?](/learn/research/capo-performance-research). For how streaming SSR interacts with head management, see [Streaming SSR SEO](/learn/research/streaming-head-performance).
