# Work Split: Claude vs Gemini

## Key Context

- **Nuxt 4 does NOT support streaming** — removed from scope
- **Unhead already has streaming examples** at `/home/harlan/pkg/unhead/examples/` for React, Vue, Solid, Svelte
- Unhead uses a unified `createStreamableHead()` API with `window.__unhead__` queue for late head injection
- Svelte streaming is sync-only (no async head updates)
- The existing examples can serve as framework test apps — we extend them with benchmark scenarios rather than building from scratch

## Completed Work

### Gemini Research (All Done)
- G1-G16: Framework streaming behavior, browser parsing, crawler behavior, Web Almanac stats, Unhead internals
- GA-GD: BigQuery SQL drafts, 5 breakage case studies, article section drafts, Unhead deep-dive

### Claude Infrastructure + BigQuery (Done)
- C6: Raw Node.js streaming server with 5 strategies (built)
- C11-C12: BigQuery queries (run, results saved)
- **BigQuery results saved to `test/streaming-benchmarks/results/`**:
  - Framework adoption: 342k Next.js, 147k Angular, 109k Nuxt, 29k Astro, etc.
  - Title-changed-on-render: Angular 37.5%, SvelteKit 16%, Next.js 9.6%, Qwik 2%
  - Framework CWV comparison: Astro leads FCP/LCP, Angular best CLS
  - Head completeness in chunked responses: JSON-LD drops 3x in chunked Next.js
- **Quota hit**: title_changed × CWV correlation query (557GB) needs next month's free tier

---

## Remaining Work

### Next Session: Article Draft (highest impact)

We have enough data to write the article NOW. The BigQuery data + Gemini research + framework comparison is sufficient for a strong first draft.

| # | Task | Priority | Est. Effort |
|---|------|----------|-------------|
| C18 | **Write the article** | **Critical** | 1 session |
| | Use: Gemini drafts (phase2.md §C1-C3), BigQuery results, framework comparison from research | | |
| | File: `content/learn/streaming-head-performance.md` | | |
| | Follow format of `content/learn/what-is-capo.md` | | |

### Next Session: Capture Scripts + Benchmarks (supplementary data)

These produce the controlled benchmark data + waterfall visualizations. Nice to have but article can publish without them.

| # | Task | Priority | Est. Effort |
|---|------|----------|-------------|
| C7 | Puppeteer chunk capture script | Medium | 30 min |
| C8 | Chrome trace capture script | Medium | 30 min |
| C9 | Head-state capture (FCP vs hydration) | Medium | 30 min |
| C10 | Lighthouse/WPT automation for raw server | Medium | 30 min |
| C15 | Run controlled benchmarks (30 configs) | Medium | 1 hour (compute) |

### Future: Framework Test App Extensions

Extend existing Unhead examples for reproducible benchmarks. Lower priority since BigQuery data tells the at-scale story.

| # | Task | Priority |
|---|------|----------|
| C1 | Extend React streaming example | Low |
| C4 | Extend Vue streaming example | Low |
| C5 | Extend Solid streaming example | Low |
| C3 | Next.js native vs Unhead comparison | Low |

### Future: Visualization + Interactive Components

| # | Task | Priority |
|---|------|----------|
| C13 | Streaming timeline visualization (Vue component) | Low |
| C19 | Interactive components for article | Low |

### Deferred: Needs Next Month's BigQuery Quota

| # | Task | Query Cost |
|---|------|-----------|
| — | title_changed × CWV correlation (the smoking gun query) | 557 GB |

---

## Recommended Next Session Plan

**Option A: Write the article (1 session)**
1. Draft `content/learn/streaming-head-performance.md` using all collected data
2. Incorporate Gemini's draft sections, BigQuery findings, framework comparison table
3. Add Unhead positioning section
4. Cross-link to `/learn/what-is-capo` and `/tools/capo-analyzer`

**Option B: Benchmarks then article (2 sessions)**
1. Session 1: Build capture scripts (C7-C9), run benchmarks on raw server (C15)
2. Session 2: Write article with benchmark data + BigQuery data

**Option C: Full pipeline (3+ sessions)**
1. Session 1: Capture scripts + raw server benchmarks
2. Session 2: Extend Unhead examples, run framework head audits
3. Session 3: Write article with all data
4. Session 4: Interactive visualizations

Option A is recommended — we have novel data that nobody else has. Ship the article, iterate later with benchmark data.
