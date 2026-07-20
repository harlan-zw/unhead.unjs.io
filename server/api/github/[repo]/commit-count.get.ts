import { z } from 'zod'
import { initOctokitRequestHandler } from '~~/server/utils/github'
import { getLastPageFromLinkHeader } from '~~/server/utils/project-stats'
import { upstreamCacheTtl, withUpstreamCache } from '~~/server/utils/upstream-cache'

const CommitCountSchema = z.number().int().nonnegative()

export default defineEventHandler(async (e) => {
  const { octokit, repo, owner } = initOctokitRequestHandler(e)
  return withUpstreamCache(e, {
    key: `${owner}/${repo}`,
    maxAge: upstreamCacheTtl.week,
    name: 'github:commit-count',
    schema: CommitCountSchema,
    staleMaxAge: upstreamCacheTtl.week,
  }, async () => {
    const { headers } = await octokit.request('GET /repos/{owner}/{repo}/commits', {
      repo,
      owner,
      state: 'closed',
      per_page: 1,
      page: 1,
      sha: 'main',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    return getLastPageFromLinkHeader(headers.link)
  })
})
