import type { H3Event } from 'h3'
import { getQuery } from 'h3'
import { initOctokitRequestHandler } from '~~/server/utils/github'

const PrMatchPattern = /#(\d+)/

export default defineCachedEventHandler(async (e) => {
  const { octokit, repo, owner } = initOctokitRequestHandler(e)
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/commits', {
    owner,
    repo,
    path: (getQuery(e)?.file as string) || '',
    per_page: 1,
  })

  const lastCommit = data[0]
  if (!lastCommit) {
    return null
  }

  let committerName = lastCommit.commit.author.name
  let committerLogin = lastCommit.committer?.login
  let commitUrl = lastCommit.html_url

  // If committer is web-flow, try to get the actual PR author
  if (committerLogin === 'web-flow') {
    const prMatch = lastCommit.commit.message.match(PrMatchPattern)
    if (prMatch?.[1]) {
      const { data: prData } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner,
        repo,
        pull_number: Number.parseInt(prMatch[1]),
      }).catch(() => ({ data: null }))
      if (prData) {
        committerLogin = prData.user.login
        committerName = prData.user.name || committerLogin
        commitUrl = prData.html_url
      }
    }
  }

  const date = lastCommit.commit.author.date
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  return {
    author: {
      name: committerName.toLowerCase().startsWith('harlan') ? 'Harlan Wilton' : committerName,
      committer: committerLogin,
    },
    dateHuman: formattedDate,
    date,
    url: commitUrl,
    message: lastCommit.commit.message,
  }
}, {
  name: 'gh-last-commit',
  maxAge: 60 * 60 * 24,
  getKey: (e: H3Event) => getRouterParam(e, 'repo') + getQuery(e)?.file,
})
