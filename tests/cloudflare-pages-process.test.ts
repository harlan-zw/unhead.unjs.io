import { createConsola } from 'consola'
import { describe, expect, it } from 'vitest'
import { withProcessFallbacks } from '../server/cloudflare-pages-process'

function recordingConsole() {
  const lines = { log: [] as string[], error: [] as string[] }
  return {
    lines,
    sink: {
      log: (line: string) => lines.log.push(line),
      error: (line: string) => lines.error.push(line),
    },
  }
}

describe('withProcessFallbacks', () => {
  it('lets consola log through a process that has no stdio streams', () => {
    const { lines, sink } = recordingConsole()
    const process = withProcessFallbacks({ env: {} }, sink)
    const logger = createConsola({ stdout: process.stdout, stderr: process.stderr, level: 4, fancy: false })

    logger.debug('[sitemap-seeder] Processing 7 routes')
    logger.error('[cron] Run failed: lock unavailable')

    expect(lines.log).toEqual([expect.stringContaining('[sitemap-seeder] Processing 7 routes')])
    expect(lines.error).toEqual([expect.stringContaining('[cron] Run failed: lock unavailable')])
  })

  it('answers cwd and uptime on a process that has neither', () => {
    const process = withProcessFallbacks({ env: {} }, recordingConsole().sink)
    expect([process.cwd(), process.uptime()]).toEqual(['/', 0])
  })

  it('keeps the members a process v2 runtime already provides', () => {
    const stdout = { isTTY: false as const, write: () => true }
    const process = withProcessFallbacks({ stdout, cwd: () => '/bundle' }, recordingConsole().sink)
    expect(process.stdout).toBe(stdout)
    expect(process.cwd()).toBe('/bundle')
  })
})
