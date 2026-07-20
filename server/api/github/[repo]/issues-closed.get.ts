import { z } from 'zod'
import { initOctokitRequestHandler } from '~~/server/utils/github'
import { upstreamCacheTtl, withUpstreamCache } from '~~/server/utils/upstream-cache'

const IssuesClosedSchema = z.number().int().nonnegative()

export default defineEventHandler(async (e) => {
  const { octokit, repo, owner } = initOctokitRequestHandler(e)
  return withUpstreamCache(e, {
    key: `${owner}/${repo}`,
    maxAge: upstreamCacheTtl.week,
    name: 'github:issues-closed',
    schema: IssuesClosedSchema,
    staleMaxAge: upstreamCacheTtl.week,
  }, async () => {
    const { data } = await octokit.rest.search.issuesAndPullRequests({
      q: `repo:${owner}/${repo} is:issue is:closed`,
      per_page: 1,
    })
    return data.total_count
  })
})
