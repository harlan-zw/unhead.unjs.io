import { describe, expect, it } from 'vitest'
import { resolveSentryTarget } from '../shared/sentry'

const deployedBuild = {
  nodeEnv: 'production',
  sentryRelease: 'a91384d22154e9f1ab56c22a8166bf0193d82ffc',
}

describe('resolveSentryTarget', () => {
  it('reports a deployed build against its own release', () => {
    expect(resolveSentryTarget(deployedBuild)).toEqual({
      _tag: 'enabled',
      environment: 'production',
      release: 'a91384d22154e9f1ab56c22a8166bf0193d82ffc',
    })
  })

  it('falls back to the workflow commit when no release is passed', () => {
    expect(resolveSentryTarget({ nodeEnv: 'production', githubSha: 'fc9b0a5' })).toEqual({
      _tag: 'enabled',
      environment: 'production',
      release: 'fc9b0a5',
    })
  })

  it('prefers the explicit release over the workflow commit', () => {
    const target = resolveSentryTarget({
      nodeEnv: 'production',
      sentryRelease: 'a91384d',
      githubSha: 'fc9b0a5',
    })
    expect(target).toEqual({ _tag: 'enabled', environment: 'production', release: 'a91384d' })
  })

  it('stays silent for a production build with no release identity', () => {
    // A local `wrangler dev` on a built worker runs with NODE_ENV=production.
    // UNHEAD-7 was such a sandbox reporting into the production issue stream.
    expect(resolveSentryTarget({ nodeEnv: 'production' })).toEqual({
      _tag: 'disabled',
      reason: 'no release identity, so this build was not produced by a deploy',
    })
  })

  it('stays silent outside a production build', () => {
    expect(resolveSentryTarget({ nodeEnv: 'development', sentryRelease: 'a91384d' })).toEqual({
      _tag: 'disabled',
      reason: 'NODE_ENV is not production',
    })
  })

  it('accepts an environment override for a non-production deploy', () => {
    expect(resolveSentryTarget({ ...deployedBuild, sentryEnvironment: 'staging' })).toEqual({
      _tag: 'enabled',
      environment: 'staging',
      release: 'a91384d22154e9f1ab56c22a8166bf0193d82ffc',
    })
  })
})
