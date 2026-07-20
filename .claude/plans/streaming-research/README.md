# Streaming & Head Tags Research Plan

Original research article: **"How Streaming SSR Breaks Your Head Tags — And What Frameworks Do About It"**

The streaming SSR problem: when you stream HTML to the browser, the `<head>` is sent before the full component tree resolves. Late-arriving `useHead()` calls from async components miss the initial `<head>` entirely. Every framework handles this differently — and nobody has systematically documented the tradeoffs, performance implications, or real-world impact.

This is novel because:
- No published research comparing streaming head strategies across frameworks
- No CrUX/HTTP Archive analysis of streaming adoption vs performance
- No controlled benchmarks measuring FCP/LCP impact of streaming head strategies
- Unhead has a unique approach worth highlighting

## Files

- `research-approaches.md` — 6 research pillars with methodology
- `work-split.md` — Claude vs Gemini task assignment
- `article-outline.md` — Full article structure
- `gemini-prompt.md` — Ready-to-paste prompt for Gemini research tasks
