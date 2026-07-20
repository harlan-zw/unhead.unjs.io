# Capo.js Performance Research Plan

Original research article: **"Does Head Tag Order Actually Affect Performance?"**

The existing `content/learn/what-is-capo.md` explains the *theory*. This article provides the *evidence*. Nobody has published rigorous, reproducible research quantifying the real-world impact of head tag ordering on Core Web Vitals.

## How Everything Fits Together

```
RESEARCH PHASE (parallel)
========================

  Gemini (research)                    Claude (code)
  ─────────────────                    ─────────────
  gemini-prompt.md                     test-matrix.md
       │                                    │
       ▼                                    ▼
  gemini-findings.md ◄── Gemini writes  Build test pages
  (Gemini creates this)                 in test/capo-benchmarks/
       │
       ├──► Sections 2,3 ──► Fix bigquery-queries.md (table names, schemas)
       ├──► Section 5 ──────► Inform Puppeteer trace capture (what events to look for)
       ├──► Section 7 ──────► Add confounders to Query 5 in bigquery-queries.md
       ├──► Section 8 ──────► Decide Lighthouse vs WebPageTest config
       └──► Section 6 ──────► Adjust scope (avoid duplicating existing research)


DATA COLLECTION PHASE (sequential)
===================================

  bigquery-queries.md ──► Run in BigQuery ──► results/bigquery/*.csv
  test-matrix.md ──► Run benchmarks ──► results/lighthouse/*.json
  Puppeteer traces ──► results/traces/*.json


ANALYSIS & WRITING PHASE
=========================

  All results ──► Statistical analysis ──► article-outline.md (fill in real data)
                                               │
                                               ▼
                                    content/learn/capo-performance-research.md
                                           (final article)
```

## Files in This Directory

| File | Owner | Purpose | Depends On |
|------|-------|---------|------------|
| `README.md` | — | This file. Overview and data flow. | — |
| `research-approaches.md` | — | 5 research pillars with detailed methodology | — |
| `work-split.md` | — | Claude vs Gemini task tables + execution phases | — |
| `article-outline.md` | — | Article structure, SEO, frontmatter. Skeleton that gets filled with real data. | All results |
| `gemini-prompt.md` | Harlan | Copy-paste to Gemini. Defines 8 research areas. | — |
| `gemini-findings.md` | Gemini | **Gemini creates this file** with its research output. | `gemini-prompt.md` |
| `bigquery-queries.md` | Claude | Draft SQL queries. Updated after Gemini confirms schemas. | `gemini-findings.md` sections 2,3,7 |
| `test-matrix.md` | Claude | 24 test page specs, HTML templates, run config. | `gemini-findings.md` section 8 |

## Output Artifacts

| Path | What | Status |
|------|------|--------|
| `test/capo-benchmarks/pages/` | 12 static HTML test pages (4 orderings x 3 complexities) | DONE |
| `test/capo-benchmarks/scripts/` | Benchmark automation (serve, lighthouse, traces, analyze) | DONE |
| `test/capo-benchmarks/results/bigquery/` | CrUX + HTTP Archive query results | PARTIAL (free tier) |
| `test/capo-benchmarks/results/lighthouse/` | Raw Lighthouse JSON results | TODO |
| `test/capo-benchmarks/results/traces/` | Chrome trace JSON files | TODO |
| `findings.md` | Compiled findings with article section mapping | IN PROGRESS |
| `content/learn/capo-performance-research.md` | **Final article** | TODO |

## Progress

### Done
- [x] Gemini research (sections 1-8 + section 10: CMS patterns)
- [x] Test pages built (12 HTML files, verified tag parity)
- [x] Benchmark scripts built (serve, lighthouse, traces, analyze)
- [x] BigQuery auth + gcloud installed
- [x] BigQuery schema verified (Gemini's `crawl.bodies` was wrong → actual: `crawl.requests.response_body`)
- [x] Free CrUX queries run: baseline, CWV by CMS, 8-month LCP trend
- [x] Key finding: "Nuxt Paradox" — best head ordering, worst LCP

### Done (continued)
- [x] Local asset files created (CSS, JS, fonts, images)
- [x] Minimal pages updated to include external resources (Google Fonts)
- [x] Lighthouse simulated throttling tested → confirmed no ordering impact (Finding 6)
- [x] capture-traces.ts rewritten with CDP network throttling + isolated browser contexts
- [x] Preliminary 1-run test shows +180ms FCP for worst vs optimal (heavy, slow-3g)

### Done (benchmarks)
- [x] 5-run benchmark complete (24 configs × 5 runs = 120 page loads)
- [x] Resource timing analysis reveals sync script queue contention mechanism
- [x] Key result: heavy + slow-3g worst ordering → +212ms FCP (+17%)
- [x] Key finding: Preload scanner neutralizes ordering for small documents

### Next: Article Writing
- [ ] Write final article at `content/learn/capo-performance-research.md`
- [ ] Create interactive visualizations for benchmark data
- [ ] Formal statistical significance test (Mann-Whitney U)

### Blocked on Billing
- [ ] BigQuery body scanning (Capo.js score distribution, mistake prevalence)
- [ ] FetchPriority vs physical order correlation
- [ ] Head-breaker prevalence
