# Work Split: Claude vs Gemini

## Gemini (Research & Discovery)

Gemini's strength: web search, finding sources, synthesizing existing knowledge.

| # | Task | Expected Output |
|---|------|-----------------|
| G1 | Find Rick Viscomi's original Capo.js research, talks, data | Links, quotes, key claims with citations |
| G2 | Research HTTP Archive BigQuery schema for raw HTML extraction | Table names, field descriptions, example queries |
| G3 | Research CrUX BigQuery schema and join strategy with HTTP Archive | Schema docs, join keys, available metrics |
| G4 | Find Web Almanac 2024 sections on head ordering, resource hints, preload scanner | Chapter links, relevant statistics, quotes |
| G5 | Research Chrome preload scanner internals | Chromium source refs, DevRel docs, how position affects discovery |
| G6 | Find existing benchmarks/studies on head tag ordering and performance | Papers, blog posts, benchmark results |
| G7 | Identify confounding variables for correlation study | Categorized list with rationale |
| G8 | Research WebPageTest API for granular resource timing capture | API options, recommended settings |
| G9 | Find real-world examples of sites with notably bad head ordering | URLs, screenshots, specific issues |
| G10 | Research statistical methods for web performance correlation studies | Appropriate tests, sample size requirements |

## Claude (Code & Analysis)

Claude's strength: writing code, building things, technical analysis.

| # | Task | Expected Output | Depends On |
|---|------|-----------------|------------|
| C1 | Build 24 test pages (4 orderings x 3 complexities x 2 speed configs) | Static HTML files in `test/capo-benchmarks/` | — |
| C2 | Write Lighthouse automation script (batch run + CSV export) | `scripts/benchmark-lighthouse.ts` | C1 |
| C3 | Write WebPageTest API automation (if Lighthouse insufficient) | `scripts/benchmark-wpt.ts` | C1, G8 |
| C4 | Write BigQuery SQL: extract + score head tags from HTTP Archive | `queries/httparchive-capo-score.sql` | G2 |
| C5 | Write BigQuery SQL: join with CrUX, quartile analysis | `queries/crux-correlation.sql` | G3, C4 |
| C6 | Write BigQuery SQL: confounders control query | `queries/controlled-analysis.sql` | G7, C5 |
| C7 | Build Puppeteer trace capture script | `scripts/capture-traces.ts` | C1 |
| C8 | Build waterfall visualization from trace data | Vue component or SVG generator | C7 |
| C9 | Run benchmarks, collect data | Raw CSV/JSON results | C1-C3 |
| C10 | Statistical analysis of results | Summary tables, significance tests | C9 |
| C11 | Write the article | `content/learn/capo-performance-research.md` | All above |
| C12 | Build interactive components for article (if needed) | Vue components | C8, C11 |

## Execution Order

### Phase 1: Research (parallel)
- Gemini: G1-G10 (all can run in parallel)
- Claude: C1 (build test pages — no dependencies)

### Phase 2: Infrastructure (after Phase 1)
- Claude: C2, C3 (benchmark scripts, informed by G8)
- Claude: C4, C5, C6 (BigQuery queries, informed by G2, G3, G7)
- Claude: C7 (trace capture)

### Phase 3: Data Collection
- Claude: C9 (run benchmarks)
- Claude: Execute BigQuery queries (requires BigQuery access)

### Phase 4: Analysis & Writing
- Claude: C8, C10 (visualizations + statistics)
- Claude: C11, C12 (article + components)

## Handoff Artifact

Gemini writes all findings into a single file: **`gemini-findings.md`** (in this directory). Structured by 8 sections matching the prompt, each with Key Findings, Actionable for Claude, Sources, and Gaps.

## Coordination Points

| Trigger | Action | Files Modified |
|---------|--------|----------------|
| Gemini delivers sections 2+3 | Claude fixes BigQuery table/field names | `bigquery-queries.md` |
| Gemini delivers section 5 | Claude decides what trace events to capture + whether hypothesis holds | `research-approaches.md` section 4, potentially scope change |
| Gemini delivers section 6 | Claude adjusts novelty framing (first study? largest? first with CrUX?) | `article-outline.md` intro |
| Gemini delivers section 7 | Claude builds controlled analysis query | `bigquery-queries.md` Query 5 |
| Gemini delivers section 8 | Claude decides Lighthouse CLI vs WebPageTest API | `test-matrix.md` run config |
| All Gemini tasks done | Claude has full context for article writing | `content/learn/capo-performance-research.md` |

## What Gemini Does NOT Need To Do

- Write code or SQL (Claude handles all queries)
- Build test pages (Claude handles from test-matrix.md specs)
- Write the article (Claude handles from article-outline.md)
- Run benchmarks (Claude + manual execution)

Gemini's only deliverable is `gemini-findings.md` — pure research.
