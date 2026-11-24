import type { Unstable_DevWorker } from 'wrangler'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { unstable_dev } from 'wrangler'

// Runs the built Worker from `pnpm build`. Set PAGES_DIST to test another build output.
const dist = resolve(process.env.PAGES_DIST || 'dist')
// Any date before 2025-09-15 runs workerd's process v1, which has no stdio or cwd.
const PRE_PROCESS_V2_DATE = '2025-03-01'
const CRON_TOKEN = 'pages-runtime-e2e-token'

let worker: Unstable_DevWorker

beforeAll(async () => {
  const config = join(await mkdtemp(join(tmpdir(), 'unhead-pages-runtime-')), 'wrangler.json')
  const main = join(dist, '_worker.js/index.js')
  await writeFile(config, JSON.stringify({
    name: 'unhead-pages-runtime-e2e',
    main,
    no_bundle: true,
    find_additional_modules: true,
    base_dir: join(dist, '_worker.js'),
    rules: [{ type: 'ESModule', globs: ['**/*.mjs', '**/*.js'] }],
    compatibility_date: PRE_PROCESS_V2_DATE,
    compatibility_flags: ['nodejs_compat', 'nodejs_compat_populate_process_env'],
    assets: { directory: dist, binding: 'ASSETS' },
    d1_databases: [
      { binding: 'DB', database_name: 'e2e-content', database_id: '00000000-0000-4000-8000-000000000001' },
      { binding: 'AI_READY_DB', database_name: 'e2e-ai-ready', database_id: '00000000-0000-4000-8000-000000000002' },
    ],
    vars: { NUXT_AI_READY_RUNTIME_SYNC_SECRET: CRON_TOKEN },
  }))
  worker = await unstable_dev(main, { config, experimental: { disableExperimentalWarning: true } })
}, 120_000)

afterAll(async () => {
  await worker?.stop()
})

describe('pages Worker on a runtime without process v2', () => {
  it('serves the sitemap while the AI-ready sitemap seeder logs', async () => {
    const response = await worker.fetch('/sitemap.xml')
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('<urlset')
  })

  it('reports the cron outcome after logging its deprecated secret warning', async () => {
    const response = await worker.fetch('/__ai-ready/cron', { headers: { authorization: `Bearer ${CRON_TOKEN}` } })
    expect(response.status).toBe(200)
  })
})
