/**
 * Raw Node.js streaming server for controlled head tag benchmarks.
 *
 * 5 strategies × 3 head complexities × 2 async delays = 30 configurations.
 *
 * URL pattern: /:strategy/:complexity/:delay
 *   strategy: no-stream | delay-head | early-head | shell-head | out-of-order
 *   complexity: light | medium | heavy
 *   delay: fast (50ms) | slow (500ms)
 *
 * Example: http://localhost:3456/delay-head/heavy/slow
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import { createServer } from 'node:http'

const PORT = Number(process.env.PORT) || 3456

type Strategy = 'no-stream' | 'delay-head' | 'early-head' | 'shell-head' | 'out-of-order'
type Complexity = 'light' | 'medium' | 'heavy'
type Delay = 'fast' | 'slow'

const STRATEGIES: Strategy[] = ['no-stream', 'delay-head', 'early-head', 'shell-head', 'out-of-order']
const COMPLEXITIES: Complexity[] = ['light', 'medium', 'heavy']
const DELAYS: Delay[] = ['fast', 'slow']

const DELAY_MS: Record<Delay, number> = { fast: 50, slow: 500 }

// --- Head tag generators ---

interface HeadTags {
  /** Tags known immediately (always in initial head) */
  sync: string[]
  /** Tags that arrive after async resolution (the "late" tags) */
  async: string[]
}

function generateHeadTags(complexity: Complexity): HeadTags {
  const sync: string[] = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
  ]

  const async_tags: string[] = [
    '<title>Product: Widget Pro X — Streaming Test</title>',
  ]

  if (complexity === 'light') {
    sync.push('<link rel="stylesheet" href="/style.css">')
    async_tags.push('<meta name="description" content="A test page for streaming head benchmarks">')
    return { sync, async: async_tags }
  }

  // medium + heavy get preconnects, OG tags, canonical
  sync.push(
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link rel="stylesheet" href="/style.css">',
  )

  async_tags.push(
    '<meta name="description" content="Widget Pro X — the ultimate streaming benchmark test product page">',
    '<link rel="canonical" href="https://example.com/products/widget-pro-x">',
    '<meta property="og:title" content="Widget Pro X">',
    '<meta property="og:description" content="The ultimate streaming benchmark test product">',
    '<meta property="og:image" content="https://example.com/images/widget.jpg">',
    '<meta property="og:url" content="https://example.com/products/widget-pro-x">',
    '<meta property="og:type" content="product">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="Widget Pro X">',
  )

  if (complexity === 'medium') {
    sync.push(
      '<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>',
    )
    async_tags.push(
      `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"Widget Pro X","description":"Test product"}</script>`,
    )
    return { sync, async: async_tags }
  }

  // heavy: lots of resources
  sync.push(
    '<link rel="preconnect" href="https://cdn.example.com">',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap">',
    '<link rel="stylesheet" href="/critical.css">',
    '<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>',
    '<link rel="preload" href="/fonts/mono.woff2" as="font" type="font/woff2" crossorigin>',
    '<link rel="preload" href="/hero.webp" as="image">',
    '<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX"></script>',
    '<link rel="modulepreload" href="/app.js">',
  )

  async_tags.push(
    '<meta name="twitter:image" content="https://example.com/images/widget.jpg">',
    '<meta name="robots" content="index, follow">',
    '<meta name="author" content="Streaming Research Team">',
    `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Product","name":"Widget Pro X","description":"The ultimate widget","brand":{"@type":"Brand","name":"WidgetCo"},"offers":{"@type":"Offer","price":"29.99","priceCurrency":"USD"}}</script>`,
    '<link rel="alternate" hreflang="es" href="https://example.com/es/products/widget-pro-x">',
    '<link rel="alternate" hreflang="fr" href="https://example.com/fr/products/widget-pro-x">',
  )

  return { sync, async: async_tags }
}

// --- Body content (identical across all strategies) ---

function bodyContent(): string {
  return `
  <main>
    <h1>Widget Pro X</h1>
    <p>This is a controlled benchmark page. The body content is identical across all streaming strategies.</p>
    <img src="/hero.webp" alt="Widget Pro X" width="800" height="600" loading="eager">
    <section>
      <h2>Features</h2>
      <ul>
        <li>Feature one with sufficient text to simulate real content</li>
        <li>Feature two with more descriptive content for realism</li>
        <li>Feature three demonstrating product capabilities</li>
      </ul>
    </section>
    <section>
      <h2>Description</h2>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
    </section>
  </main>`
}

// --- Streaming strategies ---

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Strategy 1: No streaming — buffer everything, send at once */
async function noStream(res: ServerResponse, tags: HeadTags, delay: number) {
  await sleep(delay)
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${[...tags.sync, ...tags.async].join('\n')}
</head>
<body>
${bodyContent()}
</body>
</html>`
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end(html)
}

/** Strategy 2: Delay head — hold </head> until async tags resolve, stream body */
async function delayHead(res: ServerResponse, tags: HeadTags, delay: number) {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Transfer-Encoding': 'chunked',
  })

  // Send doctype + opening
  res.write('<!DOCTYPE html>\n<html lang="en">\n<head>\n')
  // Send sync head tags immediately
  res.write(`${tags.sync.join('\n')}\n`)

  // Wait for async data
  await sleep(delay)

  // Now send async head tags + close head
  res.write(`${tags.async.join('\n')}\n`)
  res.write('</head>\n<body>\n')

  // Stream body
  res.write(bodyContent())
  res.end('\n</body>\n</html>')
}

/** Strategy 3: Early head — send head immediately (incomplete), patch via script later */
async function earlyHead(res: ServerResponse, tags: HeadTags, delay: number) {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Transfer-Encoding': 'chunked',
  })

  // Send head immediately with only sync tags
  res.write(`<!DOCTYPE html>
<html lang="en">
<head>
${tags.sync.join('\n')}
<title>Loading...</title>
</head>
<body>
`)

  // Start streaming body
  res.write(bodyContent())

  // Async data resolves — inject script to patch head
  await sleep(delay)

  const patchScript = generatePatchScript(tags.async)
  res.write(patchScript)

  res.end('\n</body>\n</html>')
}

/** Strategy 4: Shell head — minimal head, everything patched during "hydration" */
async function shellHead(res: ServerResponse, tags: HeadTags, delay: number) {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Transfer-Encoding': 'chunked',
  })

  // Minimal shell head — only charset + viewport
  res.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Loading...</title>
</head>
<body>
`)

  res.write(bodyContent())

  // Simulate hydration — all tags applied via script
  await sleep(delay)

  const allTags = [...tags.sync.slice(2), ...tags.async] // skip charset+viewport (already sent)
  const patchScript = generatePatchScript(allTags)
  res.write(patchScript)

  res.end('\n</body>\n</html>')
}

/** Strategy 5: Out-of-order streaming — send placeholders, fill via stream scripts */
async function outOfOrder(res: ServerResponse, tags: HeadTags, delay: number) {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Transfer-Encoding': 'chunked',
  })

  // Send head with sync tags + placeholder comment for async tags
  res.write(`<!DOCTYPE html>
<html lang="en">
<head>
${tags.sync.join('\n')}
<title>Loading...</title>
<!-- __STREAMING_HEAD_PLACEHOLDER__ -->
</head>
<body>
`)

  // Stream body immediately
  res.write(bodyContent())

  // Async resolves — inject via Solid-style script
  await sleep(delay)

  // Out-of-order: individual script per tag group
  const patchScript = generateOutOfOrderScript(tags.async)
  res.write(patchScript)

  res.end('\n</body>\n</html>')
}

// --- Script generators for late head injection ---

const TitlePattern = /<\/?title>/g
const ScriptPrefixPattern = /<script type="application\/ld\+json">/
const ScriptSuffixPattern = /<\/script>$/

const MetaPattern = /^<meta/
const LinkPattern = /^<link/
const LdJsonPattern = /^<script type="application\/ld\+json">/

function generatePatchScript(tags: string[]): string {
  const operations = tags.map((tag) => {
    // Parse the tag to generate appropriate DOM operations
    if (tag.startsWith('<title>')) {
      const title = tag.replace(TitlePattern, '')
      return `document.title=${JSON.stringify(title)};`
    }
    if (MetaPattern.test(tag)) {
      return `{const m=document.createElement('meta');${parseAttributes(tag).map(([k, v]) => `m.setAttribute(${JSON.stringify(k)},${JSON.stringify(v)})`).join(';')};document.head.appendChild(m);}`
    }
    if (LinkPattern.test(tag)) {
      return `{const l=document.createElement('link');${parseAttributes(tag).map(([k, v]) => `l.setAttribute(${JSON.stringify(k)},${JSON.stringify(v)})`).join(';')};document.head.appendChild(l);}`
    }
    if (LdJsonPattern.test(tag)) {
      const json = tag.replace(ScriptPrefixPattern, '').replace(ScriptSuffixPattern, '')
      return `{const s=document.createElement('script');s.type='application/ld+json';s.textContent=${JSON.stringify(json)};document.head.appendChild(s);}`
    }
    return ''
  }).filter(Boolean)

  return `\n<script>(() => {${operations.join('\n')}})()</script>\n`
}

function generateOutOfOrderScript(tags: string[]): string {
  // Solid-style: each tag gets its own micro-script for fine-grained streaming
  return tags.map((tag, i) => {
    if (tag.startsWith('<title>')) {
      const title = tag.replace(TitlePattern, '')
      return `<script data-ssr-head="${i}">document.title=${JSON.stringify(title)}</script>`
    }
    if (MetaPattern.test(tag) || LinkPattern.test(tag)) {
      const el = MetaPattern.test(tag) ? 'meta' : 'link'
      const attrs = parseAttributes(tag)
      const attrStr = attrs.map(([k, v]) => `e.setAttribute(${JSON.stringify(k)},${JSON.stringify(v)})`).join(';')
      return `<script data-ssr-head="${i}">{const e=document.createElement('${el}');${attrStr};document.head.appendChild(e)}</script>`
    }
    if (LdJsonPattern.test(tag)) {
      const json = tag.replace(ScriptPrefixPattern, '').replace(ScriptSuffixPattern, '')
      return `<script data-ssr-head="${i}">{const s=document.createElement('script');s.type='application/ld+json';s.textContent=${JSON.stringify(json)};document.head.appendChild(s)}</script>`
    }
    return ''
  }).filter(Boolean).join('\n')
}

const AttributeRegex = /(\w[\w-]*)(?:=(?:"([^"]*)"|'([^']*)'))?/g

const TagNamePrefixPattern = /^<\w+\s*/
const TagSuffixPattern = /\/?>$/

function parseAttributes(tag: string): [string, string][] {
  const attrs: [string, string][] = []
  // Skip the tag name itself
  const tagBody = tag.replace(TagNamePrefixPattern, '').replace(TagSuffixPattern, '')

  for (const match of tagBody.matchAll(AttributeRegex)) {
    const key = match[1]
    const value = match[2] ?? match[3] ?? ''
    attrs.push([key, value])
  }
  return attrs
}

// --- Router ---

const STRATEGY_HANDLERS: Record<Strategy, (res: ServerResponse, tags: HeadTags, delay: number) => Promise<void>> = {
  'no-stream': noStream,
  'delay-head': delayHead,
  'early-head': earlyHead,
  'shell-head': shellHead,
  'out-of-order': outOfOrder,
}

function handleIndex(res: ServerResponse) {
  const links = STRATEGIES.flatMap(s =>
    COMPLEXITIES.flatMap(c =>
      DELAYS.map(d => `<li><a href="/${s}/${c}/${d}">/${s}/${c}/${d}</a></li>`),
    ),
  )
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(`<!DOCTYPE html>
<html><head><title>Streaming Head Benchmark Server</title></head>
<body>
<h1>Streaming Head Benchmark Server</h1>
<p>${STRATEGIES.length} strategies × ${COMPLEXITIES.length} complexities × ${DELAYS.length} delays = ${STRATEGIES.length * COMPLEXITIES.length * DELAYS.length} configurations</p>
<ul>${links.join('\n')}</ul>
</body></html>`)
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`)
  const parts = url.pathname.split('/').filter(Boolean)

  if (parts.length === 0) {
    handleIndex(res)
    return
  }

  if (parts.length !== 3) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('404 — Use /:strategy/:complexity/:delay')
    return
  }

  const [strategy, complexity, delay] = parts as [Strategy, Complexity, Delay]

  if (!STRATEGIES.includes(strategy) || !COMPLEXITIES.includes(complexity) || !DELAYS.includes(delay)) {
    res.writeHead(400, { 'Content-Type': 'text/plain' })
    res.end(`Invalid params. Strategies: ${STRATEGIES.join(', ')}. Complexities: ${COMPLEXITIES.join(', ')}. Delays: ${DELAYS.join(', ')}`)
    return
  }

  // Add Server-Timing header for benchmarking
  const start = performance.now()
  const tags = generateHeadTags(complexity)
  const handler = STRATEGY_HANDLERS[strategy]

  await handler(res, tags, DELAY_MS[delay])

  const elapsed = (performance.now() - start).toFixed(2)
  // Can't set headers after response started for streaming, but log it
  console.log(`${strategy}/${complexity}/${delay} — ${elapsed}ms`)
}

// --- Static file handler (for CSS/images referenced in head) ---

function serveStatic(req: IncomingMessage, res: ServerResponse): boolean {
  const url = req.url || ''
  if (url === '/style.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' })
    res.end('body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }')
    return true
  }
  if (url === '/critical.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' })
    res.end(':root { --bg: #fff; --text: #111; } body { background: var(--bg); color: var(--text); }')
    return true
  }
  if (url === '/hero.webp') {
    // 1x1 transparent webp placeholder
    res.writeHead(200, { 'Content-Type': 'image/webp' })
    res.end(Buffer.from('UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA', 'base64'))
    return true
  }
  if (url === '/app.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' })
    res.end('// app entry point')
    return true
  }
  return false
}

// --- Start ---

const server = createServer(async (req, res) => {
  if (serveStatic(req, res))
    return
  await handleRequest(req, res).catch((err) => {
    console.error(err)
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
    }
    res.end('Internal Server Error')
  })
})

server.listen(PORT, () => {
  console.log(`Streaming benchmark server running on http://localhost:${PORT}`)
  console.log(`${STRATEGIES.length * COMPLEXITIES.length * DELAYS.length} configurations available`)
})
