import { getQuery } from 'h3'
import { z } from 'zod'
import { initOctokitRequestHandler } from '~~/server/utils/github'
import { upstreamCacheTtl, withUpstreamCache } from '~~/server/utils/upstream-cache'

const PrMatchPattern = /#(\d+)/
const GitHubRequestTimeoutMs = 5_000
const LastFileCommitSchema = z.object({
  author: z.object({
    committer: z.string().nullish(),
    name: z.string(),
  }),
  date: z.string(),
  dateHuman: z.string(),
  message: z.string(),
  url: z.string(),
}).nullable()

export default defineEventHandler(async (e) => {
  const { octokit, repo, owner } = initOctokitRequestHandler(e)
  const fileQuery = getQuery(e).file
  const file = typeof fileQuery === 'string' ? fileQuery : ''

  return withUpstreamCache(e, {
    key: `${owner}/${repo}:${file}`,
    maxAge: upstreamCacheTtl.day,
    name: 'github:last-file-commit',
    schema: LastFileCommitSchema,
    staleMaxAge: upstreamCacheTtl.week,
  }, async () => {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/commits', {
      owner,
      repo,
      path: file,
      per_page: 10,
      request: { signal: AbortSignal.timeout(GitHubRequestTimeoutMs) },
    })

    // Skip merge commits to find the actual content change
    const lastCommit = data.find(c => !c.commit.message.startsWith('Merge ')) || data[0]
    if (!lastCommit)
      return null

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
          request: { signal: AbortSignal.timeout(GitHubRequestTimeoutMs) },
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
      message: lastCommit.commit.message.split('\n')[0],
    }
  })
})
