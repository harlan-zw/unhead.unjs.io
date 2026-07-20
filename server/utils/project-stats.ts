const DAY_MS = 24 * 60 * 60 * 1000

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function getDownloadDateRange(now = new Date()): {
  start: string
  start30: string
  end: string
} {
  const end = new Date(now.getTime() - 2 * DAY_MS)
  return {
    start: toDateString(new Date(end.getTime() - 89 * DAY_MS)),
    start30: toDateString(new Date(end.getTime() - 29 * DAY_MS)),
    end: toDateString(end),
  }
}

export function getLastPageFromLinkHeader(link: string | null | undefined): number {
  if (!link)
    return 1

  const lastLink = link
    .split(',')
    .map(part => part.trim())
    .find(part => /;\s*rel="last"\s*$/.test(part))
  const href = lastLink?.match(/^<([^>]+)>/)?.[1]
  if (!href)
    return 1

  const page = Number(new URL(href).searchParams.get('page'))
  return Number.isSafeInteger(page) && page > 0 ? page : 1
}

interface ParsedVersion {
  tag: string
  major: number
  minor: number
  patch: number
  prerelease: boolean
}

function parseVersion(tag: string): ParsedVersion | undefined {
  const match = tag.match(/^v?(\d+)\.(\d+)\.(\d+)(-.+)?$/)
  if (!match)
    return
  return {
    tag: tag.startsWith('v') ? tag : `v${tag}`,
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: Boolean(match[4]),
  }
}

function compareVersions(a: ParsedVersion, b: ParsedVersion): number {
  return b.major - a.major
    || b.minor - a.minor
    || b.patch - a.patch
    || Number(a.prerelease) - Number(b.prerelease)
}

export function selectLatestMajorVersions(tags: string[]): string[] {
  const versions = tags.map(parseVersion).filter((version): version is ParsedVersion => Boolean(version))
  const latestByMajor = new Map<number, ParsedVersion>()

  for (const version of versions) {
    const current = latestByMajor.get(version.major)
    if (!current || compareVersions(version, current) < 0)
      latestByMajor.set(version.major, version)
  }

  return [...latestByMajor.values()].sort(compareVersions).map(version => version.tag)
}
