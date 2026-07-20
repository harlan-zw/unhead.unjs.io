# Gemini Phase 2 Prompt

You previously completed research for our streaming SSR + head tags article. Your research is in `.claude/plans/streaming-research/gemini-research.md`. Claude is now building test apps and benchmark infrastructure.

While Claude builds, please work on these parallel tasks. Write ALL output to `.claude/plans/streaming-research/gemini-phase2.md`.

---

## Task A: Draft BigQuery SQL Queries

Using your G9 research on HTTP Archive tables, write production-ready BigQuery SQL for:

### A1: Streaming Detection Query
Detect which sites in HTTP Archive use streaming SSR. Combine:
- `Transfer-Encoding: chunked` from response headers (H1 only)
- Framework streaming markers in HTML: `<!--$?-->` (React Suspense), `<template id="B:">` (React flush), Nuxt markers
- TTFB vs total download time gap (large gap = likely streaming)
- Output: URL, detected_framework, is_streaming (boolean), streaming_evidence

### A2: Streaming vs Non-Streaming CWV
Join streaming detection with CrUX data to compare Core Web Vitals:
- Group by: streaming vs non-streaming, framework
- Metrics: p75 FCP, LCP, CLS, INP
- Control for: page weight (bytes), number of requests, TTFB
- Output: framework, is_streaming, sample_size, p75_fcp, p75_lcp, p75_cls, p75_inp

### A3: Head Completeness in Streamed Responses
For sites detected as streaming, analyze their `<head>` content:
- Does `<head>` contain `<title>`? `<meta name="description">`? OG tags? `<link rel="stylesheet">`?
- Compare head completeness between streaming and non-streaming sites
- What's commonly MISSING from streamed `<head>` tags?

Use the correct 2024/2025 HTTP Archive table names. Include comments explaining each part of the query.

---

## Task B: Real-World Streaming Head Breakage Examples

Find specific, documented cases of streaming SSR breaking head tags. For each, provide the URL of the issue/post, what framework, what broke, and whether it was fixed.

Look for:
- GitHub issues in Next.js, Nuxt, SvelteKit, Remix repos about streaming + meta tags / SEO / social cards
- Blog posts describing streaming SSR SEO problems
- Stack Overflow questions about missing meta tags after enabling streaming
- Twitter/X threads from developers complaining about broken social cards with streaming
- Framework migration guides that mention head tag caveats with streaming

I need at least 5-10 concrete examples. These become case studies in the article.

---

## Task C: Draft Article Sections

Write first drafts of these research-heavy sections. Use your G1-G16 findings. Write in the voice of a technical blog post — authoritative but accessible. No marketing fluff.

### C1: Section 2 — "The Streaming Head Problem" (400 words)
Explain the fundamental tension: streaming sends HTML before everything is known. Cover:
- How traditional SSR assembles a complete `<head>` before sending
- What changes with streaming — the `<head>` is sent in the first chunk
- The three strategies frameworks use (block, patch, defer)
- Why this matters for SEO, social sharing, and performance

### C2: Section 6 — "The SEO Question" (400 words)
Based on your G11 and G13 research, write about:
- Googlebot's two-wave indexing and how it interacts with streamed head tags
- The `noindex` trap (initial chunk has noindex → Googlebot stops)
- Social crawler limitations (Twitter, Facebook only read initial HTML)
- Why Next.js blocks for bots and what other frameworks should learn from this
- Practical recommendations

### C3: Section 3f — "Others" comparison notes (200 words)
Brief comparison of Astro, Qwik, Angular streaming head behavior. Pull from G6-G8.

---

## Task D: Research Unhead v3 Streaming Implementation

Your G16 research mentioned `createStreamableHead()` but was light on details. Deep-dive:
- Find the actual source code in `unjs/unhead` repo (branch `v3` or `main`)
- How does `createStreamableHead()` work internally?
- What's the priority system for critical tags?
- How does Nuxt's integration call Unhead's streaming API?
- Are there any GitHub issues or PRs discussing the streaming design decisions?
- What are the current limitations?

This is important because the article positions Unhead's approach as data-informed. We need to accurately describe it.

---

## Output Format

Write everything to: `.claude/plans/streaming-research/gemini-phase2.md`

Use clear H2 headers: `## Task A: BigQuery Queries`, `## Task B: Breakage Examples`, etc.

For SQL queries, use fenced code blocks with `sql` language tag. For article drafts, write in markdown ready to paste into the final article (with light editing).
