import { z } from 'zod'
import { initOctokitRequestHandler } from '~~/server/utils/github'
import { upstreamCacheTtl, withUpstreamCache } from '~~/server/utils/upstream-cache'

const StarsSchema = z.object({
  stars: z.number().int().nonnegative(),
  updated_at: z.string().nullable(),
})

export default defineEventHandler(async (e) => {
  const { octokit, repo, owner } = initOctokitRequestHandler(e)
  return withUpstreamCache(e, {
    key: `${owner}/${repo}`,
    maxAge: upstreamCacheTtl.hour,
    name: 'github:stars',
    schema: StarsSchema,
    staleMaxAge: upstreamCacheTtl.day,
  }, async () => {
    const { data: res } = await octokit.request('GET /repos/{owner}/{repo}', {
      repo,
      owner,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    return {
      stars: res.stargazers_count,
      updated_at: res.updated_at,
    }
  })
})
