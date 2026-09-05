#!/usr/bin/env node

import { resolve } from 'node:path'
import process from 'node:process'

const DEFAULT_API_BASE = 'https://api.cloudflare.com/client/v4'

export function parseArgs(argv) {
  const readFlag = (flag) => {
    const index = argv.indexOf(flag)
    const value = index > -1 ? argv[index + 1] : null
    if (!value || value.startsWith('--'))
      throw new Error(`${flag} requires a value`)
    return value
  }
  return {
    project: readFlag(argv, '--project'),
    database: readFlag(argv, '--database'),
    binding: readFlag(argv, '--binding'),
  }
}

export function patchBody(deploymentConfigs, binding, databaseId) {
  const configs = deploymentConfigs ?? {}
  const productionD1 = configs.production?.d1_databases ?? {}
  return {
    deployment_configs: {
      ...configs,
      production: {
        ...configs.production,
        d1_databases: {
          ...productionD1,
          [binding]: { id: databaseId },
        },
      },
    },
  }
}

async function apiRequest({ method, url, apiToken, body }) {
  const response = await fetch(url, {
    method,
    headers: {
      'authorization': `Bearer ${apiToken}`,
      'content-type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok)
    throw new Error(`${method} ${url} failed with HTTP ${response.status}`)
  const payload = await response.json()
  if (payload.success === false)
    throw new Error(`${method} ${url} failed: ${JSON.stringify(payload.errors)}`)
  return payload
}

export async function findD1DatabaseId({ baseUrl = DEFAULT_API_BASE, accountId, apiToken, name }) {
  const databases = []
  let page = 1
  for (;;) {
    const payload = await apiRequest({
      method: 'GET',
      url: `${baseUrl}/accounts/${accountId}/d1/database?page=${page}&per_page=100`,
      apiToken,
    })
    if (!Array.isArray(payload.result))
      throw new Error('Unexpected D1 database list response; expected a JSON array')
    databases.push(...payload.result)
    const totalPages = payload.result_info?.total_pages ?? 1
    if (page >= totalPages)
      break
    page += 1
  }
  const database = databases.find(entry => entry?.name === name)
  if (!database?.uuid)
    throw new Error(`D1 database "${name}" not found; the deploy workflow must create it before attaching`)
  return database.uuid
}

export async function attachPagesD1Binding({ accountId, apiToken, project, database, binding, baseUrl = DEFAULT_API_BASE }) {
  const databaseId = await findD1DatabaseId({ baseUrl, accountId, apiToken, name: database })
  const projectUrl = `${baseUrl}/accounts/${accountId}/pages/projects/${project}`

  const current = await apiRequest({ method: 'GET', url: projectUrl, apiToken })
  const configs = current.result?.deployment_configs ?? {}
  if (configs.production?.d1_databases?.[binding]?.id === databaseId)
    return { attached: false }

  await apiRequest({ method: 'PATCH', url: projectUrl, apiToken, body: patchBody(configs, binding, databaseId) })

  // A 2xx PATCH is not proof. Read the project back and require the binding.
  const verified = await apiRequest({ method: 'GET', url: projectUrl, apiToken })
  const verifiedId = verified.result?.deployment_configs?.production?.d1_databases?.[binding]?.id
  if (verifiedId !== databaseId)
    throw new Error(`Pages project "${project}" still lacks ${binding} after the update; got ${verifiedId ?? 'nothing'}`)
  return { attached: true }
}

export async function main(argv = process.argv.slice(2)) {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN
    if (!accountId || !apiToken)
      throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required')

    const args = parseArgs(argv)
    const { attached } = await attachPagesD1Binding({ accountId, apiToken, ...args })
    console.log(attached
      ? `[attach-pages-d1] attached ${args.binding} to ${args.project} (${args.database})`
      : `[attach-pages-d1] ${args.binding} already points at ${args.database} on ${args.project}`)
    return 0
  }
  catch (error) {
    console.error(`[attach-pages-d1] ${error instanceof Error ? error.message : String(error)}`)
    return 1
  }
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename)
  process.exitCode = await main()
