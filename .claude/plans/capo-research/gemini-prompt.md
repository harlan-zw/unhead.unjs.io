# Gemini Research Prompt

Copy-paste this to Gemini to kick off parallel research.

---

## Context & How Your Output Will Be Used

I'm writing an original research article: **"Does Head Tag Order Actually Affect Performance?"** for unhead.unjs.io. Unhead is a framework-agnostic library for managing HTML `<head>` tags. It implements Capo.js tag ordering automatically.

**Your role:** You're the research half of a two-person team. I (Claude, a coding AI) handle all code, queries, benchmarks, and writing. You handle discovery, literature review, and schema research. Your output directly unblocks my work.

**Where to put your output:** Write your full response as a single document structured by the 8 sections below. I'll save it as `gemini-findings.md` in our plan directory. Here's how each section feeds into downstream work:

| Your Section | What It Unblocks |
|---|---|
| 1. Rick Viscomi research | Article citations, framing of what's known vs novel |
| 2. HTTP Archive schema | I fix my BigQuery SQL queries (currently using guessed table/field names) |
| 3. CrUX schema | I fix my CrUX join queries (need exact table names, join keys, metric fields) |
| 4. Web Almanac | Article citations, baseline statistics to compare our findings against |
| 5. Preload scanner | Determines what we measure in browser traces and what ordering effects are real vs mitigated |
| 6. Existing research | Determines scope — we skip what's already proven, focus on gaps |
| 7. Confounders | I add controls to BigQuery Query 5 (currently a skeleton) |
| 8. WebPageTest API | I decide between Lighthouse CLI vs WPT API for benchmarks |

**What I already have drafted (you don't need to redo these):**
- 5 BigQuery SQL queries (draft, need schema corrections from your sections 2+3)
- 24 test page specs (4 head orderings x 3 complexities x 2 speeds)
- Full article outline with sections waiting for real data
- Capo.js scoring function (JS UDF for BigQuery)

**Be specific.** I need exact table names like `httparchive.all.pages`, exact field names like `response_body`, exact CrUX metric names. Guesses are worse than gaps — if you're unsure, say so and I'll verify.

---

I need you to research the following 8 areas. For each, provide specific links, quotes, and data where possible. Prioritize primary sources over summaries.

## 1. Rick Viscomi's Original Capo.js Research

Find his blog posts, conference talks (especially Chrome Dev Summit / Google I/O), and any data or benchmarks he published showing performance impact of head tag ordering. He works at Google on the Chrome DevRel team and created capo.js (https://github.com/rviscomi/capo.js).

Specifically I need:
- The original motivation and any performance data he cited
- Any talks where he demonstrates the impact with real measurements
- His methodology for determining the optimal ordering weights
- Any caveats or limitations he acknowledged

## 2. HTTP Archive BigQuery Schema

I want to extract raw `<head>` HTML from crawled pages to score their tag ordering.

- What tables contain response bodies? (`httparchive.response_bodies`, `httparchive.pages`, etc.)
- What's the current schema? (tables have changed over the years)
- How do I extract just the `<head>` content from the HTML body?
- What's the most recent available crawl date?
- What are the BigQuery costs/limits for scanning response bodies?
- Provide example queries for extracting head content

## 3. CrUX BigQuery Dataset

I want to correlate head tag ordering with real-user Core Web Vitals.

- What tables and fields are available? (`chrome-ux-report.materialized.*`)
- How do I get LCP, FCP, INP, TTFB by origin?
- What's the join key with HTTP Archive? (origin? URL?)
- What granularity is available? (origin-level vs URL-level)
- What's the data freshness? (how recent is the latest month?)
- Provide an example query for origin-level CWV percentiles

## 4. Web Almanac 2024

Find sections in the HTTP Archive Web Almanac (2024 edition, or 2022 if 2024 isn't published) that discuss:

- HTML head element structure and common patterns
- Resource hint usage (preconnect, preload, prefetch, dns-prefetch) — how many sites use them, common mistakes
- Preload scanner / speculative parsing behavior
- Head tag ordering specifically (if mentioned)
- Any statistics on charset placement, viewport placement, script loading patterns

Provide chapter links and the specific statistics with context.

## 5. Chrome Preload Scanner Internals

This is critical — does the position of tags in `<head>` actually affect when resources are discovered by Chrome's speculative parser?

- How does Chrome's preload scanner (speculative parser) work?
- Does it scan ahead past blocking scripts? (I believe yes, but need confirmation)
- Does tag position affect discovery time even with the preload scanner?
- Are there cases where the preload scanner can't help? (e.g., charset re-parsing)
- Find Chromium source code references if possible (`HTMLPreloadScanner`, `TokenPreloadScanner`)
- Find Chrome DevRel documentation on this topic
- How do other browsers (Firefox, Safari) handle speculative parsing?

## 6. Existing Research on Head Tag Ordering

Has anyone published benchmarks or studies specifically on head tag ordering and performance?

Search:
- web.dev and developer.chrome.com
- Performance engineering blogs (Harry Roberts/csswizardry, Tim Kadlec, Andy Davies)
- Academic papers (ACM, IEEE)
- Conference talks (performance.now(), PerfPlanet, Web Directions)
- Blog posts from browser engineers

I need to know what's already been proven so we don't duplicate effort, and so we can cite prior work.

## 7. Confounding Variables for Correlation Study

For a study correlating head tag ordering quality with Core Web Vitals across millions of pages, what confounders should I control for?

Categories I'm thinking of:
- Page characteristics (total weight, number of requests, DOM size)
- Server characteristics (TTFB, CDN usage, HTTP version, TLS)
- Content type (e-commerce, blog, SaaS, docs)
- Technology (CMS/framework — WordPress, Next.js, Nuxt, etc.)
- Geographic distribution

For each confounder:
- Why it matters
- How to measure/detect it from HTTP Archive data
- Whether it's available in CrUX

## 8. WebPageTest API

I'll be running automated benchmarks on test pages with different head orderings.

- What API options give the most granular resource timing data?
- Can I capture Chrome trace files via the API?
- What settings should I use for consistent, reproducible results?
- How do I test at different connection speeds?
- What's the free tier limit?
- Is there a way to capture preload scanner behavior specifically?

---

## Output Format

Structure your response as a markdown document I can save directly as `gemini-findings.md`. Use this exact format for each section:

```markdown
## Section N: [Title]

### Key Findings
- Bullet points with specifics (exact table names, exact field names, exact statistics)
- Quote relevant passages with attribution

### Actionable for Claude
- What I should change in my queries/code/article based on this
- E.g., "Replace `httparchive.response_bodies.YYYY_MM_DD` with `httparchive.all.requests` — the response_bodies tables were deprecated in 2023"

### Sources
- [Title](URL) — one-line description of what's in it

### Gaps & Uncertainties
- What you couldn't confirm — flag these clearly so I know what to verify myself
- Distinguish between "I couldn't find this" vs "this doesn't exist"
```

**Critical reminders:**
- For sections 2 and 3: I need **exact current table names and field names**, not historical ones. HTTP Archive has changed schemas multiple times. If unsure which is current, list the candidates and flag the uncertainty.
- For section 5: The preload scanner findings directly determine whether our research hypothesis is valid. If the scanner fully mitigates ordering issues, our controlled benchmarks may show no difference — I need to know this upfront.
- For section 6: If someone has already published comprehensive head-ordering benchmarks, tell me immediately so we can pivot our angle from "first study" to "largest-scale study" or "first study with CrUX correlation".
