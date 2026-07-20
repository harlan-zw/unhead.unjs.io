import { selectLatestMajorVersions } from '~~/server/utils/project-stats'
import { modules } from '../../const'

export default defineEventHandler(async (e) => {
  const [stars, commitCount, issuesClosed, releases, contributors] = await Promise.all([
    e.$fetch(`/api/github/unjs@unhead/stars`).catch(() => ({ stars: 0 })),
    e.$fetch(`/api/github/unjs@unhead/commit-count`).catch(() => 0),
    e.$fetch(`/api/github/unjs@unhead/issues-closed`).catch(() => 0),
    e.$fetch(`/api/github/unjs@unhead/releases`).catch(() => []),
    e.$fetch(`/api/github/unjs@unhead/contributors`).catch(() => []),
  ])
  const versions = selectLatestMajorVersions(releases.map(release => release.name))
  const moduleStats = await Promise.all(modules.map(async (module) => {
    const downloads = await e.$fetch(`/api/npm/${module.npm.replace('/', '_')}/downloads`).catch(() => {
      return {
        totalDownloads90: 0,
        totalDownloads30: 0,
        averageDownloads30: 0,
        averageDownloads90: 0,
        percentageChange: 0,
      }
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
