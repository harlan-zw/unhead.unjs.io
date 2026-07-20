import { z } from 'zod'

const GitHubSponsorsResponseSchema = z.object({
  data: z.object({
    user: z.object({
      sponsorshipsAsMaintainer: z.object({
        nodes: z.array(z.object({
          createdAt: z.string(),
          isActive: z.boolean(),
          privacyLevel: z.string(),
          sponsorEntity: z.object({
            __typename: z.string(),
            avatarUrl: z.string(),
            login: z.string(),
            name: z.string().nullable(),
            websiteUrl: z.string().nullable(),
          }).nullable(),
          tier: z.object({
            isOneTime: z.boolean(),
            monthlyPriceInDollars: z.number(),
            name: z.string(),
          }).nullable(),
        })),
        pageInfo: z.object({
          endCursor: z.string().nullable(),
          hasNextPage: z.boolean(),
        }),
      }),
    }).nullable(),
  }).optional(),
  errors: z.array(z.object({ message: z.string() }).passthrough()).optional(),
})

const SponsorsQuery = `
  query Sponsors($login: String!, $cursor: String) {
    user(login: $login) {
      sponsorshipsAsMaintainer(activeOnly: true, first: 100, after: $cursor) {
        nodes {
          createdAt
          isActive
          privacyLevel
          sponsorEntity {
            ... on User { __typename avatarUrl login name websiteUrl }
            ... on Organization { __typename avatarUrl login name websiteUrl }
          }
          tier { isOneTime monthlyPriceInDollars name }
        }
        pageInfo { endCursor hasNextPage }
      }
    }
  }
`

export interface GitHubSponsor {
  createdAt: string
  isOneTime: boolean
  monthlyDollars: number
  privacyLevel: string
  sponsor: {
    avatarUrl: string
    linkUrl: string
    login: string
    name: string
    type: string
    websiteUrl: string | null
  }
  tierName: string
}

export async function fetchActiveGitHubSponsors(
  token: string,
  login: string,
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<GitHubSponsor[]> {
  const sponsors: GitHubSponsor[] = []
  const signal = AbortSignal.timeout(10_000)
  let cursor: string | null = null

  for (let page = 0; page < 10; page++) {
    const response = await fetchImpl('https://api.github.com/graphql', {
      body: JSON.stringify({ query: SponsorsQuery, variables: { cursor, login } }),
      headers: {
        'accept': 'application/vnd.github+json',
        'authorization': `Bearer ${token}`,
        'content-type': 'application/json',
        'user-agent': 'unhead.unjs.io',
      },
      method: 'POST',
      signal,
    })

    if (!response.ok)
      throw new Error(`GitHub Sponsors request failed with status ${response.status}`)

    const result = GitHubSponsorsResponseSchema.safeParse(await response.json())
    if (!result.success)
      throw new Error('GitHub Sponsors response did not match the expected schema')
    if (result.data.errors?.length)
      throw new Error(`GitHub Sponsors request failed: ${result.data.errors[0]?.message || 'unknown error'}`)

    const connection = result.data.data?.user?.sponsorshipsAsMaintainer
    if (!connection)
      throw new Error(`GitHub Sponsors user ${login} was not found`)

    for (const node of connection.nodes) {
      if (!node.isActive || !node.sponsorEntity || !node.tier)
        continue

      const sponsor = node.sponsorEntity
      sponsors.push({
        createdAt: node.createdAt,
        isOneTime: node.tier.isOneTime,
        monthlyDollars: node.tier.monthlyPriceInDollars,
        privacyLevel: node.privacyLevel,
        sponsor: {
          avatarUrl: sponsor.avatarUrl,
          linkUrl: `https://github.com/${sponsor.login}`,
          login: sponsor.login,
          name: sponsor.name || sponsor.login,
          type: sponsor.__typename,
          websiteUrl: normalizeWebsiteUrl(sponsor.websiteUrl),
        },
        tierName: node.tier.name,
      })
    }

    if (!connection.pageInfo.hasNextPage)
      return sponsors
    if (!connection.pageInfo.endCursor)
      throw new Error('GitHub Sponsors pagination cursor was missing')
    cursor = connection.pageInfo.endCursor
  }

  throw new Error('GitHub Sponsors pagination exceeded 10 pages')
}

function normalizeWebsiteUrl(value: string | null): string | null {
  if (!value)
    return null

  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).toString().replace(/\/$/, '')
  }
  catch {
    return value
  }
}
