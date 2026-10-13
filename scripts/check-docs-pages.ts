// Request docs pages from the production hostname after a deploy, and fail on
// any 5xx answer.
//
// Deploys stayed green through a 26-hour docs outage (#125). The served build
// matched, but docs pages answered 500. Only a page request exercises the
// render path and its D1 content.
//
// `Cache-Control: no-cache` makes the site's response cache render the page
// fresh and skip the store, so the check never reads a stale copy and adds no
// cache entries.

import { resolve } from 'node:path'

// One page per docs section, from the sitemap.
export const DOCS_PAGES = [
  '/docs/head/guides/get-started/overview',
  '/docs/head/api/composables/use-head',
  '/docs/schema-org/guides/get-started/overview',
  '/docs/schema-org/api/schema/article',
  '/docs/vue/head/guides/get-started/installation',
  '/learn/guides/what-is-capo',
]

export type PageCheck
  = | { _tag: 'ok', path: string, status: number }
    | { _tag: 'failed', path: string, reason: string }

type Fetcher = (url: string, init: RequestInit) => Promise<Pick<Response, 'status'>>

interface CheckOptions {
  origin: string
  pages: string[]
  fetcher?: Fetcher
  attempts?: number
  delayMs?: number
}

async function requestPage(origin: string, path: string, fetcher: Fetcher): Promise<PageCheck> {
  return fetcher(new URL(path, origin).toString(), {
    headers: { 'accept': 'text/html', 'cache-control': 'no-cache' },
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
  }).then(
    response => response.status >= 500
      ? { _tag: 'failed' as const, path, reason: `answered ${response.status}` }
      : { _tag: 'ok' as const, path, status: response.status },
    (error: unknown) => ({ _tag: 'failed' as const, path, reason: error instanceof Error ? error.message : String(error) }),
  )
}

// Retry a failing page a few times: the edge can answer 5xx for a short time
// while a new deployment propagates.
export async function checkDocsPages({ origin, pages, fetcher = fetch, attempts = 6, delayMs = 10_000 }: CheckOptions): Promise<PageCheck[]> {
  return Promise.all(pages.map(async (path) => {
    let result = await requestPage(origin, path, fetcher)
    for (let attempt = 2; attempt <= attempts && result._tag === 'failed'; attempt += 1) {
      await new Promise(done => setTimeout(done, delayMs))
      result = await requestPage(origin, path, fetcher)
    }
    return result
  }))
}

async function main(): Promise<number> {
  const urlIndex = process.argv.indexOf('--url')
  const origin = urlIndex === -1 ? '' : process.argv[urlIndex + 1] ?? ''
  if (!origin) {
    console.error('[check-docs-pages] Pass the production site with --url.')
    return 1
  }
  const results = await checkDocsPages({ origin, pages: DOCS_PAGES })
  for (const result of results) {
    if (result._tag === 'failed')
      console.error(`[check-docs-pages] ${result.path} ${result.reason}`)
    else if (result.status !== 200)
      console.log(`::warning::${result.path} answered ${result.status}. If the page moved, update DOCS_PAGES in scripts/check-docs-pages.ts.`)
    else
      console.log(`[check-docs-pages] ${result.path} 200`)
  }
  return results.some(result => result._tag === 'failed') ? 1 : 0
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename)
  process.exitCode = await main()
