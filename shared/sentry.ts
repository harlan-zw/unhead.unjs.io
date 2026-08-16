export const SENTRY_DSN = 'https://f3ae6ad9827cb10d4527a1a47d3fc4de@o4510507748163584.ingest.us.sentry.io/4511887362686976'

export type SentryTarget
  = | { _tag: 'disabled', reason: string }
    | { _tag: 'enabled', environment: string, release: string }

export interface SentryBuildEnv {
  nodeEnv?: string
  sentryRelease?: string
  githubSha?: string
  sentryEnvironment?: string
}

/**
 * Decide whether a build may report to Sentry, and under which release.
 *
 * A release identity is the proof that a deploy produced this build. Without it
 * the build is a local one: `wrangler dev` and `nuxt preview` both run with
 * NODE_ENV=production, so NODE_ENV alone let a review sandbox file issues
 * against production.
 */
export function resolveSentryTarget(env: SentryBuildEnv): SentryTarget {
  if (env.nodeEnv !== 'production')
    return { _tag: 'disabled', reason: 'NODE_ENV is not production' }

  const release = env.sentryRelease || env.githubSha || ''
  if (!release)
    return { _tag: 'disabled', reason: 'no release identity, so this build was not produced by a deploy' }

  return { _tag: 'enabled', environment: env.sentryEnvironment || 'production', release }
}

export function sentryBuildTarget(): SentryTarget {
  return resolveSentryTarget({
    nodeEnv: process.env.NODE_ENV,
    sentryRelease: process.env.SENTRY_RELEASE,
    githubSha: process.env.GITHUB_SHA,
    sentryEnvironment: process.env.SENTRY_ENVIRONMENT,
  })
}

export function createSentryDataCollection() {
  return {
    userInfo: false,
    cookies: false,
    httpHeaders: { request: false, response: false },
    httpBodies: [],
    urlQueryParams: false,
    graphQL: { document: false, variables: false },
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,
    stackFrameVariables: false,
  }
}
