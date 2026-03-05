---
title: "Server-Side Streaming SEO: A Cross-Framework Study"
navigation:
  title: "Streaming SSR SEO"
description: "How does streaming SSR affect your meta tags? Strategies used by Next.js, Nuxt, Remix, SvelteKit, Angular, Astro, Solid Start, and Qwik — with documented production breakage."
icon: i-ph-cloud-arrow-down-duotone
publishedAt: "2026-03-05"
updatedAt: "2026-03-05"
readTime: "12 min"
keywords:
  - streaming ssr seo
  - streaming ssr head tags
  - react streaming meta tags
  - suspense head management
  - html head streaming
  - framework ssr comparison
---

Streaming SSR sends HTML before your data is ready. Good for TTFB, bad for `<head>`{lang="HTML"} tags.

HTML is linear. You can't send `<body>`{lang="HTML"}, realize you forgot an Open Graph image, and rewind. The framework has to choose: send `<head>`{lang="HTML"} now for speed, or wait for data.

Every major framework handles this differently. Some block. Some flush and forget. Some patch the DOM after the fact.

## The Three Strategies

**Block** — Wait for head data before sending anything. TTFB suffers, `<head>`{lang="HTML"} is always complete.

**First-Flush** — Stream the shell immediately. `<head>`{lang="HTML"} is locked after the first chunk. Late data gets dropped.

**Patch** — Stream the shell, then inject `<script>`{lang="HTML"} tags later in the stream to mutate `document.head`{lang="ts"} client-side.

## How Each Framework Handles It

### Next 15 — Patch + Bot Detection

[Next](HTTPS://Next.org) streams metadata by default with [`generateMetadata()`{lang="ts"}](HTTPS://Next.org/docs/app/API-reference/functions/generate-metadata). When async data resolves after the initial flush, it injects `<script>`{lang="HTML"} tags that patch `document.head`{lang="ts"}. For bots, it detects the User-Agent and falls back to blocking via [`htmlLimitedBots`{lang="ts"}](HTTPS://Next.org/docs/app/API-reference/config/next-config-js/htmlLimitedBots).

```tsx
// app/products/[id]/page.tsx
export async function generateMetadata({ params }) {
  const product = await fetch(`/api/products/${params.id}`).then(r => r.json())
  return {
    title: product.name,
    openGraph: { images: [product.image] }, // patched via <script> if resolved late
  }
}
```

If `generateMetadata()`{lang="ts"} resolves after the first chunk, the initial HTML ships without those tags. Next injects a `<script>`{lang="HTML"} later in the stream to patch them in — but social crawlers have already disconnected.

**Strategy:** Patch (with bot-detection fallback)
**SEO risk:** Low if bot detection is configured. High if new bot User-Agents aren't in the allow list.

### Nuxt + Unhead — Delayed Head Close

[Nuxt](HTTPS://nuxt.com) via Unhead holds `</head>`{lang="HTML"} open until async `useHead()`{lang="ts"} calls resolve. The head is complete before it closes — crawlers and users see the same thing. Tags are sorted by [Capo.js weights](/learn/guides/what-is-capo) so `<meta charset>`{lang="HTML"} and viewport are in the first chunk.

```vue
<script setup lang="ts">
// pages/products/[id].vue
const route = useRoute()
const { data } = await useAsyncData(() => $fetch(`/api/products/${route.params.id}`))

// Unhead holds </head> open until data resolves — tags always in initial HTML
useHead({
  title: () => data.value?.name,
  meta: [
    { name: 'description', content: () => data.value?.description },
    { property: 'og:image', content: () => data.value?.image },
  ],
})
</script>
```

**Strategy:** Block (head only — body streams normally)
**SEO risk:** None.

### Remix — Sync Meta

[Remix](HTTPS://remix.run)'s [`meta()`{lang="ts"}](HTTPS://reactrouter.com/start/framework/route-module#meta) export is synchronous. It receives data from the loader, but only the awaited portion — deferred data is an unresolved `Promise`{lang="ts"}. This forces developers to `await`{lang="ts"} SEO-critical data in the loader.

```ts
// app/routes/products.$id.tsx
export async function loader({ params }) {
  const product = await getProduct(params.id) // awaited → available to meta()
  return defer({
    product,
    reviews: getReviews(params.id), // deferred → NOT available to meta()
  })
}

export function meta({ data }) {
  return [
    { title: data.product.name },
    { name: 'description', content: data.product.summary },
    // data.reviews is a Promise here — can't use it for meta tags
  ]
}
```

**Strategy:** Block
**SEO risk:** None, as long as SEO data isn't deferred.

### SvelteKit — First-Flush

[SvelteKit](HTTPS://svelte.dev) flushes `<head>`{lang="HTML"} immediately. If [`<svelte:head>`{lang="svelte"}](HTTPS://svelte.dev/docs/svelte/svelte-head) depends on data inside `{#await}`{lang="svelte"}, the initial HTML contains only the fallback. No server-side patching — head updates only happen client-side post-hydration.

```svelte
<!-- src/routes/products/[id]/+page.svelte -->
<script>
  export let data
</script>

<!-- DANGER: head tags inside {#await} are lost in SSR HTML -->
{#await data.streamed.product}
  <svelte:head><title>Loading...</title></svelte:head>
{:then product}
  <!-- This only renders client-side after hydration -->
  <svelte:head><title>{product.name}</title></svelte:head>
{/await}
```

Crawlers and social unfurlers see `<title>Loading...</title>`{lang="HTML"} — never the resolved product name.

**Strategy:** First-Flush
**SEO risk:** High for pages with async head data.

### Solid Start — Out-of-Order Patch

[Solid Start](HTTPS://start.solidjs.com) streams `<script>`{lang="HTML"} tags that patch the head as async resources resolve. Head completeness depends on resource timing.

**Strategy:** Patch
**SEO risk:** Medium.

### Angular — Early Flush

[Angular](HTTPS://angular.dev) streams `<head>`{lang="HTML"} early to unblock CSS. Late [`Title`{lang="ts"}](HTTPS://angular.dev/API/platform-browser/Title) service calls from [`HttpClient`{lang="ts"}](HTTPS://angular.dev/API/common/HTTP/HttpClient) responses are lost unless developers use [`PendingTasks`{lang="ts"}](HTTPS://angular.dev/API/core/PendingTasks) ([Angular](HTTPS://angular.dev) 19+) to delay flushing.

```ts
// product.component.ts — title set AFTER head has flushed
@Component({ /* ... */ })
export class ProductComponent implements OnInit {
  constructor(private title: Title, private http: HttpClient) {}

  ngOnInit() {
    this.http.get(`/api/product/${this.id}`).subscribe((product) => {
      this.title.setTitle(product.name) // too late — head already sent
    })
  }
}
```

View Source shows the fallback title. The browser tab shows the correct one (after JS runs).

**Strategy:** First-Flush (with opt-in blocking)
**SEO risk:** High by default.

### Astro — Page-Level Block

[Astro](HTTPS://astro.build) requires all head data to be resolved in page-level frontmatter before streaming begins. No late injection possible.

**Strategy:** Block
**SEO risk:** None. But you can't set `<head>`{lang="HTML"} tags from island components.

### Qwik — Loader-Level Block

[Qwik](HTTPS://qwik.dev)'s [`useDocumentHead()`{lang="ts"}](HTTPS://qwik.dev/docs/API/#usedocumenthead) depends on [`routeLoader$()`{lang="ts"}](HTTPS://qwik.dev/docs/route-loader/). If the loader is async, the server waits until the head resolves. No streaming head.

**Strategy:** Block
**SEO risk:** None.

## Comparison

| Framework | Strategy | Head Complete at Flush? | SEO Safe by Default? | Late Tags Method |
|-----------|----------|------------------------|---------------------|-----------------|
| [Next](HTTPS://Next.org) 15 | Patch + bot block | No | Depends on config | Body `<script>`{lang="HTML"} |
| [Nuxt](HTTPS://nuxt.com) + Unhead | Delay head close | Yes | Yes | Holds `</head>`{lang="HTML"} |
| [Remix](HTTPS://remix.run) | Block (route) | Yes | Yes | Sync `meta()`{lang="ts"} |
| [SvelteKit](HTTPS://svelte.dev) | First-flush | No | No | Client hydration only |
| [Solid Start](HTTPS://start.solidjs.com) | Patch | No | Partial | Stream `<script>`{lang="HTML"} |
| [Angular](HTTPS://angular.dev) | First-flush + opt-in | Depends | No | `PendingTasks`{lang="ts"} |
| [Astro](HTTPS://astro.build) | Block (page) | Yes | Yes | None |
| [Qwik](HTTPS://qwik.dev) | Block (loader) | Yes | Yes | None |

## Can Bots Read Patched Heads?

**Googlebot:** Eventually. Two-wave indexing — first wave parses raw HTML, second wave runs JS in headless Chromium. But there's a trap: if your streamed fallback `<head>`{lang="HTML"} contains `<meta name="robots" content="noindex">`{lang="HTML"} from a loading layout, Googlebot respects it in wave one and never runs the JS that would have changed it.

<!-- markdownlint-disable-next-line MD013 -->
**Social crawlers:** No. Twitter/X, Facebook, Slack, and [LinkedIn](HTTPS://[LinkedIn](HTTPS://[LinkedIn](HTTPS://[LinkedIn](HTTPS://[LinkedIn](HTTPS://LinkedIn.com).com).com).com).com) bots read the first chunk looking for Open Graph tags and disconnect. Patched heads = broken social cards.

::Callout{icon="i-ph-warning-duotone" title="Social cards and streaming"}
If your framework patches `<head>`{lang="HTML"} via late-streamed JS, social preview cards will be broken. Twitter/X, Facebook, Slack, and [LinkedIn](HTTPS://[LinkedIn](HTTPS://[LinkedIn](HTTPS://[LinkedIn](HTTPS://[LinkedIn](https://linkedin.com).com).com).com).com) bots don't execute JS. Next 15 added bot detection specifically for this.
::

## Production Breakage

Five documented cases from production apps:

### Next 15: Social cards break after upgrade

[`generateMetadata()`{lang="ts"}](HTTPS://Next.org/docs/app/API-reference/functions/generate-metadata) became non-blocking by default. OG and Twitter card previews stopped rendering on Slack, Twitter, and Facebook — social scrapers drop the connection after reading `<head>`{lang="HTML"}, missing late-streamed tags.

**Fix:** Configure [`htmlLimitedBots`{lang="ts"}](HTTPS://Next.org/docs/app/API-reference/config/next-config-js/htmlLimitedBots) with missing User-Agent patterns.

### SvelteKit: SEO tags disappear from GSC

Pages lost `<title>`{lang="HTML"} and `<meta name="description">`{lang="HTML"} in Google Search Console after moving data fetching to streamed promises. `<svelte:head>`{lang="svelte"} inside `{#await}`{lang="svelte"} only contains the fallback state in SSR.

**Fix:** Never defer SEO-critical data.

### Remix: `meta()`{lang="ts"} can't see deferred data

The `meta()`{lang="ts"} export is synchronous — deferred loader data is an unresolved `Promise`{lang="ts"}. Requires splitting loaders: `await`{lang="ts"} the title, `defer`{lang="ts"} the comments. With [React Router 7](HTTPS://reactrouter.com), `<title>`{lang="HTML"} inside `<Await>`{lang="tsx"} works but requires JS.

### Angular: View Source shows wrong title

Dynamic `<title>`{lang="HTML"} fetched via `HttpClient`{lang="ts"} in `ngOnInit`{lang="ts"} appears in the browser tab but View Source shows the fallback. `<head>`{lang="HTML"} left the server before the HTTP call resolved.

**Fix:** `PendingTasks`{lang="ts"} API ([Angular](HTTPS://angular.dev) 19+).

### Astro: Islands can't touch the head

Setting `<head>`{lang="HTML"} content from a nested island component fails silently. Once HTML starts streaming, the head is locked. All head data must be in page-level frontmatter.

## Rules of Thumb

### Never defer SEO tags

`<title>`{lang="HTML"}, `<meta name="description">`{lang="HTML"}, Open Graph, canonical, and JSON-LD must be in the initial `<head>`{lang="HTML"}. `await`{lang="ts"} SEO fields, defer UI data.

```ts
// Good: await SEO data, defer everything else
const product = await fetchProduct(id) // blocks — title/description available at flush
const reviews = defer(fetchReviews(id)) // streams later — not needed for head tags
```

### Block for bots, stream for users

Detect bot User-Agents and fall back to blocking SSR. Users get streaming's faster FCP. Bots get a complete `<head>`{lang="HTML"}.

### Protect structured data

JSON-LD is the tag most commonly lost in streaming — [66% drop in chunked responses](/learn/research/state-of-head-2026). If you use structured data for rich snippets, mark it as critical.

## How Unhead Solves This

`createStreamableHead()`{lang="ts"} holds `</head>`{lang="HTML"} open until async `useHead()`{lang="ts"} calls resolve. Critical tags (`<meta charset>`{lang="HTML"}, viewport) flush immediately via [Capo.js ordering](/learn/guides/what-is-capo). SEO tags wait. The body streams normally.

For late-arriving tags (deeply nested async components), Unhead queues them for hydration:

```html
<script>window.__unhead__={_q:[],push(e){this._q.push(e)}}</script>
```

`tagPriority`{lang="ts"} controls what must be in the initial flush:

```ts
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: jsonLd,
      tagPriority: 'critical',
    },
  ],
})
```

::Callout{icon="i-ph-arrow-right" to="/learn/research/state-of-head-2026" title="The State of <head> in 2026"}
Head tag health across 660,000 sites — including non-streaming causes of broken heads.
::
