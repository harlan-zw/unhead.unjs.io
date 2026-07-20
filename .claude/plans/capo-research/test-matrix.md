# Test Page Matrix

24 static HTML pages for controlled benchmarking.

## Page Templates

### Minimal (5 head tags)

```html
<!-- Tags (order varies per variant): -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Test Page - Minimal</title>
<link rel="stylesheet" href="/css/style.css">
<script src="/js/app.js"></script>
```

Body: simple text content with one image (LCP element), ~50KB total page weight.

### Medium (15 head tags)

```html
<!-- Tags (order varies per variant): -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Test Page - Medium</title>
<meta name="description" content="A test page for benchmarking head tag order">
<meta property="og:title" content="Test Page">
<meta property="og:description" content="A test page">
<meta property="og:image" content="/img/og.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap">
<link rel="stylesheet" href="/css/style.css">
<link rel="preload" href="/fonts/custom.woff2" as="font" type="font/woff2" crossorigin>
<script async src="/js/analytics.js"></script>
<script src="/js/app.js"></script>
<script defer src="/js/interactions.js"></script>
```

Body: text content with hero image, navigation, ~150KB total.

### Heavy (30+ head tags)

```html
<!-- Tags (order varies per variant): -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Test Page - Heavy</title>
<meta name="description" content="...">
<meta name="author" content="...">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta property="og:url" content="...">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<link rel="canonical" href="...">
<link rel="icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://www.googletagmanager.com">
<link rel="dns-prefetch" href="https://cdn.example.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/css/reset.css">
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/components.css">
<link rel="preload" href="/fonts/custom-bold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/custom-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/img/hero.webp" as="image">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>
<script>/* inline gtag config */</script>
<script src="/js/vendor.js"></script>
<script src="/js/app.js"></script>
<script defer src="/js/interactions.js"></script>
<script defer src="/js/lazy-components.js"></script>
<script type="application/ld+json">{"@context":"https://schema.org",...}</script>
```

Body: full page with hero image, nav, content sections, sidebar, footer. ~500KB total.

---

## Ordering Variants

### Variant A: Capo.js Optimal
Tags ordered by Capo.js weight (lowest first):
1. CSP meta (-30)
2. charset (-20)
3. viewport (-15)
4. base (-10)
5. title (10)
6. preconnect (20)
7. async scripts (30)
8. style @import (40)
9. sync scripts (50)
10. stylesheets (60)
11. preload (70)
12. defer scripts (80)
13. prefetch/dns-prefetch (90)
14. everything else (100)

### Variant B: Common-Bad
Realistic mistakes developers actually make:
- title before charset
- sync scripts before stylesheets
- preconnect after the stylesheet that uses the connection
- preload after the resource it preloads
- viewport buried in the middle

### Variant C: Random Shuffle
Deterministic random seed for reproducibility. Same shuffle across all page sizes.

### Variant D: Worst-Case (Reversed)
Exact reverse of Capo.js optimal. Everything else first, critical metadata last.

---

## Connection Speed Profiles

### Fast 4G
- Lighthouse: default mobile throttling
- WebPageTest: "4G" preset (9 Mbps down, 1.5 Mbps up, 170ms RTT)

### Slow 3G
- Lighthouse: `--throttling.downloadThroughputKbps=400 --throttling.uploadThroughputKbps=400 --throttling.rttMs=400`
- WebPageTest: "3G Slow" preset (400 Kbps down, 400 Kbps up, 400ms RTT)

---

## File Structure

```
test/capo-benchmarks/
  pages/
    minimal/
      optimal.html
      common-bad.html
      random.html
      worst.html
    medium/
      optimal.html
      common-bad.html
      random.html
      worst.html
    heavy/
      optimal.html
      common-bad.html
      random.html
      worst.html
  assets/
    css/
      style.css        # shared across all pages
      reset.css
      components.css
    js/
      app.js           # minimal JS, mostly DOMContentLoaded logging
      analytics.js     # mock analytics
      interactions.js  # mock deferred JS
      vendor.js        # mock vendor bundle
      lazy-components.js
    fonts/
      custom-regular.woff2
      custom-bold.woff2
    img/
      hero.webp        # LCP element
      og.png
```

## Run Configuration

```bash
# Per test page: 50 runs, mobile throttling
lighthouse $URL \
  --output=json \
  --output-path=./results/$VARIANT.json \
  --runs=50 \
  --only-categories=performance \
  --chrome-flags="--headless" \
  --throttling-method=simulate
```

Total runs: 24 configs x 50 runs = 1,200 Lighthouse runs.
Estimated time: ~6-8 hours sequential, or ~2 hours with 4 parallel workers.
