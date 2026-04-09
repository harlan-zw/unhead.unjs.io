import type { ContentNavigationItem } from '@nuxt/content'
import { titleCase } from 'scule'
import {
  getLastPathSegment,
  getPathSection,
  getPathSegments,
  getPathSubSection,
  getPathWithoutFramework,
} from '~~/utils/urls'
import { useFrameworkSelector } from '~/composables/frameworkSelector'

export interface NavItem extends ContentNavigationItem {
  html?: boolean
  deprecated?: boolean
  tag?: string
  icon?: string
  new?: boolean
  children?: NavItem[]
}

export interface Stats {
  fetchedAt: number
  modules: any[]
  versions: string[]
  stars: { stars: number }
  commitCount: number
  issuesClosed: number
  releases: any[]
  contributors: any[]
}

export async function useStats(options?: { lazy?: boolean, server?: boolean }) {
  const { data: stats } = await useFetch<Stats>('/api/stats.json', {
    key: 'stats',
    ...options,
  })
  return stats
}

export async function useCurrentDocPage() {
  const nuxtApp = useNuxtApp()
  const route = useRouter().currentRoute.value
  if (nuxtApp.static.data.docsCurrent?.path === route.path) {
    return await nuxtApp.static.data.docsCurrent.promise
  }

  const contentPath = route.path
  const fallbackPath = getPathWithoutFramework(route.path)
  const isV2 = route.path.startsWith('/docs/v2')
  const collection = isV2 ? 'docsUnheadV2' : 'docsUnhead'

  const { isBot: isBotRef } = useBotDetection()

  const q = queryCollection(collection).path(contentPath).first()
  const p = (async () => {
    let pageData = await q
    if (!pageData) {
      pageData = await queryCollection(collection).path(fallbackPath).first()
    }

    if (!pageData?.body?.value) {
      throw createError({ statusCode: 404, statusMessage: `Page not found: ${route.path}`, fatal: true })
    }

    const surroundData = await queryCollectionItemSurroundings(collection, pageData.path, {
      fields: ['title', 'description', 'path'],
    })

    const page = ref(pageData)
    const surround = ref(surroundData.filter(m => m).map(m => ({
      ...m,
      _path: m.path,
    })))

    // Skip commit metadata for bots, not needed for indexing
    const filePath = pageData.id.split('/').slice(2).join('/')
    const payloadKey = `commit-${filePath}`
    const cachedData = !import.meta.server ? nuxtApp.payload.data[payloadKey] : undefined
    const lastCommit = ref(cachedData ?? null)
    if (isBotRef.value) {
      // no-op
    }
    else if (import.meta.server) {
      lastCommit.value = await $fetch(`/api/github/unjs@unhead/last-file-commit?file=docs/${filePath}`).catch(() => null)
      nuxtApp.payload.data[payloadKey] = lastCommit.value
    }
    else if (!cachedData) {
      // client-side nav without cache, fetch lazily so we don't block navigation
      $fetch(`/api/github/unjs@unhead/last-file-commit?file=docs/${filePath}`)
        .then((data) => { lastCommit.value = data })
        .catch(() => null)
    }

    return {
      page,
      surround,
      lastCommit,
      isV2,
    }
  })()

  nuxtApp.static.data.docsCurrent = { promise: p, path: toRaw(route.path) }
  return p
}

function mapPath(data) {
  return [...data.map((item) => {
    if (item.children?.length && !item.page) {
      item.title = titleCase(item.title)
      item.children = mapPath(item.children)
    }
    return {
      ...item,
      children: item.children ? [...item.children] : undefined,
      _path: item.path,
    }
  })]
}

export function enhanceTitlesAndIcons(n: NavItem) {
  if (n.children) {
    n.children = n.children.map(enhanceTitlesAndIcons)
  }
  if (n.title.endsWith('()')) {
    n.html = true
    const [fnName] = n.title.split('()')
    n.title = `<code class="language-ts shiki shiki-themes github-light github-light material-theme-palenight" language="ts"><span style="--shiki-light: #6F42C1; --shiki-default: #6F42C1; --shiki-dark: #82AAFF;">${fnName}</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #BABED8;">()</span></code>`
  }
  else if (n.title.startsWith('<') && n.title.endsWith('>') && !n.title.includes('<code')) {
    const inner = n.title.slice(1, -1)
    n.html = true
    n.title = `<code class="language-ts shiki shiki-themes github-light github-light material-theme-palenight" language="ts"><span class="line" line="2"><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;">  &lt;</span><span style="--shiki-light: #22863A; --shiki-default: #22863A; --shiki-dark: #F07178;">${inner}</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;"> /&gt;
</span></span></code>`
  }
  return n
}

export function useDocsNav(all: boolean = false) {
  const { selectedFramework } = useFrameworkSelector()
  const route = useRoute()
  const navigation = inject<Ref<NavItem[]>>('navigation', ref([]))
  return computed(() => {
    const _nav = toValue(navigation)
    const framework = selectedFramework.value.slug
    const nav = mapPath(_nav)

    // For section matching, use the actual path (with v2 prefix if on v2)
    const pathWithoutFramework = getPathWithoutFramework(route.path)
    const isV2 = route.path.startsWith('/docs/v2')
    const versionPrefix = isV2 ? '/docs/v2' : '/docs'
    // v2 needs 3 segments (/docs/v2/head), v3 needs 2 (/docs/head)
    const sectionPath = isV2 ? getPathSegments(pathWithoutFramework, 3) : getPathSection(pathWithoutFramework)
    // For v2, nav is nested under /docs/v2 parent, so look in children
    const sectionDocs = isV2
      ? nav.find(n => n.path === '/docs/v2')?.children?.find(c => c.path?.startsWith(sectionPath))
      : nav.find(n => n.path?.startsWith(sectionPath))
    const frameworkDocs = nav.find(n => n.path.startsWith(`/docs/${framework}`))?.children?.find(n => n.path.startsWith(getPathSection(route.path)))?.children?.find(n => n.path === (getPathSegments(route.path, 4)))?.children.map((c) => {
      return {
        ...c,
        icon: selectedFramework.value?.icon,
      }
    })

    const subSectionDocs = sectionDocs?.children?.find(n => n.path === (isV2 ? getPathSegments(pathWithoutFramework, 4) : getPathSubSection(pathWithoutFramework)))?.children

    // For v2, sections are nested under /docs/v2 parent
    const allSections = isV2
      ? (nav.find(n => n.path === '/docs/v2')?.children || []).filter(n => n.path?.startsWith(`${versionPrefix}/head`) || n.path?.startsWith(`${versionPrefix}/schema-org`))
      : nav.filter(n => n.path?.startsWith(`${versionPrefix}/head`) || n.path?.startsWith(`${versionPrefix}/schema-org`))
    const bottom = (all ? [...allSections] : [...(subSectionDocs || [])])
      .map((section) => {
        return {
          ...section,
          children: [
            ...section.children ?? [],
            ...((frameworkDocs || []).find((s2) => {
              return getPathWithoutFramework(s2?.path) === section.path
            })?.children || []).map((c) => {
              return {
                ...c,
                icon: selectedFramework.value?.icon,
              }
            }),
            // sort by stem
          ].toSorted((a, b) => {
            const aIsFramework = a.icon ? 1 : 0
            const bIsFramework = b.icon ? 1 : 0
            if (aIsFramework !== bIsFramework)
              return aIsFramework - bIsFramework
            return getLastPathSegment(a.stem).localeCompare(getLastPathSegment(b.stem))
          }),
        }
      })
      .map(enhanceTitlesAndIcons)
      .map((n) => {
        n.children = n.children?.map((c) => {
          let path = c.path
          const frameworkPrefix = isV2 ? `/docs/v2/${framework}` : `/docs/${framework}`
          if (!path.startsWith(frameworkPrefix)) {
            // For v2: /docs/v2/head/... → slice(3) to get head/...
            // For v3: /docs/head/... → slice(2) to get head/...
            const sliceIndex = isV2 ? 3 : 2
            const subPath = path.split('/').slice(sliceIndex).join('/')
            path = `${frameworkPrefix}/${subPath}`
          }
          return {
            ...c,
            path,
          }
        })
        return n
      })
    const navFlat = nav.flatMap((n) => {
      if (n.children?.length) {
        return n.children.flatMap(c => c.children?.length ? c.children : c)
      }
      return n
    }).flatMap((n) => {
      if (n.children?.length) {
        return n.children.flatMap(c => c.children?.length ? c.children : c)
      }
      return n
    })
    // Extract releases and migration guide sections, prefixed with framework
    const frameworkPrefix = isV2 ? `/docs/v2/${framework}` : `/docs/${framework}`
    const contentSections = nav
      .filter(n =>
        n.path?.startsWith(`${versionPrefix}/releases`) || n.path?.startsWith(`${versionPrefix}/migration-guide`),
      )
      .toSorted((a, b) => {
        // releases before migration-guide
        const aIsReleases = a.path?.includes('/releases') ? 0 : 1
        const bIsReleases = b.path?.includes('/releases') ? 0 : 1
        return aIsReleases - bIsReleases
      })
      .map(section => ({
        ...section,
        path: `${frameworkPrefix}/${section.path.split('/').slice(2).join('/')}`,
        children: section.children?.map(c => ({
          ...c,
          path: `${frameworkPrefix}/${c.path.split('/').slice(2).join('/')}`,
        })),
      }))
    // Top horizontal sub-section nav: always show head's User Guides + API + Releases,
    // independent of current section (so it stays visible on releases/migration pages too)
    const headSectionDocs = isV2
      ? nav.find(n => n.path === '/docs/v2')?.children?.find(c => c.path === `${versionPrefix}/head`)
      : nav.find(n => n.path === `${versionPrefix}/head`)
    const firstSubSectionLinks = [
      ...(headSectionDocs?.children || []).filter(n =>
        n.path?.includes('/head/') || n.path?.endsWith('/head'),
      ),
      ...contentSections.filter(n => n.path?.includes('/releases')),
    ]
    return { navFlat, bottom, firstSubSectionLinks, contentSections }
  })
}
