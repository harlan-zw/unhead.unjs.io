import { describe, expect, it } from 'vitest'
import {
  getDownloadDateRange,
  getLastPageFromLinkHeader,
  selectLatestMajorVersions,
} from '../server/utils/project-stats'

describe('getDownloadDateRange', () => {
  it('uses exact rolling windows across month and year boundaries', () => {
    expect(getDownloadDateRange(new Date('2026-01-02T12:00:00Z'))).toEqual({
      start: '2025-10-03',
      start30: '2025-12-02',
      end: '2025-12-31',
    })
  })
})

describe('getLastPageFromLinkHeader', () => {
  it('reads last regardless of query ordering', () => {
    const header = '<https://api.github.com/repos/a/b/commits?page=2&per_page=1>; rel="next", <https://api.github.com/repos/a/b/commits?sha=main&page=783&per_page=1>; rel="last"'
    expect(getLastPageFromLinkHeader(header)).toBe(783)
  })

  it('returns one for a single-page response', () => {
    expect(getLastPageFromLinkHeader(undefined)).toBe(1)
  })
})

describe('selectLatestMajorVersions', () => {
  it('selects the newest semver from each major', () => {
    expect(selectLatestMajorVersions([
      'v2.0.0',
      'v3.0.0-beta.1',
      'v2.1.0',
      '3.0.0',
      'v1.9.9',
      'not-a-version',
    ])).toEqual(['v3.0.0', 'v2.1.0', 'v1.9.9'])
  })
})
