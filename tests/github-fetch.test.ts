import { describe, expect, it, vi } from 'vitest'
import { createPublicGithubFetch } from '../server/utils/github'

describe('createPublicGithubFetch', () => {
  it('retries authentication failures without credentials', async () => {
    const fetchImpl = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 403 }))
      .mockResolvedValueOnce(new Response('ok'))
    const githubFetch = createPublicGithubFetch(fetchImpl)

    const response = await githubFetch('https://api.github.com/repos/unjs/unhead', {
      headers: { authorization: 'Bearer expired', accept: 'application/json' },
    })

    expect(await response.text()).toBe('ok')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    const retryInit = fetchImpl.mock.calls[1]?.[1]
    const retryHeaders = new Headers(retryInit?.headers)
    expect(retryHeaders.has('authorization')).toBe(false)
    expect(retryHeaders.get('accept')).toBe('application/json')
  })

  it('does not retry successful or unrelated failed requests', async () => {
    for (const status of [200, 404, 500]) {
      const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status }))
      const githubFetch = createPublicGithubFetch(fetchImpl)

      expect((await githubFetch('https://api.github.com', {
        headers: { authorization: 'Bearer token' },
      })).status).toBe(status)
      expect(fetchImpl).toHaveBeenCalledOnce()
    }
  })

  it('does not repeat anonymous rate-limit failures', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 403 }))
    const githubFetch = createPublicGithubFetch(fetchImpl)

    expect((await githubFetch('https://api.github.com')).status).toBe(403)
    expect(fetchImpl).toHaveBeenCalledOnce()
  })
})
