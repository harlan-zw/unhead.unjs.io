import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createServer } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { attachPagesD1Binding, main, parseArgs } from '../scripts/attach-pages-d1-binding.mjs'

interface D1Database {
  uuid: string
  name: string
}

interface DeploymentConfigs {
  production: {
    d1_databases?: Record<string, { id: string }>
    analytics_engine_datasets?: Record<string, { dataset: string }>
    env_vars?: Record<string, { type: string, value?: string }>
  }
  preview?: {
    d1_databases?: Record<string, { id: string }>
    env_vars?: Record<string, { type: string, value?: string }>
  }
}

interface PatchBody {
  deployment_configs?: DeploymentConfigs
}

interface CapturedRequest {
  method: string
  pathname: string
  body?: PatchBody
}

interface FixtureState {
  databasePages: D1Database[][]
  project: { deployment_configs: DeploymentConfigs }
  patchApplies: boolean
  responseOverride?: { pathname: string, status: number, body: unknown }
}

interface Fixture {
  requests: CapturedRequest[]
  baseUrl: string
}

const servers: Server[] = []

afterEach(async () => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  await Promise.all(servers.splice(0).map(server =>
    new Promise<void>((resolve) => {
      server.close(() => resolve())
    }),
  ))
})

function startFixture(state: FixtureState): Promise<Fixture> {
  const requests: CapturedRequest[] = []
  const server = createServer((request: IncomingMessage, response: ServerResponse) => {
    const chunks: Buffer[] = []
    request.on('data', chunk => chunks.push(chunk as Buffer))
    request.on('end', () => {
      const url = new URL(request.url ?? '/', 'http://localhost')
      const raw = Buffer.concat(chunks).toString('utf-8')
      requests.push({
        method: request.method ?? '',
        pathname: `${url.pathname}${url.search}`,
        body: raw ? JSON.parse(raw) as PatchBody : undefined,
      })

      if (state.responseOverride?.pathname === url.pathname) {
        response.statusCode = state.responseOverride.status
        response.setHeader('content-type', 'application/json')
        response.end(JSON.stringify(state.responseOverride.body))
        return
      }

      const respond = (result: unknown, totalPages = 1) => {
        response.statusCode = 200
        response.setHeader('content-type', 'application/json')
        response.end(JSON.stringify({ success: true, result, result_info: { page: 1, per_page: 100, total_pages: totalPages } }))
      }

      if (request.method === 'GET' && url.pathname === '/accounts/acc-1/d1/database') {
        const page = Number(url.searchParams.get('page') ?? '1')
        respond(state.databasePages[page - 1] ?? [], state.databasePages.length)
        return
      }

      if (url.pathname === '/accounts/acc-1/pages/projects/unhead-unjs-io') {
        if (request.method === 'GET') {
          respond(state.project)
          return
        }
        if (request.method === 'PATCH') {
          const body = requests[requests.length - 1]?.body
          if (body?.deployment_configs && state.patchApplies) {
            state.project.deployment_configs = {
              ...state.project.deployment_configs,
              ...body.deployment_configs,
              production: {
                ...state.project.deployment_configs.production,
                ...body.deployment_configs.production,
              },
            }
          }
          respond(state.project)
          return
        }
      }

      response.statusCode = 404
      response.end(JSON.stringify({ success: false, errors: [] }))
    })
  })

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      servers.push(server)
      const { port } = server.address() as AddressInfo
      resolve({ requests, baseUrl: `http://127.0.0.1:${port}` })
    })
  })
}

function attach(fixture: Fixture) {
  return attachPagesD1Binding({
    accountId: 'acc-1',
    apiToken: 'token-1',
    project: 'unhead-unjs-io',
    database: 'unhead-ai-ready',
    binding: 'AI_READY_DB',
    baseUrl: fixture.baseUrl,
  })
}

function makeDocsProject(): FixtureState['project'] {
  return {
    deployment_configs: {
      production: {
        d1_databases: { DB: { id: 'docs-db-id' } },
        analytics_engine_datasets: { TOOL_ANALYTICS: { dataset: 'unhead_tool_usage' } },
        env_vars: { NUXT_SESSION_PASSWORD: { type: 'secret_text' } },
      },
      preview: {
        d1_databases: { DB: { id: 'docs-db-id' } },
        env_vars: { MODE: { type: 'plain_text', value: 'preview' } },
      },
    },
  }
}

const workflowArgs = ['--project', 'unhead-unjs-io', '--database', 'unhead-ai-ready', '--binding', 'AI_READY_DB']

describe('parseArgs', () => {
  it('accepts the deploy workflow arguments', () => {
    expect(parseArgs(workflowArgs)).toEqual({
      project: 'unhead-unjs-io',
      database: 'unhead-ai-ready',
      binding: 'AI_READY_DB',
    })
  })

  it.each(['--project', '--database', '--binding'])('rejects a missing value for %s', (flag) => {
    const args = workflowArgs.filter((_, index) => index !== workflowArgs.indexOf(flag) + 1)
    expect(() => parseArgs(args)).toThrow(`${flag} requires a value`)
  })
})

describe('main', () => {
  it('attaches the binding with the deploy workflow arguments', async () => {
    const project = makeDocsProject()
    const fixture = await startFixture({
      databasePages: [[{ uuid: 'ai-ready-id', name: 'unhead-ai-ready' }]],
      project,
      patchApplies: true,
    })
    const realFetch = globalThis.fetch
    vi.stubGlobal('fetch', (url: string, options: RequestInit) => {
      return realFetch(url.replace('https://api.cloudflare.com/client/v4', fixture.baseUrl), options)
    })
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'acc-1')
    vi.stubEnv('CLOUDFLARE_API_TOKEN', 'fixture-token')
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(await main(workflowArgs)).toBe(0)
    expect(project.deployment_configs.production.d1_databases?.AI_READY_DB).toEqual({ id: 'ai-ready-id' })
    expect(log).toHaveBeenCalledWith('[attach-pages-d1] attached AI_READY_DB to unhead-unjs-io (unhead-ai-ready)')
    expect(error).not.toHaveBeenCalled()
  })
})

describe('attachPagesD1Binding', () => {
  it('patches only production D1 bindings and preserves unrelated project settings', async () => {
    const project = makeDocsProject()
    const fixture = await startFixture({
      databasePages: [[{ uuid: 'ai-ready-id', name: 'unhead-ai-ready' }]],
      project,
      patchApplies: true,
    })

    await expect(attach(fixture)).resolves.toEqual({ attached: true })

    const patches = fixture.requests.filter(request => request.method === 'PATCH')
    expect(patches).toHaveLength(1)
    expect(patches[0].body).toEqual({
      deployment_configs: {
        production: {
          d1_databases: {
            DB: { id: 'docs-db-id' },
            AI_READY_DB: { id: 'ai-ready-id' },
          },
        },
      },
    })
    const expectedProject = makeDocsProject()
    expectedProject.deployment_configs.production.d1_databases!.AI_READY_DB = { id: 'ai-ready-id' }
    expect(project).toEqual(expectedProject)
  })

  it('follows the D1 list pagination before patching', async () => {
    const filler = Array.from({ length: 2 }, (_, index) => ({ uuid: `filler-${index}`, name: `db-${index}` }))
    const fixture = await startFixture({
      databasePages: [filler, [{ uuid: 'ai-ready-id', name: 'unhead-ai-ready' }]],
      project: makeDocsProject(),
      patchApplies: true,
    })

    await expect(attach(fixture)).resolves.toEqual({ attached: true })
    expect(fixture.requests.some(request => request.pathname.includes('page=2'))).toBe(true)
  })

  it('does not patch when the binding already points at the database', async () => {
    const fixture = await startFixture({
      databasePages: [[{ uuid: 'ai-ready-id', name: 'unhead-ai-ready' }]],
      project: {
        deployment_configs: {
          production: { d1_databases: { AI_READY_DB: { id: 'ai-ready-id' } } },
        },
      },
      patchApplies: true,
    })

    await expect(attach(fixture)).resolves.toEqual({ attached: false })
    expect(fixture.requests.filter(request => request.method === 'PATCH')).toHaveLength(0)
  })

  it('fails when the project still lacks the binding after the patch', async () => {
    const fixture = await startFixture({
      databasePages: [[{ uuid: 'ai-ready-id', name: 'unhead-ai-ready' }]],
      project: makeDocsProject(),
      patchApplies: false,
    })

    await expect(attach(fixture)).rejects.toThrow(/AI_READY_DB/)
    expect(fixture.requests.filter(request => request.method === 'PATCH')).toHaveLength(1)
  })

  it('fails and never patches when the database is missing', async () => {
    const fixture = await startFixture({
      databasePages: [[{ uuid: 'docs-db-id', name: 'unhead-unjs-io' }]],
      project: makeDocsProject(),
      patchApplies: true,
    })

    await expect(attach(fixture)).rejects.toThrow(/unhead-ai-ready/)
    expect(fixture.requests.filter(request => request.method === 'PATCH')).toHaveLength(0)
  })

  it('rejects a malformed project response before patching', async () => {
    const fixture = await startFixture({
      databasePages: [[{ uuid: 'ai-ready-id', name: 'unhead-ai-ready' }]],
      project: makeDocsProject(),
      patchApplies: true,
      responseOverride: {
        pathname: '/accounts/acc-1/pages/projects/unhead-unjs-io',
        status: 200,
        body: { success: true, result: {} },
      },
    })

    await expect(attach(fixture)).rejects.toThrow('Unexpected Pages project response')
    expect(fixture.requests.filter(request => request.method === 'PATCH')).toHaveLength(0)
  })

  it.each([
    { status: 403, body: { success: false, errors: [{ code: 10000, message: 'Authentication error' }] }, error: /HTTP 403/ },
    { status: 200, body: { success: false, errors: [{ code: 10000, message: 'Authentication error' }] }, error: /Authentication error/ },
    { status: 200, body: { success: true, result: {} }, error: /expected a JSON array/ },
  ])('stops after a failed database response: $error', async ({ status, body, error }) => {
    const fixture = await startFixture({
      databasePages: [],
      project: makeDocsProject(),
      patchApplies: true,
      responseOverride: { pathname: '/accounts/acc-1/d1/database', status, body },
    })

    await expect(attach(fixture)).rejects.toThrow(error)
    expect(fixture.requests.filter(request => request.method === 'PATCH')).toHaveLength(0)
  })
})
