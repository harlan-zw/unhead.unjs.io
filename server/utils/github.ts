import type { H3Event } from 'h3'
import { Octokit } from 'octokit'

export function createPublicGithubFetch(fetchImpl: typeof fetch = globalThis.fetch): typeof fetch {
  return async (input, init) => {
    const retryInput = input instanceof Request ? input.clone() : input
    const response = await fetchImpl(input, init)
    if (response.status !== 401 && response.status !== 403)
      return response

    const headers = new Headers(input instanceof Request ? input.headers : init?.headers)
    const initHeaders = new Headers(init?.headers)
    const hadAuthorization = headers.has('authorization') || initHeaders.has('authorization')
    if (!hadAuthorization)
      return response

    headers.delete('authorization')
    initHeaders.delete('authorization')
    for (const [key, value] of initHeaders)
      headers.set(key, value)

    return fetchImpl(retryInput, { ...init, headers })
  }
}

export function initOctokitRequestHandler(e: H3Event) {
  const { githubAccessToken } = useRuntimeConfig(e)
  const repo = (getRouterParam(e, 'repo') || '').replace('@', '/')
  const allowedRepos = ['unjs/unhead', 'harlan-zw/unhead.unjs.io']
  if (!allowedRepos.includes(repo)) {
    throw new Error(`Invalid repo ${repo}`)
  }
  return {
    repo: repo.split('/')[1],
    owner: repo.split('/')[0],
    octokit: new Octokit({
      auth: githubAccessToken || undefined,
      request: {
        // These endpoints only expose public allowlisted repositories. If a
        // configured token expires or is rejected by an organization policy,
        // retry anonymously instead of taking the public site down with it.
        fetch: createPublicGithubFetch(),
      },
    }),
  }
}
