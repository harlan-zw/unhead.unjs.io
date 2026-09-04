import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'
import nuxtConfig from '../nuxt.config'
import { databaseNeedsCreating } from '../scripts/ensure-d1-database.mjs'

const config = nuxtConfig as unknown as {
  aiReady?: { database?: { bindingName?: string } }
  content?: { database?: { bindingName?: string } }
  nitro?: {
    cloudflare?: {
      wrangler?: { d1_databases?: { binding: string, database_name?: string }[] }
    }
  }
}

const aiReadyBinding = config.aiReady?.database?.bindingName
const contentBinding = config.content?.database?.bindingName

describe('aiReady D1 binding', () => {
  it('stops sharing the docs content database', () => {
    expect(aiReadyBinding).toBeTruthy()
    expect(aiReadyBinding).not.toBe('DB')
    expect(aiReadyBinding).not.toBe(contentBinding)
  })

  it('declares the binding for the Pages deploy', () => {
    const databases = config.nitro?.cloudflare?.wrangler?.d1_databases ?? []
    const declared = databases.find(entry => entry.binding === aiReadyBinding)
    expect(declared?.database_name).toBe('unhead-ai-ready')
  })
})

describe('ensure-d1-database', () => {
  it('creates a database the account is missing', () => {
    expect(databaseNeedsCreating([{ name: 'unhead-unjs-io' }], 'unhead-ai-ready')).toBe(true)
  })

  it('skips a database the account already has', () => {
    expect(databaseNeedsCreating([{ name: 'unhead-ai-ready' }], 'unhead-ai-ready')).toBe(false)
  })
})

describe('deploy workflow AI_READY_DB bootstrap', () => {
  it('creates the D1 database before uploading to Pages', async () => {
    const raw = await readFile(resolve(process.cwd(), '.github/workflows/deploy-cloudflare.yml'), 'utf-8')
    const workflow = parse(raw) as { jobs: { deploy: { steps: { run?: string }[] } } }
    const steps = workflow.jobs.deploy.steps
    const ensureIndex = steps.findIndex(step => step.run?.includes('ensure-d1-database.mjs'))
    const deployIndex = steps.findIndex(step => step.run?.includes('wrangler pages deploy'))
    expect(ensureIndex).toBeGreaterThan(-1)
    expect(deployIndex).toBeGreaterThan(-1)
    expect(ensureIndex).toBeLessThan(deployIndex)
  })
})
