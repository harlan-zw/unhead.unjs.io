import type { ServerFetchResponse } from 'nuxt/server'
import { defineHandler, serverFetch } from 'nuxt/server'
import { selectLatestMajorVersions } from '~~/server/utils/project-stats'
import { modules } from '../../const'

async function jsonOr<T, F>(request: Promise<ServerFetchResponse<T>>, fallback: F): Promise<T | F> {
  // Public statistics can render with defaults while a source is unavailable.
  return request
    .then(async response => response.ok ? await response.json() : fallback)
    .catch(() => fallback)
}

export default defineHandler(async (event) => {
  const [stars, commitCount, issuesClosed, releases, contributors] = await Promise.all([
    jsonOr(serverFetch(event, '/api/github/unjs@unhead/stars'), { stars: 0 }),
    jsonOr(serverFetch(event, '/api/github/unjs@unhead/commit-count'), 0),
    jsonOr(serverFetch(event, '/api/github/unjs@unhead/issues-closed'), 0),
    jsonOr(serverFetch(event, '/api/github/unjs@unhead/releases'), []),
    jsonOr(serverFetch(event, '/api/github/unjs@unhead/contributors'), []),
  ])
  const versions = selectLatestMajorVersions(releases.map(release => release.name))
  const moduleStats = await Promise.all(modules.map(async (module) => {
    const downloads = await jsonOr(serverFetch(event, `/api/npm/${module.npm.replace('/', '_')}/downloads`), {
      totalDownloads90: 0,
      totalDownloads30: 0,
      averageDownloads30: 0,
      averageDownloads90: 0,
      percentageChange: 0,
    })
    return {
      slug: module.slug,
      ...downloads,
    }
  }))

  return {
    fetchedAt: Date.now(),
    modules: moduleStats,
    versions,
    stars,
    commitCount,
    issuesClosed,
    releases,
    contributors,
  }
})
