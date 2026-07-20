import { fetchGitHubSponsors } from 'sponsorkit'
import { z } from 'zod'
import { upstreamCacheTtl, withUpstreamCache } from '~~/server/utils/upstream-cache'

const SponsorSchema = z.object({
  monthlyDollars: z.number(),
  sponsor: z.object({
    name: z.string(),
    websiteUrl: z.string().nullish(),
  }).passthrough(),
}).passthrough()
const SponsorsSchema = z.object({
  $25: z.array(SponsorSchema),
  $50: z.array(SponsorSchema),
  others: z.array(SponsorSchema),
})

export default defineEventHandler(async (e) => {
  const { githubAccessToken, githubAuthToken } = useRuntimeConfig(e)
  const token = githubAccessToken || githubAuthToken
  const empty = { others: [], $25: [], $50: [] }
  if (!token)
    return empty

  return withUpstreamCache(e, {
    key: 'harlan-zw:user',
    maxAge: upstreamCacheTtl.day,
    name: 'github:sponsors',
    schema: SponsorsSchema,
    staleMaxAge: upstreamCacheTtl.week,
  }, async () => {
    let fetchedSponsors: Awaited<ReturnType<typeof fetchGitHubSponsors>>
    try {
      fetchedSponsors = await fetchGitHubSponsors(token, 'harlan-zw', 'user', {
        force: true, // The global upstream cache owns freshness.
      })
    }
    catch (error) {
      console.error(JSON.stringify({
        message: 'Failed to refresh GitHub sponsors',
        error: error instanceof Error ? error.message : String(error),
      }))
      throw createError({ statusCode: 502, statusMessage: 'Failed to refresh sponsor data' })
    }

    const sponsors = fetchedSponsors.map((s) => {
      if (s.sponsor.name === 'Kintell-labs') {
        s.sponsor.name = 'Kintell'
        s.sponsor.websiteUrl = 'https://kintell.com'
      }
      if (s.sponsor.name === 'Massive Monster')
        s.sponsor.websiteUrl = 'https://massivemonster.co'
      return s
    })

    return sponsors.reduce((acc, sponsor) => {
      if (sponsor.monthlyDollars >= 25 && sponsor.monthlyDollars < 50)
        acc.$25?.push(sponsor)
      else if (sponsor.monthlyDollars >= 50)
        acc.$50?.push(sponsor)
      else
        acc.others?.push(sponsor)
      return acc
    }, empty)
  })
})
