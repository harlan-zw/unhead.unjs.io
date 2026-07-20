import { z } from 'zod'
import { getDownloadDateRange } from '~~/server/utils/project-stats'
import { upstreamCacheTtl, withUpstreamCache } from '~~/server/utils/upstream-cache'
import { modules } from '../../../../const'

const allowedPackages = new Set(modules.map(module => module.npm))
const DownloadDaySchema = z.object({
  day: z.string(),
  downloads: z.number().int().nonnegative(),
})
const NpmRangeSchema = z.object({
  downloads: z.array(DownloadDaySchema),
  end: z.string(),
  package: z.string(),
  start: z.string(),
})
const DownloadsSchema = z.object({
  averageDownloads30: z.number().int(),
  averageDownloads90: z.number().int(),
  downloads: z.array(DownloadDaySchema),
  percentageChange: z.number().int(),
  totalDownloads30: z.number().int().nonnegative(),
  totalDownloads90: z.number().int().nonnegative(),
})

export default defineEventHandler(async (e) => {
  const packageName = (getRouterParam(e, 'pkgName') || '').replace('_', '/')
  if (!allowedPackages.has(packageName))
    throw createError({ statusCode: 400, statusMessage: 'Unsupported package' })

  const { start, start30, end } = getDownloadDateRange()

  return withUpstreamCache(e, {
    key: `${packageName}:${start}:${end}`,
    maxAge: upstreamCacheTtl.day,
    name: 'npm:downloads',
    schema: DownloadsSchema,
    staleMaxAge: upstreamCacheTtl.week,
  }, async () => {
    const data = NpmRangeSchema.parse(await $fetch<unknown>(
      `https://api.npmjs.org/downloads/range/${start}:${end}/${packageName}`,
    ))

    const totalDownloads90 = data.downloads.reduce((sum, day) => sum + day.downloads, 0)
    const totalDownloads30 = data.downloads
      .filter(day => day.day >= start30)
      .reduce((sum, day) => sum + day.downloads, 0)
    const averageDownloads90 = Math.round(totalDownloads90 / 90)
    const averageDownloads30 = Math.round(totalDownloads30 / 30)

    const percentageChange = averageDownloads90 === 0
      ? 0
      : Math.round(((averageDownloads30 - averageDownloads90) / averageDownloads90) * 100)
    return {
      downloads: data.downloads,
      totalDownloads90,
      totalDownloads30,
      averageDownloads30,
      averageDownloads90,
      percentageChange,
    }
  })
})
