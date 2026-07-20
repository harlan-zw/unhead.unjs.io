import { z } from 'zod'
import { initOctokitRequestHandler } from '~~/server/utils/github'
import { upstreamCacheTtl, withUpstreamCache } from '~~/server/utils/upstream-cache'

const ReleasesSchema = z.array(z.object({
  body: z.string().nullable(),
  name: z.string(),
  prerelease: z.boolean(),
  publishedAt: z.string().nullable(),
  url: z.string(),
}))

export default defineEventHandler(async (e) => {
  const { octokit, repo, owner } = initOctokitRequestHandler(e)
  return withUpstreamCache(e, {
    key: `${owner}/${repo}`,
    maxAge: upstreamCacheTtl.hour,
    name: 'github:releases',
    schema: ReleasesSchema,
    staleMaxAge: upstreamCacheTtl.day,
  }, async () => {
    const { data: res } = await octokit.request('GET /repos/{owner}/{repo}/releases', {
      repo,
      owner,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    return res.map(release => ({
      name: release.tag_name,
      publishedAt: release.published_at,
      body: release.body,
      prerelease: release.prerelease,
      url: release.html_url,
    }))
  })
})
