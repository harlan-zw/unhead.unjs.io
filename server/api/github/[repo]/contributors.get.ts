import { z } from 'zod'
import { initOctokitRequestHandler } from '~~/server/utils/github'
import { upstreamCacheTtl, withUpstreamCache } from '~~/server/utils/upstream-cache'

const ContributorsSchema = z.array(z.object({
  avatar_url: z.string(),
  contributions: z.number().int().nonnegative(),
  login: z.string(),
}))

export default defineEventHandler(async (e) => {
  const { octokit, repo, owner } = initOctokitRequestHandler(e)
  return withUpstreamCache(e, {
    key: `${owner}/${repo}`,
    maxAge: upstreamCacheTtl.hour,
    name: 'github:contributors',
    schema: ContributorsSchema,
    staleMaxAge: upstreamCacheTtl.day,
  }, async () => {
    const contributors: { login: string, avatar_url: string, contributions: number }[] = []
    let page = 1
    while (true) {
      const { data } = await octokit.request('GET /repos/{owner}/{repo}/contributors', {
        owner,
        repo,
        per_page: 100,
        page,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
      if (!data.length)
        break
      for (const c of data) {
        if (c.type === 'Bot' || !c.login || c.login.includes('[bot]'))
          continue
        contributors.push({
          login: c.login,
          avatar_url: c.avatar_url!,
          contributions: c.contributions!,
        })
      }
      if (data.length < 100)
        break
      page++
    }
    return contributors
  })
})
