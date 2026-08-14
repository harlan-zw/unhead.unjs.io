import { describe, expect, it } from 'vitest'
import { getDocPath, getHomepageDocPath } from '../utils/urls'

describe('getDocPath', () => {
  it('links shared docs through their framework-neutral canonical path', () => {
    expect(getDocPath('/head/api/composables/use-head', {
      _tag: 'shared',
      version: 'v3',
    })).toBe('/docs/head/api/composables/use-head')
  })

  it('retains the framework path for authored implementation docs', () => {
    expect(getDocPath('/head/guides/get-started/installation', {
      _tag: 'framework',
      framework: 'vue',
      version: 'v3',
    })).toBe('/docs/vue/head/guides/get-started/installation')
  })

  it('retains the v2 prefix without introducing a framework alias', () => {
    expect(getDocPath('/head/guides/get-started/overview', {
      _tag: 'shared',
      version: 'v2',
    })).toBe('/docs/v2/head/guides/get-started/overview')
  })

  it('links the homepage Devtools item to its current guide', () => {
    expect(getHomepageDocPath('devtools')).toBe('/docs/head/guides/build-plugins/devtools')
  })
})
