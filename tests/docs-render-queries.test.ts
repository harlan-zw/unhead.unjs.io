import { beforeEach, describe, expect, it, vi } from 'vitest'

import { computed as vueComputed, ref as vueRef } from 'vue'

const { useAsyncDataMock, injectMock, queryCollectionMock, queryCollectionNavigationMock, queryCollectionItemSurroundingsMock } = vi.hoisted(() => ({
  useAsyncDataMock: vi.fn(),
  injectMock: vi.fn(),
  queryCollectionMock: vi.fn(),
  queryCollectionNavigationMock: vi.fn(),
  queryCollectionItemSurroundingsMock: vi.fn(),
}))

vi.mock('#imports', () => ({
  useAsyncData: (...args: any[]) => useAsyncDataMock(...args),
  createError: (input: any) => Object.assign(new Error(input?.statusMessage ?? 'error'), input),
  toRaw: (value: any) => value,
  toValue: (value: any) => (value && typeof value === 'object' && 'value' in value ? value.value : value),
  queryCollection: (...args: any[]) => queryCollectionMock(...args),
  queryCollectionNavigation: (...args: any[]) => queryCollectionNavigationMock(...args),
  inject: (...args: any[]) => injectMock(...args),
}))

interface NavNode {
  title: string
  path: string
  page?: false
  children?: NavNode[]
}

interface ContentRow {
  id: string
  path: string
  title: string
  description: string
}

const navigationRef: { value: NavNode[] | null } = { value: null }
const navigationListingCalls: string[][] = []
const surroundingsCalls: Array<{ collection: string, path: string }> = []
let currentRoutePath = ''
let nuxtAppStaticData: Record<string, unknown> = {}

Object.defineProperty(globalThis, 'ref', { value: vueRef, configurable: true, writable: true })
Object.defineProperty(globalThis, 'computed', { value: vueComputed, configurable: true, writable: true })
Object.defineProperty(globalThis, 'toRaw', { value: (v: any) => v, configurable: true, writable: true })
Object.defineProperty(globalThis, 'useNuxtApp', {
  value: () => ({ static: { data: nuxtAppStaticData } }),
  configurable: true,
  writable: true,
})
Object.defineProperty(globalThis, 'useRouter', {
  value: () => ({ currentRoute: { value: { path: currentRoutePath } } }),
  configurable: true,
  writable: true,
})
Object.defineProperty(globalThis, 'useAsyncData', { value: useAsyncDataMock, configurable: true, writable: true })
Object.defineProperty(globalThis, 'queryCollection', { value: queryCollectionMock, configurable: true, writable: true })
Object.defineProperty(globalThis, 'inject', { value: injectMock, configurable: true, writable: true })
Object.defineProperty(globalThis, 'queryCollectionItemSurroundings', {
  value: (...args: any[]) => queryCollectionItemSurroundingsMock(...args),
  configurable: true,
  writable: true,
})
Object.defineProperty(globalThis, 'createError', {
  value: (input: { statusCode?: number, statusMessage?: string }) =>
    Object.assign(new Error(input?.statusMessage ?? 'error'), input),
  configurable: true,
  writable: true,
})

const { useCurrentDocPage } = await import('../app/composables/data')

interface NavRef {
  value: NavNode[] | null
}

interface LoadNavigationFn {
  (): Promise<void> | void
}

interface NuxtAppStub {
  static: {
    data: Record<string, unknown>
  }
}

function injectNuxt({ navigation, loadNavigation }: { navigation: NavRef, loadNavigation: LoadNavigationFn }): NuxtAppStub {
  injectMock.mockImplementation((key: string) => {
    if (key === 'navigation')
      return navigation
    if (key === 'loadNavigation')
      return loadNavigation
    return undefined
  })
  return { static: { data: {} } }
}

/**
 * Builds the @nuxt/content navigation tree shape that app.vue stores in the
 * injected `navigation` ref, plus the flat content rows behind it.
 */
function makeNavigation() {
  const root: NavNode = { title: 'docs', path: '/', children: [] }
  const head: NavNode = { title: 'Head', path: '/docs/head', children: [] }
  const gettingStarted: NavNode = { title: 'Getting Started', path: '/docs/head/getting-started', page: false, children: [] }
  const overview: NavNode = { title: 'Overview', path: '/docs/head/getting-started/overview' }
  const installation: NavNode = { title: 'Installation', path: '/docs/head/getting-started/installation' }
  const api: NavNode = { title: 'API', path: '/docs/head/api', page: false, children: [] }
  const useHead: NavNode = { title: 'useHead()', path: '/docs/head/api/use-head' }
  gettingStarted.children.push(overview, installation)
  api.children.push(useHead)
  head.children.push(gettingStarted, api)
  root.children.push(head)

  const rows: ContentRow[] = [
    { id: 'overview', path: overview.path, title: overview.title, description: 'desc overview' },
    { id: 'installation', path: installation.path, title: installation.title, description: 'desc installation' },
    { id: 'use-head', path: useHead.path, title: useHead.title, description: 'desc use-head' },
  ]
  return { tree: root, rows }
}

function stubQueryCollectionPage(page: { path: string, title: string, body: { value: string } }) {
  queryCollectionMock.mockImplementation(() => ({
    path: (path: string) => ({
      first: async () => (path === page.path ? page : null),
    }),
    where: (field: string, op: string, values: string[]) => ({
      select: (...fields: string[]) => ({
        all: async () => {
          expect(field).toBe('path')
          expect(op).toBe('IN')
          expect(fields).toEqual(['path', 'title', 'description'])
          return makeNavigation().rows.filter(r => values.includes(r.path))
        },
      }),
    }),
  }))
}

function countNavigationListings() {
  return navigationListingCalls.length + surroundingsCalls.length
}

beforeEach(() => {
  vi.clearAllMocks()
  navigationListingCalls.length = 0
  surroundingsCalls.length = 0
  navigationRef.value = null
  nuxtAppStaticData = {}
  currentRoutePath = '/docs/head/getting-started/overview'

  queryCollectionNavigationMock.mockImplementation(async (collection: string, fields: string[]) => {
    navigationListingCalls.push([collection, ...fields])
    const { tree } = makeNavigation()
    return [tree]
  })
  stubQueryCollectionPage({ path: '/docs/head/getting-started/overview', title: 'Overview', body: { value: 'content' } })

  useAsyncDataMock.mockImplementation(async (_key: string, handler: () => Promise<unknown>) => {
    const data = await handler()
    return { data: { value: data }, error: { value: null } }
  })

  // The @nuxt/content runtime implements queryCollectionItemSurroundings by
  // calling generateNavigationTree itself, emitting a second full collection
  // listing per render (dist/runtime/internal/surround.js).
  queryCollectionItemSurroundingsMock.mockImplementation(async (collection: string, path: string) => {
    surroundingsCalls.push({ collection, path })
    await queryCollectionNavigationMock(collection, ['title'])
    return [null, { path: '/docs/head/getting-started/installation', title: 'Installation', description: 'desc installation' }]
  })
})

describe('useCurrentDocPage SSR render queries', () => {
  it('issues exactly one navigation listing per SSR render', async () => {
    // app.vue provides the navigation ref before loading it.
    const loadNavigation = vi.fn(async () => {
      const [tree] = await queryCollectionNavigationMock('docsUnhead', ['new', 'deprecated'])
      navigationRef.value = tree.children || []
    })

    injectNuxt({ navigation: navigationRef, loadNavigation })

    const { page, surround } = await useCurrentDocPage()

    expect(page.value.title).toBe('Overview')
    expect(countNavigationListings()).toBe(1)
    expect((surround.value || [])[0]?.path).toBe('/docs/head/getting-started/installation')
    expect((surround.value || [])[0]?.title).toBe('Installation')
    expect((surround.value || [])[0]?.description).toBe('desc installation')
    expect(surroundingsCalls).toEqual([])
  })

  it('carries only a predecessor link on the last docs page', async () => {
    currentRoutePath = '/docs/head/api/use-head'
    stubQueryCollectionPage({ path: '/docs/head/api/use-head', title: 'useHead()', body: { value: 'content' } })

    const loadNavigation = vi.fn(async () => {
      const [tree] = await queryCollectionNavigationMock('docsUnhead', ['new', 'deprecated'])
      navigationRef.value = tree.children || []
    })

    injectNuxt({ navigation: navigationRef, loadNavigation })

    const { surround } = await useCurrentDocPage()

    // The last page carries only its predecessor.
    expect(surround.value?.map(item => item.path)).toEqual(['/docs/head/getting-started/installation'])
    expect(surround.value?.[0]?.description).toBe('desc installation')
    expect(countNavigationListings()).toBe(1)
    expect(surroundingsCalls).toEqual([])
  })
})
