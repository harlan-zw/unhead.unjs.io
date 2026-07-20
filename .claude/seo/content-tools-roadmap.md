# Content & Tools Expansion Roadmap

> Building on the Q1 2026 plan. Focused on what's **unique to Unhead** — code generation, head management internals, migration tooling. Generic SEO tools (meta checker, robots.txt, schema validator, social debugger) already live on nuxtseo.com.

---

## New Tools (this repo)

### T1: Capo.js Head Order Analyzer
**Target keywords:** "head tag order", "capo.js", "html head performance"
**Difficulty:** Medium | **Priority:** High

**No one else has this.** Capo.js tag ordering is Unhead's unique feature.

- Paste HTML or enter a URL → fetch and parse the `<head>`
- Score the tag order against Capo.js optimal ordering rules
- Visual before/after: show current order vs recommended order with color-coded priority levels
- Explain *why* each tag should be in a specific position (e.g., "charset before title for faster encoding detection")
- Generate `useHead()` code with correct ordering baked in
- Link to Unhead's positions/ordering docs

**SEO meta:**
- Title: `Head Tag Order Analyzer - Optimize HTML Head Performance | Unhead`
- Desc: `Analyze your HTML head tag order for optimal page load performance. Capo.js-powered scoring with before/after comparison and useHead() code output.`

**Why this wins:** Completely unique tool. Creates a new category. Performance-focused developers will share it.

---

### T2: HTML Head → Unhead Code Converter
**Target keywords:** "html to vue head", "react helmet to unhead", "vue-meta to unhead migration"
**Difficulty:** Low-Medium | **Priority:** High

Migration/adoption funnel tool:

- Paste raw HTML `<head>` tags → get equivalent `useHead()` / `useSeoMeta()` / `useSchemaOrg()` code
- Paste react-helmet JSX → get Unhead React code
- Paste vue-meta config → get Unhead Vue code
- Framework selector (Vue, React, Svelte, Solid, Angular, vanilla)
- Detects JSON-LD scripts and converts to `useSchemaOrg()` calls
- Flags deprecated patterns (http-equiv refresh, meta keywords)

**SEO meta:**
- Title: `HTML Head to Code Converter - Migrate to Unhead | Unhead`
- Desc: `Convert HTML head tags, React Helmet, or vue-meta to Unhead code. Paste your markup, get useHead() and useSeoMeta() output instantly.`

**Why this wins:** Directly drives adoption. Every migration search funnels here. Pairs with comparison content (C1).

---

### T3: useHead Playground
**Target keywords:** "unhead playground", "vue head playground", "useHead example"
**Difficulty:** Medium-High | **Priority:** Medium

Interactive sandbox for trying Unhead:

- Live editor: write `useHead()` / `useSeoMeta()` / `useSchemaOrg()` calls
- Real-time rendered HTML `<head>` output panel
- SERP preview + social card preview (reuse existing meta-tag-generator preview components)
- Shareable URLs (encode state in hash/query)
- Starter templates: "Basic SEO", "Blog Post", "Product Page", "Local Business"
- Framework selector changes import style

**SEO meta:**
- Title: `Unhead Playground - Try useHead & useSeoMeta Live | Unhead`
- Desc: `Interactive playground for Unhead. Write useHead() and useSeoMeta() code, see rendered HTML head output live. Shareable examples for Vue, React, Svelte.`

**Why this wins:** Playgrounds are sticky — high time-on-page, high share rate. Reduces adoption friction.

---

### T4: Script Loading Strategy Advisor
**Target keywords:** "async vs defer", "script loading strategy", "third party script performance"
**Difficulty:** Low | **Priority:** Low

Simple but useful decision-tree tool:

- Select script type (analytics, chat widget, font, map, payment, social embed)
- Shows recommended loading strategy (async, defer, worker, lazy, idle)
- Generates `useScript()` code with the right strategy
- Explains tradeoffs (blocking vs non-blocking, interaction delay, etc.)
- Links to Unhead script loading docs

---

## Tools Index Page

### T0: `/tools` Landing Page
**Priority:** High (do first) | **Effort:** Low

Nav already links to `/tools` but page doesn't exist. Create:
- Grid of all Unhead tools with descriptions
- Category: "Code Generators" (meta tag, schema, OG image) + "Analysis" (capo analyzer, converter)
- Cross-link to nuxtseo.com tools for generic SEO tools ("Looking for meta tag checker? → nuxtseo.com")
- This page is mostly a navigation hub, not a traffic driver

**SEO meta:**
- Title: `Free Head Management & Code Generation Tools | Unhead`
- Desc: `Developer tools for HTML head management. Generate useHead, useSeoMeta, and useSchemaOrg code. Analyze head tag order with Capo.js scoring.`

---

## New Content (upstream: unjs/unhead)

### C1: Framework Comparison / Migration Pages
**Priority:** High | **Effort:** Medium

These pair with the converter tool (T2) to create a migration funnel.

#### `/docs/react/head/guides/get-started/vs-react-helmet`
**Target:** "react helmet vs" (200+/mo), "react helmet alternative" (200+/mo)
- Feature comparison table (bundle size, React 19 support, SSR, TypeScript)
- Side-by-side code examples
- Already partially exists as migration guide — expand with comparison angle
- CTA: "Try the converter tool to migrate your code automatically"

#### `/docs/vue/head/guides/get-started/vs-vue-meta`
**Target:** "vue-meta alternative", "vue 3 head management"
- vue-meta is Vue 2 era, no active Vue 3 support
- Comparison table + migration steps
- CTA → converter tool

#### `/docs/head/guides/get-started/vs-next-seo`
**Target:** "next-seo alternative", "next.js head management"
- next-seo is Next.js-only; Unhead works everywhere
- Show how same code works across frameworks

### C2: Long-Tail "How To" Guides
**Priority:** Medium | **Effort:** Low each

Short, focused guides targeting specific developer search queries:

| Guide | Target Keyword | Est. Volume |
|-------|---------------|-------------|
| How to add meta tags in Vue 3 | "vue meta tags" | 500+/mo |
| How to set page title in React | "react set title" | 800+/mo |
| How to add structured data to your site | "how to add schema markup" | 1,000+/mo |
| How to load third-party scripts safely | "async defer script" | 2,000+/mo |
| How to handle duplicate meta tags | "duplicate meta tags" | 300+/mo |
| HTML head tag best practices 2026 | "html head best practices" | 500+/mo |
| SSR head management guide | "ssr meta tags" | 200+/mo |

Each guide:
- Answer the question in the first paragraph (AI Overview bait)
- Show the Unhead solution with code
- Include vanilla JS alternative for comparison
- Link to API docs + relevant tools

### C3: Remaining Schema.org Type Pages
**Priority:** Medium | **Effort:** Medium (templated)

After Q1's top 7 types, expand with the same "Answer-First" format:

| Type | Est. Volume |
|------|-------------|
| FAQPage | 2,000+/mo |
| Product | 3,000+/mo |
| Recipe | 1,500+/mo |
| Event | 1,000+/mo |
| Person | 800+/mo |
| BreadcrumbList | 500+/mo |
| VideoObject | 500+/mo |
| Course | 400+/mo |
| Review | 400+/mo |

Template: "What is X" → JSON-LD example → Required properties → Unhead usage → Generator link.

### C4: "What is Unhead?" Evergreen Page
**Priority:** Low | **Effort:** Low

From P5 in Q1 plan:
- What Unhead does in plain English
- Framework support matrix
- Key differentiators (Capo.js, universal, TypeScript-first)
- Community stats
- Use cases

---

## Implementation Priority

### Phase 1 (Q2 Apr-May) — Quick wins
1. **T0** — Tools index page (1 day)
2. **T2** — HTML Head → Code converter (3-5 days, high adoption impact)
3. **C1** — React Helmet comparison page (1 day, builds on existing)
4. **C2** — Top 3 how-to guides (1 day each)

### Phase 2 (Q2 May-Jun) — Unique differentiator
5. **T1** — Capo.js head order analyzer (1 week)
6. **C1** — vue-meta + next-seo comparison pages (1 day each)
7. **C2** — Remaining how-to guides

### Phase 3 (Q3 Jul-Aug) — Ecosystem completion
8. **T3** — useHead playground (1-2 weeks)
9. **C3** — Remaining schema type pages (templated, 1 week)
10. **C4** — "What is Unhead?" page (1 day)

### Phase 4 (Q3-Q4) — Long tail
11. **T4** — Script loading advisor (2-3 days)
12. Content refinements based on GSC data

---

## Traffic Projections

| Item | Est. Monthly Traffic (6mo) | Confidence |
|------|---------------------------|------------|
| Capo.js Analyzer (T1) | 50-200 clicks | Medium |
| Code Converter (T2) | 100-300 clicks | High |
| Playground (T3) | 50-150 clicks | Medium |
| Framework comparisons (C1) | 100-300 clicks | High |
| How-to guides (C2) | 200-500 clicks | High |
| Schema type expansion (C3) | 300-800 clicks | High |
| **Total new traffic** | **800-2,250/mo** | |

More conservative than previous estimates since we're not competing on high-volume generic tool keywords. But these visitors are **higher quality** — they're developers actively looking at head management solutions.

Combined with Q1 actions (schema revamp, title fixes, CTR optimization): realistic H2 target **1,500-3,000 monthly clicks** (vs current ~600).

---

## Cross-linking Strategy

Unhead tools ↔ Unhead docs:
- Code converter ↔ comparison pages ↔ installation guides
- Capo.js analyzer ↔ positions/ordering docs ↔ head best practices guide
- Schema generator ↔ schema type guides ↔ schema how-to guide
- Meta tag generator ↔ useSeoMeta docs ↔ vue meta tags guide
- Playground ↔ all API docs (embed "try it" links)

Unhead ↔ NuxtSEO cross-promotion:
- Unhead tools page → "Need meta tag checking or robots.txt? → nuxtseo.com/tools"
- NuxtSEO tools → "Generate code with Unhead → unhead.unjs.io/tools"
- Shared users see both as part of the ecosystem
