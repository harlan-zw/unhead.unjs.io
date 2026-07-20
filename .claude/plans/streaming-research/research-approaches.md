# Research Approaches

6 pillars of evidence. Each is independently publishable but together they tell a complete story.

---

## 1. Framework Streaming Head Audit

Systematically test how every major meta-framework handles `<head>` tags during streaming SSR.

### Frameworks to Test
- **Next.js 15** (React 19 + Suspense streaming)
- **Nuxt 4** (Vue + Unhead streaming)
- **Remix/React Router 7** (React streaming with deferred loaders)
- **SvelteKit 2** (Svelte streaming)
- **Solid Start** (Solid.js streaming — arguably the most advanced)
- **Angular SSR** (Angular Universal streaming)
- **Astro** (partial hydration, streaming support)
- **Qwik City** (resumable, unique streaming model)

### Test Scenarios per Framework
For each framework, build a minimal app with:

1. **Baseline**: Static head tags — everything known at route level
2. **Async component head**: A `<Suspense>`-wrapped component that `await`s data and calls the equivalent of `useHead({ title: 'Loaded' })` after resolution
3. **Deeply nested async head**: 3 levels deep, each adding meta tags after async resolution
4. **Competing head tags**: Parent sets `title: "Parent"`, async child sets `title: "Child"` — who wins? When?
5. **Late OG tags**: An async component adds `og:image` after the initial `<head>` has been sent to the browser

### What to Capture
- Raw HTTP response (chunk boundaries — where does `</head>` appear?)
- Browser DOM state at FCP (what's in `<head>` at first paint?)
- Final DOM state after hydration (what's the settled `<head>`?)
- Any FOUC or layout shifts during hydration
- SEO crawler behavior (does Googlebot see the final state?)
- Time from first byte to complete `<head>` in DOM

### Key Questions
- Does the framework delay `</head>` until async components resolve? (Nuxt does this)
- Does it send an incomplete `<head>` and patch later via `<script>` injected in the stream?
- Does it use out-of-order streaming to inject head tags?
- What happens to `<meta name="description">` added in a Suspense boundary — does it exist for crawlers?

---

## 2. Controlled Streaming Performance Benchmarks

Build identical pages with different streaming head strategies and measure the performance difference.

### Test Matrix

5 streaming strategies × 3 head complexity levels × 2 async delays = 30 configurations

**Strategies:**
- **No streaming** (full SSR — wait for everything, send complete response)
- **Stream with delayed head** (hold `</head>` until all async head tags resolve, stream body)
- **Stream with early head** (send `<head>` immediately, inject late tags via `<script>` in stream)
- **Stream with shell head** (send minimal head, patch everything via client hydration)
- **Out-of-order streaming** (Solid-style — send placeholders, fill in via stream scripts)

**Head complexity:**
- Light: title + charset + viewport + description (4 tags)
- Medium: + OG tags + canonical + 2 preloads + JSON-LD (12 tags)
- Heavy: + multiple stylesheets + preconnects + font preloads + analytics scripts (25+ tags)

**Async delays:**
- Fast async (50ms) — simulates cached DB query
- Slow async (500ms) — simulates external API call

### Metrics
- **FCP** — When does the user see first paint? (Early head streaming wins here)
- **LCP** — Does streaming strategy affect largest paint?
- **CLS** — Do late-injected head tags (stylesheets!) cause layout shifts?
- **TTFB** — How long does each strategy hold the response?
- **Head-complete time** — When is `<head>` fully populated in the DOM?
- **SEO-ready time** — When are all meta/OG tags present?

### Infrastructure
- All 30 configs hosted on same server (Node.js, no framework — raw streaming control)
- WebPageTest API with 30 runs per config
- Chrome trace capture via Puppeteer for detailed timing
- Test on both desktop broadband and mobile 4G profiles

### The Critical Insight We're After
**There's a fundamental tension**: streaming improves FCP (user sees content faster) but may degrade the completeness of `<head>` at first paint. If a stylesheet arrives late via streaming, you get FOUC. If OG tags arrive late, crawlers miss them. Quantifying this tradeoff is the novel contribution.

---

## 3. HTTP Archive: Streaming Adoption & Performance Correlation

### Detection Method
Streaming can be detected from HTTP Archive data via:
- `Transfer-Encoding: chunked` response header
- Response timing patterns (fast TTFB with slow total download = likely streaming)
- Framework detection (Next.js, Nuxt, Remix markers in HTML) + known framework streaming defaults
- Presence of streaming markers in HTML (e.g., `<!--$-->` for React Suspense boundaries, Solid's streaming scripts)

### Analysis Plan
1. **Adoption rates**: What % of sites use streaming SSR? Segment by framework.
2. **CWV comparison**: Streamed vs non-streamed sites — FCP, LCP, CLS, INP
3. **Head completeness**: Extract `<head>` from HTTP Archive. For streamed sites, does the initial response contain complete head tags? (HTTP Archive stores full response, but we can look for streaming markers)
4. **Framework streaming head patterns**: For each framework, what does the typical streamed `<head>` look like?

### Expected Insight
- Streaming adoption is growing but still minority
- Streamed sites likely have better FCP but possibly higher CLS (from late stylesheets)
- Framework-specific patterns reveal which streaming head strategies are most common

---

## 4. Browser Behavior Deep Dive

What does the browser actually do when head tags arrive during streaming?

### Experiments
1. **Late `<link rel="stylesheet">` via stream**: Send initial `<head>` without a stylesheet, then inject `<link>` via a `<script>` tag later in the streamed body. Does the browser:
   - Fetch the stylesheet immediately?
   - Apply it causing a repaint/reflow?
   - Show FOUC?

2. **Late `<meta charset>` via stream**: What happens if charset arrives in a later chunk? Does re-parsing occur?

3. **Late preconnect via stream**: Is a preconnect hint useful if it arrives in the body after the resources it was meant to help?

4. **`document.head.appendChild()` during streaming**: What's the browser behavior when JavaScript modifies `<head>` while the body is still streaming?

### Capture Method
- Chrome DevTools Protocol trace events
- `PerformanceObserver` for resource timing
- MutationObserver on `<head>` to track when tags appear
- Screenshot timeline to detect visual changes (FOUC)

### Cross-Browser
- Chrome, Firefox, Safari — each has different streaming parser behavior
- Safari is notably different in how it handles chunked responses

---

## 5. SEO Crawler Streaming Behavior

The elephant in the room: do search engine crawlers even support streaming?

### Tests
1. Deploy test pages with streaming SSR where critical meta tags (`<title>`, `og:image`, `description`, JSON-LD) are delivered:
   - a) In the initial `<head>` (control)
   - b) Via `<script>` injection later in the stream
   - c) Only after client-side hydration

2. Submit pages to Google Search Console, request indexing
3. Use Google's URL Inspection tool to see what Googlebot renders
4. Check `site:` operator to see what title/description Google indexes
5. Test with social platform crawlers (Twitter Card Validator, Facebook Debugger, LinkedIn Post Inspector)

### Key Finding
If crawlers don't execute streaming scripts that inject head tags, then any framework strategy that sends incomplete `<head>` has an SEO penalty. This would be a major finding.

---

## 6. The Unhead Streaming Architecture

Document and benchmark Unhead's specific approach to streaming.

### Unhead's Strategy
- Unhead delays `</head>` until all registered head sources have resolved
- During Nuxt streaming, the body streams while head waits
- This means FCP may be slightly delayed (head blocks) but head is always complete
- Alternative: Unhead could adopt an out-of-order streaming approach

### What to Test
- Measure the TTFB/FCP cost of Unhead's "wait for head" strategy vs "stream everything"
- Is the tradeoff worth it? (Complete head vs faster FCP)
- Compare with how other frameworks handle the same scenario
- Profile Unhead's head resolution time — how fast is it?

### Positioning
This section positions Unhead as having made a deliberate, data-informed architectural choice. The research in sections 1-5 provides the evidence for why Unhead's approach is correct (or reveals opportunities to improve it).
