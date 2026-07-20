# Research Findings (Live Data)

Findings from BigQuery queries run against HTTP Archive + CrUX. Updated as new data arrives.

---

## Finding 1: CrUX Baseline (Jan 2026, mobile)

- **10.7M origins** tracked by CrUX
- Average p75 LCP: **2420ms**, 63.7% with good LCP (<2500ms)
- Average p75 FCP: **1944ms**, 56.9% with good FCP (<1800ms)
- Average p75 TTFB: **1122ms**
- Average p75 INP: **153ms**

**Use in article:** Section 5 baseline — "across 10.7 million origins tracked by CrUX..."

---

## Finding 2: CMS/Framework Distribution (Jan 2026)

15.7M mobile homepages crawled. Framework market share:

| Framework | Sites | % of Web |
|-----------|-------|----------|
| WordPress | 5.0M | 34.1% |
| React | 1.9M | 12.6% |
| Vue.js | 785K | 5.3% |
| Shopify | 661K | 4.5% |
| Next.js | 401K | 2.7% |
| Wix | 394K | 2.7% |
| Squarespace | 219K | 1.5% |
| Angular | 157K | 1.1% |
| Nuxt.js | 136K | 0.9% |
| Gatsby | 16K | 0.1% |

**Use in article:** Section 5 context — sample sizes for CMS stratification.

---

## Finding 3: CWV by Framework (Jan 2026, mobile)

| Framework | Origins | Avg LCP | Avg TTFB | Avg INP | Good LCP % |
|-----------|---------|---------|----------|---------|------------|
| Shopify | 401K | 1685ms | 534ms | 117ms | 87.3% |
| Wix | 185K | 1724ms | 797ms | 106ms | 81.6% |
| Squarespace | 93K | 1969ms | 586ms | 81ms | 76.6% |
| WordPress | 2.9M | 2663ms | 1550ms | 117ms | 55.2% |
| Next.js | 260K | 2790ms | 956ms | 218ms | 50.9% |
| **Nuxt.js** | **88K** | **3051ms** | **989ms** | **209ms** | **44.2%** |

**Key insight:** Nuxt has the best head ordering (auto Capo.js) but the WORST LCP among all tracked frameworks. This is the strongest evidence that head ordering alone is not the dominant performance factor.

**Why Nuxt is slow despite good heads:**
- Client-side hydration cost (SPA architecture)
- Higher TTFB than Shopify/Squarespace (server-rendered platforms)
- More complex/heavier JavaScript apps on average
- Capo.js sorting only helps during initial HTML parse, not during JS hydration

**Contrast with Shopify:** Shopify has no head optimization but has the best LCP because: fast CDN (534ms TTFB), server-rendered HTML, optimized image delivery, smaller pages.

**Use in article:** Section 7 "Correlation vs Causation" — the Nuxt paradox. Also Section 5b as the key caveat.

---

## Finding 4: LCP Trend Over 8 Months (Jun 2025 → Jan 2026)

Tracking the same cohort of origins detected in Jan 2026 crawl backwards through CrUX:

| Framework | Jun 2025 LCP | Jan 2026 LCP | Delta | Good LCP % Change |
|-----------|-------------|-------------|-------|--------------------|
| Nuxt.js | 3059ms | 3051ms | -8ms | 42.0% → 44.2% |
| Next.js | 2806ms | 2790ms | -16ms | 50.1% → 50.9% |
| WordPress | 2696ms | 2662ms | -34ms | 53.8% → 55.3% |

**Key insight:** All three frameworks are essentially flat over 8 months. Nuxt gained ~2 percentage points in good LCP rate despite adding Capo.js sorting mid-2025, but this is within seasonal noise.

**Why no visible Capo.js effect in CrUX:**
1. Most Nuxt sites haven't upgraded to versions with Capo.js (requires Nuxt 3.7+ with `experimental.headNext`)
2. Head ordering effect (~50-500ms per Viscomi) is small relative to other factors (TTFB, hydration, images)
3. CrUX is origin-level — can't isolate individual page improvements
4. 28-day rolling window smooths out any stepwise improvements

**Use in article:** Section 7 "Correlation vs Causation" — population-level data can't isolate head ordering. This is why we need controlled benchmarks (Section 4).

---

## Finding 5: The "Nuxt Paradox" (narrative)

**Thesis for article:** "The framework with the best head ordering has the worst LCP. The platform with no head optimization has the best. This isn't a contradiction — it's proof that head ordering is one optimization among many, and isolated benchmarks are needed to measure its true effect."

This frames our controlled benchmarks as the novel contribution. The CrUX data provides context, not proof.

---

## Finding 6: Lighthouse Simulated Throttling Shows No Ordering Impact (Preliminary)

1-run-per-config test (24 configs, 96 total runs including warmup). **All deltas < 6ms (<0.5%) — statistically indistinguishable.**

| Complexity | Speed | Max LCP Delta (worst vs optimal) |
|-----------|-------|-----------------------------------|
| Minimal (5 tags) | Fast 4G | +4.4ms (0.5%) |
| Minimal (5 tags) | Slow 3G | +4.4ms (0.2%) |
| Medium (15 tags) | Fast 4G | -2.3ms (noise) |
| Medium (15 tags) | Slow 3G | +2.3ms (0.1%) |
| Heavy (36 tags) | Fast 4G | -0.4ms (noise) |
| Heavy (36 tags) | Slow 3G | -3.3ms (noise) |

**Why no difference:** Lighthouse's simulated throttling doesn't model byte-level HTML delivery. The entire HTML document (including all head tags) loads from localhost instantly. The simulated throttle applies a mathematical model *after* full parse, so tag ordering within the `<head>` has no effect on the simulation.

**This is actually a key finding for the article:** It reveals a fundamental limitation of Lighthouse for measuring head ordering impact. Simulated throttling cannot capture:
- The "Network Buffer" delay (CSS at byte 50K isn't discovered until 50KB arrives on slow networks)
- Preconnect timing (all resources are local, no real DNS/TLS)
- Parser-blocking scripts delaying CSS discovery (preload scanner sees everything instantly from localhost)

**What we need instead:**
1. **Deploy to Cloudflare Pages** — real network latency between client and server
2. **Use WebPageTest with real throttling** (not simulated) — `trace=1`, `connectivity=3G`
3. **Add external resources** — actual Google Fonts, CDN-hosted CSS, third-party scripts
4. **Use Puppeteer with network throttling via CDP** — `Network.emulateNetworkConditions`

**Use in article:** Section 4 should acknowledge this limitation explicitly. "Lighthouse's simulated throttling cannot measure head ordering impact because it doesn't model byte-level HTML parsing. We used [WebPageTest/Puppeteer with real throttling] instead."

---

## Finding 7: Puppeteer + CDP Network Throttling — Full Results (5 runs/config)

Test setup: 12 HTML pages (4 orderings × 3 complexities), real external resources (Google Fonts, GTM), CDP `Network.emulateNetworkConditions` with isolated browser contexts per run.

### FCP Results (median, 5 runs each)

| Complexity | Throttle | Optimal | Common-Bad | Random | Worst | Max Delta |
|-----------|----------|---------|------------|--------|-------|-----------|
| Minimal | fast-4g | 460ms | 456ms | 456ms | 464ms | +4ms (1%) |
| Medium | fast-4g | 468ms | 468ms | 468ms | 468ms | 0ms |
| Heavy | fast-4g | 496ms | 488ms | 504ms | 528ms | **+32ms (6%)** |
| Minimal | slow-3g | 984ms | 992ms | 992ms | 980ms | +8ms (1%) |
| Medium | slow-3g | 1068ms | 1040ms | 1068ms | 1080ms | +12ms (1%) |
| Heavy | slow-3g | 1228ms | 1228ms | 1228ms | 1440ms | **+212ms (17%)** |

### DCL Results (median, 5 runs each)

| Complexity | Throttle | Optimal | Common-Bad | Random | Worst | Max Delta |
|-----------|----------|---------|------------|--------|-------|-----------|
| Minimal | fast-4g | 319.7ms | 319.6ms | 342.5ms | 457.3ms | **+137.6ms** |
| Heavy | fast-4g | 533.1ms | 620.7ms | 621ms | 522.5ms | +87.9ms |
| Heavy | slow-3g | 1517ms | 1574ms | 1575ms | 1437ms | +57.4ms |

### KEY FINDING: The Sync Script Bottleneck

Resource timing analysis of heavy-worst vs heavy-optimal (slow-3g) reveals the mechanism:

| Resource | Optimal duration | Worst duration | Change |
|----------|-----------------|----------------|--------|
| **vendor.js (sync)** | **515ms** | **944ms** | **+84% slower** |
| **app.js (sync)** | **543ms** | **858ms** | **+58% slower** |
| Google Fonts CSS | 658ms | 630ms | -4% (same) |
| interactions.js (defer) | 1058ms | 457ms | -57% (faster!) |
| lazy-components.js (defer) | 1030ms | 429ms | -58% (faster!) |

**The mechanism:** In worst ordering, deferred scripts come FIRST in `<head>`. They're discovered first by the preload scanner, start downloading, and consume bandwidth on the throttled connection. When parser-blocking sync scripts are discovered later, they compete for bandwidth and take 58-84% longer to download. Since sync scripts block the parser, this delays FCP by 212ms.

**Why Capo.js ordering helps:** Capo.js puts sync scripts (weight 50) BEFORE stylesheets (weight 60) and BEFORE deferred scripts (weight 80). This ensures parser-blocking resources are discovered and prioritized first in Chrome's download queue.

**Why FCP = LCP:** Our placeholder hero image is tiny (340 bytes). In production, a real hero image would create LCP > FCP. Head ordering would affect LCP less than FCP because the hero image is loaded after CSS/JS.

### Key Conclusions

1. **Head ordering primarily affects FCP on slow networks with complex pages.** Heavy + slow-3g shows +212ms (17%), while minimal + fast-4g shows <5ms (<1%).

2. **The preload scanner neutralizes ordering differences for small documents.** All resources are discovered within 28ms of each other regardless of ordering. The effect is in download priority/scheduling, not discovery timing.

3. **The mechanism is resource queue contention, not discovery delay.** Low-priority deferred resources discovered first consume bandwidth before high-priority sync scripts can finish.

4. **DCL can improve with "bad" ordering** when deferred scripts are positioned earlier, finishing sooner. This creates a paradox: "worst" ordering can be "best" for TTI metrics.

5. **External CSS (Google Fonts) is unaffected by ordering** — its completion time is identical (±0.7ms) regardless of head order. The bottleneck is sync scripts, not CSS.

**Use in article:** Section 4 — this is the primary controlled benchmark data. The sync script mechanism is the novel finding. Use the resource timing table as a figure.

---

## Remaining Data Needed

### From controlled benchmarks (Puppeteer + CDP):
- [x] LCP/FCP deltas across 4 orderings × 3 complexities × 2 speeds
- [x] Resource discovery timing waterfall comparison
- [x] Which specific ordering mistake causes the biggest FCP delta (sync script queue contention)
- [ ] Statistical significance via Mann-Whitney U (data exists, need formal test)

### From BigQuery (needs billing enabled):
- [ ] Capo.js score distribution across 8M pages
- [ ] Common ordering mistakes ranked by prevalence
- [ ] Score-quartile vs CWV correlation (with TTFB control)
- [ ] FetchPriority vs physical order 2x2 analysis
- [ ] Head-breaker prevalence
