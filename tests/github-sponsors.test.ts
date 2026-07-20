import { describe, expect, it, vi } from 'vitest'
import { fetchActiveGitHubSponsors } from '../server/utils/github-sponsors'

function sponsorNode(login: string, websiteUrl: string | null = 'example.com') {
  return {
    createdAt: '2026-01-01T00:00:00Z',
    isActive: true,
    privacyLevel: 'PUBLIC',
    sponsorEntity: {
      __typename: 'User',
      avatarUrl: `https://avatars.example.com/${login}`,
      login,
      name: null,
      websiteUrl,
    },
    tier: {
      isOneTime: false,
      monthlyPriceInDollars: 25,
      name: 'Supporter',
    },
  }
}

function githubResponse(nodes: unknown[], hasNextPage = false, endCursor: string | null = null) {
  return new Response(JSON.stringify({
    data: {
      user: {
        sponsorshipsAsMaintainer: {
          nodes,
          pageInfo: { endCursor, hasNextPage },
        },
      },
    },
  }), { headers: { 'content-type': 'application/json' } })
}

describe('fetchActiveGitHubSponsors', () => {
  it('uses the GitHub GraphQL API and follows pagination', async () => {
    const responses = [
      githubResponse([sponsorNode('first')], true, 'next-page'),
      githubResponse([sponsorNode('second', null)]),
    ]
    const fetchMock = vi.fn(async () => responses.shift()!) as unknown as typeof fetch

    const sponsors = await fetchActiveGitHubSponsors('secret-token', 'harlan-zw', fetchMock)

    expect(sponsors).toHaveLength(2)
    expect(sponsors[0]).toMatchObject({
      monthlyDollars: 25,
      sponsor: {
        linkUrl: 'https://github.com/first',
        name: 'first',
        websiteUrl: 'https://example.com',
      },
    })
    expect(sponsors[1]?.sponsor.websiteUrl).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(2)

    const firstInit = fetchMock.mock.calls[0]?.[1] as RequestInit
    const secondInit = fetchMock.mock.calls[1]?.[1] as RequestInit
    expect(new Headers(firstInit.headers).get('authorization')).toBe('Bearer secret-token')
    expect(JSON.parse(String(secondInit.body)).variables.cursor).toBe('next-page')
  })

  it('filters sponsorships without a public entity or active tier', async () => {
    const hidden = { ...sponsorNode('hidden'), sponsorEntity: null }
    const inactive = { ...sponsorNode('inactive'), isActive: false }
    const fetchMock = vi.fn(async () => githubResponse([hidden, inactive])) as unknown as typeof fetch

    await expect(fetchActiveGitHubSponsors('token', 'harlan-zw', fetchMock)).resolves.toEqual([])
  })

  it('fails fast on GitHub API errors', async () => {
    const fetchMock = vi.fn(async () => new Response('rate limited', { status: 429 })) as unknown as typeof fetch

    await expect(fetchActiveGitHubSponsors('token', 'harlan-zw', fetchMock))
      .rejects
      .toThrow('status 429')
  })

  it('surfaces GraphQL errors returned with a successful HTTP status', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      errors: [{ message: 'Resource not accessible by personal access token' }],
    }))) as unknown as typeof fetch

    await expect(fetchActiveGitHubSponsors('token', 'harlan-zw', fetchMock))
      .rejects
      .toThrow('Resource not accessible by personal access token')
  })
})
