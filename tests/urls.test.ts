import { describe, expect, it } from 'vitest'
import { getPathSegments, getPathSubSection } from '../utils/urls'

describe('uRL utilities', () => {
  describe('getPathSegments', () => {
    it('returns the full path when segments are less than or equal to size', () => {
      expect(getPathSegments('/foo/bar/baz', 3)).toBe('/foo/bar/baz')
      expect(getPathSegments('/foo/bar/baz', 2)).toBe('/foo/bar')
    })

    it('handles empty segments correctly', () => {
      expect(getPathSegments('//foo//bar', 2)).toBe('/foo/bar')
    })
  })

  describe('getPathSubSection', () => {
    it('returns the full path when less than 3 segments', () => {
      expect(getPathSubSection('/docs/guide')).toBe('/docs/guide')
    })

    it('handles root path correctly', () => {
      expect(getPathSubSection('/')).toBe('/')
    })

    it('handles deeply nested paths', () => {
      expect(getPathSubSection('/very/long/path/with/many/segments')).toBe('/very/long/path')
    })
  })
})
