import { initOctokitRequestHandler } from '~~/server/utils/github'

export default defineCachedEventHandler(async (e) => {
  const { octokit, repo, owner } = initOctokitRequestHandler(e)
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
}, {
  swr: true,
  maxAge: 60 * 60,
})
