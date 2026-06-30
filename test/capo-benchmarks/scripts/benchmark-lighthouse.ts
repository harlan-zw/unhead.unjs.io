import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'

// --- Config ---

const COMPLEXITIES = ['minimal', 'medium', 'heavy'] as const
const VARIANTS = ['optimal', 'common-bad', 'random', 'worst'] as const
const METRICS = ['lcp', 'fcp', 'ttfb', 'si', 'tbt'] as const

const THROTTLING = {
  'fast-4g': {}, // Lighthouse defaults
  'slow-3g': {
    rttMs: 400,
    throughputKbps: 400 * 1024 / 8,
    cpuSlowdownMultiplier: 4,
  },
} as const

type Speed = keyof typeof THROTTLING
interface TestConfig { complexity: string, variant: string, speed: Speed }

const WARMUP_RUNS = 3

const BASE_URL = process.argv.find((_, i, a) => a[i - 1] === '--url') ?? 'http://localhost:3000'
const RUNS = Number(process.argv.find((_, i, a) => a[i - 1] === '--runs') ?? 50)
const RESULTS_DIR = join(import.meta.dirname, '..', 'results', 'lighthouse')

// --- Helpers ---

function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function extractMetrics(result: any): Record<string, number> {
  const audits = result.lhr.audits
  return {
    lcp: audits['largest-contentful-paint']?.numericValue ?? -1,
    fcp: audits['first-contentful-paint']?.numericValue ?? -1,
    ttfb: audits['server-response-time']?.numericValue ?? -1,
    si: audits['speed-index']?.numericValue ?? -1,
    tbt: audits['total-blocking-time']?.numericValue ?? -1,
  }
}

function progress(current: number, total: number, label: string) {
  const pct = Math.round((current / total) * 100)
  const bar = '='.repeat(Math.floor(pct / 2)).padEnd(50, ' ')
  process.stdout.write(`\r[${bar}] ${pct}% (${current}/${total}) ${label}`)
}

// --- Build run queue ---

function buildRunQueue(): Array<TestConfig & { run: number }> {
  const queue: Array<TestConfig & { run: number }> = []
  for (const complexity of COMPLEXITIES) {
    for (const variant of VARIANTS) {
      for (const speed of Object.keys(THROTTLING) as Speed[]) {
        for (let run = 0; run < RUNS + WARMUP_RUNS; run++) {
          queue.push({ complexity, variant, speed, run })
        }
      }
    }
  }
  return shuffle(queue)
}

// --- Main ---

const TimestampPattern = /[:.]/g

async function run() {
  await mkdir(RESULTS_DIR, { recursive: true })

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] })
  console.log(`Chrome launched on port ${chrome.port}`)
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Runs per config: ${RUNS} (+ ${WARMUP_RUNS} warmup)`)
  console.log(`Total configs: ${COMPLEXITIES.length * VARIANTS.length * Object.keys(THROTTLING).length}`)

  const queue = buildRunQueue()
  const totalRuns = queue.length
  console.log(`Total runs (randomized): ${totalRuns}\n`)

  const rows: string[] = []
  rows.push(['page', 'variant', 'complexity', 'speed', 'run', 'warmup', ...METRICS].join(','))

  // Track per-config run counts to identify warmup runs
  const runCounts = new Map<string, number>()

  for (let i = 0; i < queue.length; i++) {
    const { complexity, variant, speed, run: _run } = queue[i]
    const url = `${BASE_URL}/${complexity}/${variant}.html`
    const configKey = `${complexity}-${variant}-${speed}`

    const configRunIndex = runCounts.get(configKey) ?? 0
    runCounts.set(configKey, configRunIndex + 1)
    const isWarmup = configRunIndex < WARMUP_RUNS

    progress(i + 1, totalRuns, `${configKey} run ${configRunIndex + 1}${isWarmup ? ' (warmup)' : ''}`)

    const throttlingOverrides = THROTTLING[speed]
    const flags: any = {
      port: chrome.port,
      output: 'json' as const,
      onlyCategories: ['performance'],
      formFactor: 'mobile' as const,
      throttlingMethod: 'simulate' as const,
      ...(Object.keys(throttlingOverrides).length > 0 ? { throttling: throttlingOverrides } : {}),
    }

    const result = await lighthouse(url, flags)
    if (!result) {
      console.warn(`\nNo result for ${url} (${speed})`)
      continue
    }

    const metrics = extractMetrics(result)
    rows.push([
      `${complexity}/${variant}`,
      variant,
      complexity,
      speed,
      String(configRunIndex),
      isWarmup ? '1' : '0',
      ...METRICS.map(m => String(metrics[m])),
    ].join(','))
  }

  await chrome.kill()

  const timestamp = new Date().toISOString().replace(TimestampPattern, '-').slice(0, 19)
  const csvPath = join(RESULTS_DIR, `benchmark-${timestamp}.csv`)
  await writeFile(csvPath, `${rows.join('\n')}\n`)

  console.log(`\n\nResults saved to ${csvPath}`)
  console.log(`Total rows: ${rows.length - 1}`)
}

run()
