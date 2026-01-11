import type { NavItem } from '@nuxt/content'
import { titleCase } from 'scule'
import {
  getLastPathSegment,
  getPathSection,
  getPathSegments,
  getPathSubSection,
  getPathWithoutFramework,
} from '~~/utils/urls'
import { useFrameworkSelector } from '~/composables/frameworkSelector'

export async function useStats() {
  const { data: stats } = await useFetch('/api/stats.json', {
    key: 'stats',
  })
  return stats || {}
}

export async function useCurrentDocPage() {
  const nuxtApp = useNuxtApp()
  const route = useRouter().currentRoute.value
  if (nuxtApp.static.data.docsCurrent?.path === route.path) {
    return await nuxtApp.static.data.docsCurrent.promise
  }

  const contentPath = route.path
  const fallbackPath = getPathWithoutFramework(route.path)

  const p = queryCollection('docsUnhead').path(contentPath).first().then(pageData => pageData || queryCollection('docsUnhead').path(fallbackPath).first()).then(async (pageData) => {
    if (!pageData?.body?.value) {
      throw createError({ statusCode: 404, statusMessage: `Page not found: ${route.path}`, fatal: true })
    }

    const surroundData = await queryCollectionItemSurroundings('docsUnhead', pageData.path, {
      fields: ['title', 'description', 'path'],
    })

    const page = ref(pageData)
    const surround = ref(surroundData.filter(m => m).map(m => ({
      ...m,
      _path: m.path,
    })))

    return {
      page,
      surround,
    }
  })

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
  const navigation = inject('navigation')
  return computed(() => {
    const _nav = Array.from(toValue(navigation))
    const framework = selectedFramework.value.slug
    const nav = mapPath(_nav)

    const sectionDocs = nav.find(n => n.path.startsWith(getPathSection(getPathWithoutFramework(route.path))))
    const frameworkDocs = nav.find(n => n.path.startsWith(`/docs/${framework}`))?.children?.find(n => n.path.startsWith(getPathSection(route.path)))?.children?.find(n => n.path === (getPathSegments(route.path, 4)))?.children.map((c) => {
      return {
        ...c,
        icon: selectedFramework.value?.icon,
      }
    })

    const subSectionDocs = sectionDocs?.children.find(n => n.path === (getPathSubSection(getPathWithoutFramework(route.path))))?.children

    const bottom = (all ? [...nav.filter(n => n.path.startsWith('/docs/head') || n.path.startsWith('/docs/schema-org'))] : [...(subSectionDocs || [])])
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
          ].toSorted((a, b) => getLastPathSegment(a.stem).localeCompare(getLastPathSegment(b.stem))),
        }
      })
      .map(enhanceTitlesAndIcons)
      .map((n) => {
        n.children = n.children?.map((c) => {
          let path = c.path
          if (!path.startsWith(`/docs/${framework}`)) {
            const subPath = path.split('/').slice(2).join('/')
            path = `/docs/${framework}/${subPath}`
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
    return { navFlat, bottom, firstSubSectionLinks: sectionDocs?.children || [] }
  })
}
