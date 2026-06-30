import { execSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import puppeteer from 'puppeteer'

// --- Config ---

const COMPLEXITIES = ['minimal', 'medium', 'heavy'] as const
const VARIANTS = ['optimal', 'common-bad', 'random', 'worst'] as const

const THROTTLE_PROFILES = {
  'fast-4g': {
    offline: false,
    downloadThroughput: (1.44 * 1024 * 1024) / 8, // 1.44 Mbps
    uploadThroughput: (0.675 * 1024 * 1024) / 8, // 675 Kbps
    latency: 150, // 150ms RTT
  },
  'slow-3g': {
    offline: false,
    downloadThroughput: (0.4 * 1024 * 1024) / 8, // 400 Kbps
    uploadThroughput: (0.4 * 1024 * 1024) / 8, // 400 Kbps
    latency: 400, // 400ms RTT
  },
} as const

const RUNS = Number(process.argv.find((_, i, a) => a[i - 1] === '--runs') ?? 5)
const BASE_URL = process.argv.find((_, i, a) => a[i - 1] === '--url') ?? 'http://localhost:4567'
const RESULTS_DIR = join(import.meta.dirname, '..', 'results', 'traces')

// --- Types ---

interface ResourceTiming {
  name: string
  startTime: number
  responseEnd: number
  duration: number
  initiatorType: string
}

interface RunMetrics {
  fcp: number
  lcp: number
  domContentLoaded: number
  domInteractive: number
  resourceTimings: ResourceTiming[]
}

interface AggregatedResult {
  complexity: string
  variant: string
  throttle: string
  runs: RunMetrics[]
  summary: {
    fcp: Stats
    lcp: Stats
    domContentLoaded: Stats
    domInteractive: Stats
  }
}

interface Stats {
  median: number
  mean: number
  min: number
  max: number
  stddev: number
  values: number[]
}

// --- Stats helpers ---

function computeStats(values: number[]): Stats {
  const sorted = values.toSorted((a, b) => a - b)
  const n = sorted.length
  const mean = sorted.reduce((s, v) => s + v, 0) / n
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)]
  const variance = sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / n
  const stddev = Math.sqrt(variance)

  return {
    median: round(median),
    mean: round(mean),
    min: round(sorted[0]),
    max: round(sorted[n - 1]),
    stddev: round(stddev),
    values: sorted.map(round),
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}

// --- Metrics collection ---

async function collectMetrics(page: puppeteer.Page): Promise<RunMetrics> {
  // Give LCP time to finalize (user interaction or 2.5s after load)
  await new Promise(r => setTimeout(r, 3000))

  return page.evaluate(() => {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    // FCP from paint timing
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint')

    // LCP from injected observer (see evaluateOnNewDocument)
    const lcp = (window as any).__lcpValue ?? 0

    // Resource timings
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

    return {
      fcp: fcpEntry?.startTime ?? 0,
      lcp,
      domContentLoaded: navEntry?.domContentLoadedEventEnd ?? 0,
      domInteractive: navEntry?.domInteractive ?? 0,
      resourceTimings: resources.map(r => ({
        name: r.name,
        startTime: Math.round(r.startTime * 100) / 100,
        responseEnd: Math.round(r.responseEnd * 100) / 100,
        duration: Math.round(r.duration * 100) / 100,
        initiatorType: r.initiatorType,
      })),
    }
  })
}

// --- Main ---

async function run() {
  await mkdir(RESULTS_DIR, { recursive: true })

  // Use system Chrome if puppeteer's bundled Chrome isn't available
  const executablePath = process.env.CHROME_PATH ?? (() => {
    for (const cmd of ['google-chrome-stable', 'google-chrome', 'chromium']) {
      const path = execSync(`which ${cmd} 2>/dev/null`, { encoding: 'utf-8' }).trim()
      if (path)
        return path
    }
    return undefined
  })()

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const profiles = Object.entries(THROTTLE_PROFILES) as [keyof typeof THROTTLE_PROFILES, typeof THROTTLE_PROFILES[keyof typeof THROTTLE_PROFILES]][]
  const allResults: AggregatedResult[] = []

  const totalConfigs = COMPLEXITIES.length * VARIANTS.length * profiles.length
  let configNum = 0

  for (const [profileName, profileConfig] of profiles) {
    console.log(`\n=== Throttle profile: ${profileName} ===\n`)

    for (const complexity of COMPLEXITIES) {
      for (const variant of VARIANTS) {
        configNum++
        const label = `${complexity}-${variant}-${profileName}`
        console.log(`[${configNum}/${totalConfigs}] ${label} (${RUNS} runs)`)

        const url = `${BASE_URL}/${complexity}/${variant}.html`
        const runResults: RunMetrics[] = []

        for (let i = 0; i < RUNS; i++) {
          // Use isolated browser context per run for cold connections
          // This prevents TCP connection reuse between tests
          const context = await browser.createBrowserContext()
          const page = await context.newPage()

          // Set up CDP session for network throttling
          const cdp = await page.createCDPSession()
          await cdp.send('Network.enable')
          await cdp.send('Network.emulateNetworkConditions', profileConfig)

          // Inject LCP observer before navigation
          await page.evaluateOnNewDocument(() => {
            (window as any).__lcpValue = 0
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries()
              const last = entries.at(-1) as any
              if (last)
                (window as any).__lcpValue = last.startTime
            })
            observer.observe({ type: 'largest-contentful-paint', buffered: true })
          })

          await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
          const metrics = await collectMetrics(page)
          runResults.push(metrics)

          await cdp.detach()
          await page.close()
          await context.close()

          process.stdout.write(`  run ${i + 1}/${RUNS}: FCP=${round(metrics.fcp)}ms LCP=${round(metrics.lcp)}ms DCL=${round(metrics.domContentLoaded)}ms\n`)
        }

        const result: AggregatedResult = {
          complexity,
          variant,
          throttle: profileName,
          runs: runResults,
          summary: {
            fcp: computeStats(runResults.map(r => r.fcp)),
            lcp: computeStats(runResults.map(r => r.lcp)),
            domContentLoaded: computeStats(runResults.map(r => r.domContentLoaded)),
            domInteractive: computeStats(runResults.map(r => r.domInteractive)),
          },
        }

        allResults.push(result)

        // Save individual result
        const resultPath = join(RESULTS_DIR, `${label}.json`)
        await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`)

        console.log(`  => FCP median: ${result.summary.fcp.median}ms | LCP median: ${result.summary.lcp.median}ms | DCL median: ${result.summary.domContentLoaded.median}ms`)
      }
    }
  }

  await browser.close()

  // Write combined summary
  const summaryPath = join(RESULTS_DIR, 'summary.json')
  const summary = allResults.map(r => ({
    config: `${r.complexity}-${r.variant}-${r.throttle}`,
    fcp: r.summary.fcp,
    lcp: r.summary.lcp,
    domContentLoaded: r.summary.domContentLoaded,
    domInteractive: r.summary.domInteractive,
  }))
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`)

  // Print comparison table
  console.log('\n\n=== COMPARISON TABLE ===\n')
  console.log('Config'.padEnd(35), 'FCP (med)'.padEnd(12), 'LCP (med)'.padEnd(12), 'DCL (med)'.padEnd(12))
  console.log('-'.repeat(71))

  for (const r of allResults) {
    const config = `${r.complexity}-${r.variant}-${r.throttle}`
    console.log(
      config.padEnd(35),
      `${r.summary.fcp.median}ms`.padEnd(12),
      `${r.summary.lcp.median}ms`.padEnd(12),
      `${r.summary.domContentLoaded.median}ms`.padEnd(12),
    )
  }

  // Print delta analysis (optimal vs others per complexity+throttle)
  console.log('\n\n=== DELTA ANALYSIS (vs optimal) ===\n')
  for (const [profileName] of profiles) {
    for (const complexity of COMPLEXITIES) {
      const optimal = allResults.find(r => r.complexity === complexity && r.variant === 'optimal' && r.throttle === profileName)
      if (!optimal)
        continue

      console.log(`\n${complexity} @ ${profileName}:`)
      for (const variant of VARIANTS) {
        if (variant === 'optimal')
          continue
        const other = allResults.find(r => r.complexity === complexity && r.variant === variant && r.throttle === profileName)
        if (!other)
          continue

        const fcpDelta = round(other.summary.fcp.median - optimal.summary.fcp.median)
        const lcpDelta = round(other.summary.lcp.median - optimal.summary.lcp.median)
        const dclDelta = round(other.summary.domContentLoaded.median - optimal.summary.domContentLoaded.median)

        console.log(`  ${variant.padEnd(12)} FCP: ${fcpDelta >= 0 ? '+' : ''}${fcpDelta}ms | LCP: ${lcpDelta >= 0 ? '+' : ''}${lcpDelta}ms | DCL: ${dclDelta >= 0 ? '+' : ''}${dclDelta}ms`)
      }
    }
  }

  console.log(`\nAll results saved to ${RESULTS_DIR}`)
}

run()
