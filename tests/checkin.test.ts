import { runChecks } from '@harlan-zw/nuxt-checkin/server'
import { expect, it } from 'vitest'
import aiReady from '../server/checks/ai-ready'
import docsV2 from '../server/checks/docs-v2'
import docsV3 from '../server/checks/docs-v3'

it('reports an empty documentation collection as a failure', async () => {
  const report = await runChecks([docsV3], { event: { readContent: async () => null } })
  expect(report.severity).toBe('fail')
  expect(report.coverage).toBe('complete')
})

it('retains documentation failure alongside unavailable database evidence', async () => {
  const report = await runChecks([docsV3, aiReady], { event: { readContent: async () => null } })
  expect(report.severity).toBe('fail')
  expect(report.coverage).toBe('incomplete')
})

it('reads both supported documentation versions', async () => {
  const reads: string[] = []
  const report = await runChecks([docsV3, docsV2], { event: { readContent: async (collection) => {
    reads.push(collection)
    return { path: '/docs/example' }
  } } })
  expect(report.severity).toBe('pass')
  expect(reads).toEqual(['docsUnhead', 'docsUnheadV2'])
})
