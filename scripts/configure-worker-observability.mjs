import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const WORKER_SCRIPT_NAME = 'unhead'
export const LOG_HEAD_SAMPLING_RATE = 0.1

export function desiredObservability(current = {}) {
  return {
    ...current,
    enabled: true,
    head_sampling_rate: LOG_HEAD_SAMPLING_RATE,
    logs: {
      ...(current.logs ?? {}),
      enabled: true,
      head_sampling_rate: LOG_HEAD_SAMPLING_RATE,
      invocation_logs: true,
      persist: true,
    },
    // Pages does not expose Worker observability in its Wrangler config. Keep
    // tracing explicitly disabled here; request logs provide the intended
    // visibility without adding span volume.
    traces: {
      ...(current.traces ?? {}),
      enabled: false,
    },
  }
}

export function matchesDesiredObservability(value) {
  return value?.enabled === true
    && value.head_sampling_rate === LOG_HEAD_SAMPLING_RATE
    && value.logs?.enabled === true
    && value.logs.head_sampling_rate === LOG_HEAD_SAMPLING_RATE
    && value.logs.invocation_logs === true
    && value.logs.persist === true
    && value.traces?.enabled === false
}

async function cloudflareRequest(path, { accountId, token, method = 'GET', body } = {}) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const text = await response.text()
  let payload
  try {
    payload = JSON.parse(text)
  }
  catch {
    throw new Error(`Cloudflare ${method} ${path} returned ${response.status} with a non-JSON body`)
  }

  if (!response.ok || payload.success !== true) {
    const errors = Array.isArray(payload.errors)
      ? payload.errors.map(error => `${error.code ?? 'unknown'}: ${error.message ?? 'unknown error'}`).join('; ')
      : 'unknown API error'
    throw new Error(`Cloudflare ${method} ${path} failed (${response.status}): ${errors}`)
  }

  return payload.result
}

export async function configureWorkerObservability({
  accountId,
  token,
  apply = false,
  scriptName = WORKER_SCRIPT_NAME,
} = {}) {
  if (!accountId || !token)
    throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required for --check/--apply')

  const path = `/workers/scripts/${encodeURIComponent(scriptName)}/script-settings`
  const current = await cloudflareRequest(path, { accountId, token })
  const desired = desiredObservability(current?.observability)

  if (!apply) {
    return {
      changed: !matchesDesiredObservability(current?.observability),
      observability: current?.observability ?? null,
    }
  }

  if (!matchesDesiredObservability(current?.observability))
    await cloudflareRequest(path, { accountId, token, method: 'PATCH', body: { observability: desired } })

  const verified = await cloudflareRequest(path, { accountId, token })
  if (!matchesDesiredObservability(verified?.observability))
    throw new Error(`Cloudflare accepted the settings update but ${scriptName} observability did not converge`)

  return { changed: !matchesDesiredObservability(current?.observability), observability: verified.observability }
}

async function main() {
  const apply = process.argv.includes('--apply')
  const check = process.argv.includes('--check')
  if (apply && check)
    throw new Error('choose either --check or --apply')

  if (!apply && !check) {
    console.log(JSON.stringify({
      apply: false,
      scriptName: WORKER_SCRIPT_NAME,
      observability: desiredObservability(),
    }, null, 2))
    return
  }

  const result = await configureWorkerObservability({
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    token: process.env.CLOUDFLARE_API_TOKEN,
    apply,
  })

  if (check && result.changed)
    throw new Error(`${WORKER_SCRIPT_NAME} observability differs from the cost-safe source policy`)

  console.log(`${WORKER_SCRIPT_NAME} observability ${apply ? (result.changed ? 'updated and verified' : 'already current') : 'matches source policy'}`)
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
