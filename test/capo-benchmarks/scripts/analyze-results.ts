import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

// --- Config ---

const METRICS = ['lcp', 'fcp', 'ttfb', 'si', 'tbt'] as const

const RESULTS_DIR = join(import.meta.dirname, '..', 'results', 'lighthouse')
const SUMMARY_PATH = join(import.meta.dirname, '..', 'results', 'summary.json')

// --- Stats helpers ---

const sort = (arr: number[]) => arr.toSorted((a, b) => a - b)

function median(arr: number[]): number {
  const s = sort(arr)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

function mean(arr: number[]): number {
  return arr.reduce((sum, v) => sum + v, 0) / arr.length
}

function percentile(arr: number[], p: number): number {
  const s = sort(arr)
  const idx = (p / 100) * (s.length - 1)
  const lower = Math.floor(idx)
  const upper = Math.ceil(idx)
  if (lower === upper)
    return s[lower]
  return s[lower] + (s[upper] - s[lower]) * (idx - lower)
}

function stddev(arr: number[]): number {
  const m = mean(arr)
  return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / (arr.length - 1))
}

function round(n: number, decimals = 2): number {
  return Math.round(n * 10 ** decimals) / 10 ** decimals
}

// --- Mann-Whitney U test ---
// Two-tailed test, returns { U, z, p, significant }

function mannWhitneyU(a: number[], b: number[]): { U: number, z: number, p: number, significant: boolean } {
  const n1 = a.length
  const n2 = b.length

  // Combine and rank
  const combined = [
    ...a.map(v => ({ v, group: 0 as const })),
    ...b.map(v => ({ v, group: 1 as const })),
  ].sort((x, y) => x.v - y.v)

  // Assign ranks with tie handling
  const ranks = Array.from({ length: combined.length })
  let i = 0
  while (i < combined.length) {
    let j = i
    while (j < combined.length && combined[j].v === combined[i].v) j++
    const avgRank = (i + j + 1) / 2 // 1-indexed average
    for (let k = i; k < j; k++) ranks[k] = avgRank
    i = j
  }

  // Sum ranks for group A
  let r1 = 0
  for (let k = 0; k < combined.length; k++) {
    if (combined[k].group === 0)
      r1 += ranks[k]
  }

  const U1 = r1 - (n1 * (n1 + 1)) / 2
  const U2 = n1 * n2 - U1
  const U = Math.min(U1, U2)

  // Normal approximation for large samples
  const mU = (n1 * n2) / 2
  const sigmaU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12)
  const z = sigmaU === 0 ? 0 : (U - mU) / sigmaU

  // Two-tailed p-value approximation using error function
  const p = 2 * (1 - normalCDF(Math.abs(z)))

  return { U, z, p, significant: p < 0.05 }
}

// Standard normal CDF approximation (Abramowitz and Stegun)
function normalCDF(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.SQRT2

  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return 0.5 * (1.0 + sign * y)
}

// --- CSV parsing ---

interface Row {
  page: string
  variant: string
  complexity: string
  speed: string
  run: number
  warmup: boolean
  lcp: number
  fcp: number
  ttfb: number
  si: number
  tbt: number
}

function parseCSV(content: string): Row[] {
  const lines = content.trim().split('\n')
  const header = lines[0].split(',')
  return lines.slice(1).map((line) => {
    const values = line.split(',')
    const obj: Record<string, string> = {}
    header.forEach((key, i) => obj[key] = values[i])
    return {
      page: obj.page,
      variant: obj.variant,
      complexity: obj.complexity,
      speed: obj.speed,
      run: Number(obj.run),
      warmup: obj.warmup === '1',
      lcp: Number(obj.lcp),
      fcp: Number(obj.fcp),
      ttfb: Number(obj.ttfb),
      si: Number(obj.si),
      tbt: Number(obj.tbt),
    }
  })
}

// --- Grouping ---

interface GroupStats {
  count: number
  median: number
  mean: number
  p5: number
  p25: number
  p75: number
  p95: number
  stddev: number
}

function computeStats(values: number[]): GroupStats {
  return {
    count: values.length,
    median: round(median(values)),
    mean: round(mean(values)),
    p5: round(percentile(values, 5)),
    p25: round(percentile(values, 25)),
    p75: round(percentile(values, 75)),
    p95: round(percentile(values, 95)),
    stddev: round(stddev(values)),
  }
}

// --- Main ---

async function run() {
  const files = await readdir(RESULTS_DIR)
  const csvFiles = files.filter(f => f.endsWith('.csv'))

  if (csvFiles.length === 0) {
    console.error('No CSV files found in', RESULTS_DIR)
    process.exit(1)
  }

  // Read and merge all CSVs
  let allRows: Row[] = []
  for (const file of csvFiles) {
    const content = await readFile(join(RESULTS_DIR, file), 'utf-8')
    allRows = [...allRows, ...parseCSV(content)]
  }

  // Exclude warmup runs
  const rows = allRows.filter(r => !r.warmup)
  console.log(`Loaded ${allRows.length} total rows, ${rows.length} after excluding warmup\n`)

  // Group by (complexity, speed, variant)
  const groups = new Map<string, Map<string, Row[]>>()
  for (const row of rows) {
    const groupKey = `${row.complexity}-${row.speed}`
    if (!groups.has(groupKey))
      groups.set(groupKey, new Map())
    const variantMap = groups.get(groupKey)!
    if (!variantMap.has(row.variant))
      variantMap.set(row.variant, [])
    variantMap.get(row.variant)!.push(row)
  }

  // Compute stats and deltas
  const summary: Record<string, Record<string, Record<string, any>>> = {}

  for (const [groupKey, variantMap] of groups) {
    summary[groupKey] = {}

    for (const [variant, variantRows] of variantMap) {
      summary[groupKey][variant] = {}
      for (const metric of METRICS) {
        const values = variantRows.map(r => r[metric]).filter(v => v >= 0)
        if (values.length === 0)
          continue
        summary[groupKey][variant][metric] = computeStats(values)
      }
    }

    // Compute deltas vs optimal
    const optimalRows = variantMap.get('optimal')
    if (!optimalRows)
      continue

    for (const [variant, variantRows] of variantMap) {
      if (variant === 'optimal')
        continue

      summary[groupKey][variant]._deltas = {}
      for (const metric of METRICS) {
        const optValues = optimalRows.map(r => r[metric]).filter(v => v >= 0)
        const varValues = variantRows.map(r => r[metric]).filter(v => v >= 0)
        if (optValues.length === 0 || varValues.length === 0)
          continue

        const delta = round(median(varValues) - median(optValues))
        const deltaPct = round((delta / median(optValues)) * 100, 1)
        const mwu = mannWhitneyU(optValues, varValues)

        summary[groupKey][variant]._deltas[metric] = {
          delta,
          deltaPct,
          mannWhitneyU: round(mwu.U),
          z: round(mwu.z, 3),
          p: round(mwu.p, 4),
          significant: mwu.significant,
        }
      }
    }
  }

  // Print summary table
  console.log('='.repeat(120))
  console.log('BENCHMARK SUMMARY')
  console.log('='.repeat(120))

  for (const [groupKey, variantData] of Object.entries(summary)) {
    console.log(`\n--- ${groupKey} ---\n`)

    const header = ['variant', ...METRICS.flatMap(m => [`${m}_med`, `${m}_std`])]
    console.log(header.map(h => h.padStart(10)).join(''))

    for (const [variant, metricData] of Object.entries(variantData)) {
      const cols = [variant.padStart(10)]
      for (const metric of METRICS) {
        const stats = (metricData as any)[metric] as GroupStats | undefined
        cols.push(stats ? String(stats.median).padStart(10) : '       N/A')
        cols.push(stats ? String(stats.stddev).padStart(10) : '       N/A')
      }
      console.log(cols.join(''))
    }

    // Print deltas
    console.log()
    console.log('  Deltas vs optimal:')
    for (const [variant, metricData] of Object.entries(variantData)) {
      const deltas = (metricData as any)._deltas
      if (!deltas)
        continue
      for (const metric of METRICS) {
        const d = deltas[metric]
        if (!d)
          continue
        const sig = d.significant ? '*' : ' '
        console.log(`    ${variant.padEnd(12)} ${metric.padEnd(5)} delta=${String(d.delta).padStart(8)}ms (${String(d.deltaPct).padStart(6)}%) p=${String(d.p).padStart(6)} ${sig}`)
      }
    }
  }

  // Save summary
  await writeFile(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`)
  console.log(`\n\nFull summary saved to ${SUMMARY_PATH}`)
}

run()
