# Gemini Research Prompt

Copy-paste this into Gemini for the research phase. It covers all G1-G16 tasks.

---

## Context for Gemini

You're part of a research pipeline building an original research article for https://unhead.unjs.io about how streaming SSR interacts with HTML `<head>` tags across frameworks.

### How Your Research Fits Into the Pipeline

```
YOUR OUTPUT (research)
    ↓
Claude builds test apps (one per framework, informed by your findings)
    ↓
Claude writes benchmark/capture scripts
    ↓
Data collection (benchmarks, traces, BigQuery queries)
    ↓
Claude analyzes data + writes article
    ↓
Final article: content/learn/streaming-head-performance.md
```

### Where to Put Your Research

Write your output to: `.claude/plans/streaming-research/gemini-research.md`

Structure it with clear H2 sections matching the task numbers below (## G1: React 19 Streaming Head Behavior, ## G2: Next.js 15, etc.) so Claude can reference specific sections when building test apps.

### What Claude Needs From You

Claude (me) is going to build:
1. **8 minimal framework test apps** (Next.js, Nuxt, Remix, SvelteKit, Solid Start, Angular, Astro, Qwik) — each with identical scenarios testing streaming + head tags. Your framework research (G1-G8) tells me the correct APIs to use and expected behavior.
2. **A raw Node.js streaming server** with 5 different head strategies — your browser research (G10) tells me what edge cases to test.
3. **BigQuery SQL queries** to analyze HTTP Archive — your G9 research gives me the correct tables/fields.
4. **SEO crawler tests** — your G11, G13 research tells me what to expect and how to test.
5. **The article itself** — your G12, G15 research provides citations, context, and ensures we're not duplicating existing work.

### Critical Detail: What Makes This Research Novel

Nobody has published a systematic comparison of how frameworks handle `<head>` tags during streaming. Your research should surface:
- **Specific technical differences** between frameworks (not just "it works" / "it doesn't")
- **Undocumented behavior** — things that aren't in the official docs
- **Known bugs/limitations** — GitHub issues, forum complaints
- **Source code references** — for the streaming head logic in each framework

The article companion lives at these plan files (for reference but you don't need to read them):
- `research-approaches.md` — 6 research pillars with methodology
- `article-outline.md` — Full article structure showing where your research appears
- `work-split.md` — Complete task breakdown showing dependencies

---

## Research Tasks

I'm conducting original research for an article titled **"How Streaming SSR Breaks Your Head Tags"** — investigating how different meta-frameworks handle HTML `<head>` tags during streaming server-side rendering.

I need deep research on the following topics. For each, provide: specific documentation links, source code references where relevant, community discussions (GitHub issues, RFCs), and any edge cases or known limitations. Be thorough — I need enough detail to build accurate test apps and write technically correct findings.

### Part 1: Framework-Specific Streaming Head Behavior

For each framework, answer:
- How does the framework handle `<head>` tags (`<title>`, `<meta>`, `<link>`, `<script>`) during streaming SSR?
- What happens when an async component (inside a Suspense boundary or equivalent) calls the framework's head management API?
- Does the framework delay sending `</head>` until async components resolve? Or does it send an incomplete `<head>` and patch later?
- If it patches later, how? (DOM manipulation script in the stream? Client-side hydration? Out-of-order streaming?)
- Are there known bugs, limitations, or open issues related to streaming + head tags?
- What does the raw HTTP response look like when streaming with async head tags? (Chunk boundaries)
- **What is the exact API I should use in my test app?** (e.g., for React 19, should I use `<title>` JSX or a Head component? For Nuxt, is it `useHead()` or `useSeoMeta()`?)

**Frameworks (G1-G8):**

#### G1: React 19
React's built-in `<title>`, `<meta>`, `<link>` component hoisting during `renderToPipeableStream`. How do these interact with Suspense boundaries? Does React delay the head or inject late tags?

#### G2: Next.js 15
App Router's `generateMetadata()`, layout-level metadata, streaming with `loading.tsx`. What happens when metadata depends on async data in a Suspense boundary? Does Next.js wait for all `generateMetadata()` calls before sending `<head>`?

#### G3: Remix / React Router 7
`meta()` function in route modules + `defer()` loaders. Since meta runs at route level (not component level), is it immune to streaming issues? What about component-level head tags?

#### G4: SvelteKit 2
`<svelte:head>` during streaming SSR. How does data loading in `+page.ts` vs `+page.server.ts` interact with head tag delivery? Does SvelteKit delay head for streamed data?

#### G5: Solid Start
`<Title>`, `<Meta>`, `<Link>` components during out-of-order streaming. Ryan Carniato has talked about this — find his posts/talks. Solid's approach is likely the most sophisticated.

#### G6: Angular SSR
Angular 17+ `Title` and `Meta` services during streaming. How does Angular's streaming SSR handle late head modifications?

#### G7: Astro
How does Astro handle `<head>` during streaming? Given its island architecture, are head tags always in the initial HTML? Does `Astro.response.headers` affect this?

#### G8: Qwik City
How does Qwik's resumability model handle head tags? Does streaming affect `useDocumentHead()`? How does `routeLoader$` interact with head?

### Part 2: Browser Behavior

#### G9: HTTP Archive Detection
What HTTP Archive BigQuery tables and fields can be used to detect streaming responses? I need:
- Table names and schemas for response headers (Transfer-Encoding)
- How to detect framework-specific streaming markers in HTML body
- Example SQL queries if you can find any
- How to join with CrUX data

#### G10: Chrome's HTML Parser and Streaming
When Chrome receives a chunked response, how does it parse `<head>`? Does it wait for `</head>` before starting to process head tags, or does it process them incrementally? How does the preload scanner interact with streaming? Reference Chromium source code if possible.

#### G14: Firefox and Safari differences
How do Firefox's and Safari's parsers handle chunked/streamed HTML responses differently from Chrome? Any known differences in head tag processing during streaming?

### Part 3: Crawler Behavior

#### G11: Googlebot and Streaming SSR
Does Googlebot support `Transfer-Encoding: chunked`? Does it wait for the full response? Does it execute JavaScript injected via streaming scripts (the `<script>` tags frameworks inject in the body to update head)? Reference Google's documentation on JavaScript rendering and any relevant blog posts.

#### G13: Social Crawlers
How do Twitter's card validator, Facebook's crawler (Open Graph scraper), and LinkedIn's crawler handle streaming responses? Do they wait for full response or read only the initial bytes?

### Part 4: Existing Research & Context

#### G12: Existing Research
Find any published research, blog posts, conference talks, or GitHub discussions about streaming SSR and head tag management. Particularly interested in:
- Performance benchmarks of streaming vs non-streaming head strategies
- SEO implications of streaming head tags
- Framework-specific discussions about this problem
- Rick Viscomi or other Chrome DevRel work on streaming + head
- Any academic papers on HTML streaming performance

#### G15: Web Almanac / HTTP Archive Stats
Find any data on streaming SSR adoption rates. The Web Almanac 2024 or 2025 Markup/Performance chapters may have relevant stats. What % of sites use streaming? Has it grown?

#### G16: Unhead Streaming Behavior
Research how Unhead (https://unhead.unjs.io) handles streaming in Nuxt. Look at:
- Source code in the `unjs/unhead` repo (branch `v3`)
- Documentation about streaming
- GitHub issues about streaming behavior
- How it decides when to flush `<head>` — does it wait for all useHead() calls?
- The Nuxt integration specifically (`@unhead/vue`, Nuxt module)

### Output Format

Write everything to a single file: `.claude/plans/streaming-research/gemini-research.md`

For each task (G1-G16), structure your response as:

```markdown
## G1: React 19 Streaming Head Behavior

### Summary
(2-3 sentences)

### Key Findings
- Finding 1
- Finding 2

### Test App Implications
(What API should Claude use in the test app? What scenarios will reveal the behavior?)

### Sources
- [Link 1](url)
- [Link 2](url)

### Edge Cases / Gotchas
(Anything surprising or undocumented)
```

Be specific. I need enough technical detail to build correct test apps and write an accurate cross-framework comparison. If you find contradictory information, note both sides. If something is undocumented, say so — that's also a finding.
