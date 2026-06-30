import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const RESULTS_DIR = join(import.meta.dirname, '..', 'results', 'traces')

const opt = JSON.parse(readFileSync(join(RESULTS_DIR, 'heavy-optimal-slow-3g.json'), 'utf-8'))
const worst = JSON.parse(readFileSync(join(RESULTS_DIR, 'heavy-worst-slow-3g.json'), 'utf-8'))

const LocalhostPattern = /http:\/\/localhost:4567/g
const ProtocolPattern = /https?:\/\//g

function getMedianTimings(result: any) {
  const map = new Map<string, { starts: number[], durations: number[], ends: number[] }>()
  for (const run of result.runs) {
    for (const r of run.resourceTimings) {
      const name = r.name.replace(LocalhostPattern, '').replace(ProtocolPattern, '')
      if (name.includes('collect'))
        continue
      const entry = map.get(name) || { starts: [], durations: [], ends: [] }
      entry.starts.push(r.startTime)
      entry.durations.push(r.duration)
      entry.ends.push(r.responseEnd)
      map.set(name, entry)
    }
  }
  const median = (arr: number[]) => {
    const s = arr.toSorted((a, b) => a - b)
    return s[Math.floor(s.length / 2)]
  }
  const out: Record<string, { start: number, end: number, duration: number }> = {}
  for (const [name, data] of map) {
    out[name] = { start: median(data.starts), end: median(data.ends), duration: median(data.durations) }
  }
  return out
}

const optR = getMedianTimings(opt)
const worstR = getMedianTimings(worst)

console.log('Resource'.padEnd(55), 'Opt end'.padEnd(10), 'Worst end'.padEnd(10), 'Delta')
console.log('-'.repeat(90))

const allKeys = [...new Set([...Object.keys(optR), ...Object.keys(worstR)])]
for (const key of allKeys) {
  if (!optR[key] || !worstR[key])
    continue
  const delta = Math.round((worstR[key].end - optR[key].end) * 10) / 10
  const shortKey = key.substring(0, 53)
  console.log(
    shortKey.padEnd(55),
    `${optR[key].end}ms`.padEnd(10),
    `${worstR[key].end}ms`.padEnd(10),
    `${delta >= 0 ? '+' : ''}${delta}ms`,
  )
}
console.log()
console.log(`FCP: optimal=${opt.summary.fcp.median}ms, worst=${worst.summary.fcp.median}ms, delta=+${worst.summary.fcp.median - opt.summary.fcp.median}ms`)

// Also show sync script timing specifically
console.log('\n=== Parser-blocking resources (sync scripts) ===')
for (const key of ['vendor.js', 'app.js'].map(k => `/assets/js/${k}`)) {
  if (!optR[key] || !worstR[key])
    continue
  console.log(`\n${key}:`)
  console.log(`  Optimal: start=${optR[key].start}ms, end=${optR[key].end}ms, dur=${optR[key].duration}ms`)
  console.log(`  Worst:   start=${worstR[key].start}ms, end=${worstR[key].end}ms, dur=${worstR[key].duration}ms`)
  console.log(`  Duration increase: +${Math.round((worstR[key].duration - optR[key].duration) * 10) / 10}ms (${Math.round((worstR[key].duration / optR[key].duration - 1) * 1000) / 10}% slower)`)
}

console.log('\n=== Render-blocking CSS ===')
for (const key of allKeys) {
  if (!key.includes('.css') && !key.includes('fonts.googleapis'))
    continue
  if (!optR[key] || !worstR[key])
    continue
  console.log(`\n${key.substring(0, 60)}:`)
  console.log(`  Optimal: start=${optR[key].start}ms, end=${optR[key].end}ms, dur=${optR[key].duration}ms`)
  console.log(`  Worst:   start=${worstR[key].start}ms, end=${worstR[key].end}ms, dur=${worstR[key].duration}ms`)
}
