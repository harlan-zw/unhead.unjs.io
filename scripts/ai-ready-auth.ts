import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'

type TokenResult = { _tag: 'Ok', token: string } | { _tag: 'Err', message: string }

export function createRuntimeSyncToken(root: unknown, context: { cwd: string, env: NodeJS.ProcessEnv }): TokenResult {
  if (typeof root !== 'string' || root.length < 32) {
    return { _tag: 'Err', message: 'Set NUXT_APP_SECRET to the existing production application secret, with at least 32 characters.' }
  }

  const token = execFileSync('pnpm', ['exec', 'nuxt-ai-ready', 'token'], {
    cwd: context.cwd,
    env: { ...context.env, NUXT_APP_SECRET: root, NITRO_APP_SECRET: root },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()

  if (!/^[a-f0-9]{64}$/.test(token))
    return { _tag: 'Err', message: 'AI Ready returned an invalid runtime sync token.' }

  return { _tag: 'Ok', token }
}

if (import.meta.main) {
  const environmentFile = process.env.GITHUB_ENV
  if (!environmentFile)
    throw new Error('Run this script inside GitHub Actions.')

  const result = createRuntimeSyncToken(process.env.NUXT_APP_SECRET, { cwd: process.cwd(), env: process.env })
  if (result._tag === 'Err')
    throw new Error(result.message)

  console.log(`::add-mask::${result.token}`)
  appendFileSync(environmentFile, `AI_READY_SECRET=${result.token}\n`)
}
