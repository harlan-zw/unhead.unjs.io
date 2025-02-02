import type { NavItem } from '@nuxt/content'
import { titleCase } from 'scule'
import { useFrameworkSelector } from '~/composables/frameworkSelector'

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
function transformAsTopNav(tree: NavItem) {
  const items = tree.filter(n => !n.children)
  // push all children
  tree.forEach((n) => {
    if (n.children) {
      items.push(...transformAsTopNav(n.children).filter(n => n.path.split('/').length === 4))
    }
  })
  return items.map(enhanceTitlesAndIcons)
}

export function enhanceTitlesAndIcons(n: NavItem) {
  if (n.children) {
    n.children = n.children.map(enhanceTitlesAndIcons)
  }
  if (n.path.endsWith('installation')) {
    n.icon = 'i-ph-rocket-launch-duotone'
  }
  if (n.path.endsWith('migration')) {
    n.icon = 'i-ph-arrow-circle-up-duotone'
  }
  else if (n.path.endsWith('troubleshooting')) {
    n.icon = 'i-ph-hammer-duotone'
  }
  else if (n.path.endsWith('introduction')) {
    n.icon = 'i-ph-text-align-center-duotone'
  }
  else if (n.path.endsWith('/api')) {
    n.title = 'API'
  }
  else if (n.path.includes('/releases')) {
    n.icon = 'i-noto-sparkles'
    n.title = 'Releases'
  }
  else if (n.path.includes('/migration-guide')) {
    n.icon = 'i-noto-globe-with-meridians'
    n.title = 'Migration Guides'
  }
  else if (n.path.endsWith('/guides')) {
    n.icon = 'i-carbon-notebook'
    n.title = 'Guides'
  }
  else if (n.path.endsWith('/recipes')) {
    n.icon = 'i-carbon-copy-file'
    n.title = 'Recipes'
  }
  else if (n.path.endsWith('/build-plugins')) {
    // vite
    n.icon = 'i-vscode-icons-file-type-vite'
  }
  else if (n.path.includes('/api/config')) {
    n.icon = 'i-vscode-icons-file-type-typescript-official'
    n.title = 'nuxt.config.ts'
  }
  else if (n.path.includes('/api/schema')) {
    n.icon = 'i-vscode-icons-file-type-typescript-official'
    n.title = 'runtime/types.ts'
  }
  else if (n.title.endsWith('()')) {
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

export function useDocsNav() {
  const { selectedFramework } = useFrameworkSelector()
  const route = useRoute()
  const navigation = inject('navigation')
  return computed(() => {
    const _nav = Array.from(toValue(navigation))
    let lang = selectedFramework.value.slug
    const nav = mapPath(_nav)

    const maybeSubModulePath = route.path.split('/')[2]
    let isSubModule = false
    let topNavItems = []
    if (['schema-org', 'scripts'].includes(maybeSubModulePath)) {
      const children = Array.from(nav)
        .find(n => n.path.endsWith(maybeSubModulePath))
        ?.children
      topNavItems = children.filter(n => n.path.endsWith(lang) || n.path.endsWith('introduction') || n.path.endsWith('troubleshooting'))
        .flatMap(n => n.children ? n.children : n)
      isSubModule = true
      lang = maybeSubModulePath
    }
    else {
      topNavItems = Array.from(nav)
        .filter(n => n.path.endsWith(lang) || n.path.startsWith('/docs/introduction') || n.path.startsWith('/docs/troubleshooting') || n.path.startsWith('/docs/migration'))
    }

    const top = transformAsTopNav(topNavItems)
      // migration should always be last, introduction should always be first
      // troubleshooting should be 2nd last
      .sort((a, b) => {
        if (a.path.endsWith('migration')) return 1
        if (b.path.endsWith('migration')) return -1
        if (a.path.endsWith('introduction')) return -1
        if (b.path.endsWith('introduction')) return 1
        if (a.path.endsWith('troubleshooting')) return 1
        if (b.path.endsWith('troubleshooting')) return -1
        return
      })

    const mergedItems = ([...nav])
      .filter(n => n.path.endsWith(lang) && n.children?.length)
      .flatMap(n => n.children)
      .filter(n => n.children?.length)
      .map((n) => {
        n.children = n.children.map((c) => {
          return {
            ...c,
            icon: frameworks.find(f => f.slug === lang)?.icon,
            // tag: lang
          }
        })
        return n
      })

    const bottom = isSubModule
      ? [
          ...nav.find(n => n.path.endsWith(lang)).children.filter(n => ['schema', 'guides', 'recipes', 'api'].includes(n.path.split('/').pop())),
        ].map(enhanceTitlesAndIcons)
      : [
          ...([...nav])
            .filter(n => (n.path.startsWith('/docs/guides')) || n.path.startsWith(`/docs/${lang}`)),
          ...([...nav]
            .filter(n => n.path.startsWith('/docs/build-plugins') || n.path.startsWith(`/docs/recipes`) || n.path.startsWith(`/docs/api`))),
          ...mergedItems,
        ]
        // merge all /guide paths
          .reduce((acc, n) => {
            const validPrefixes = ['/guides', '/build-plugins', '/recipes', '/api']
            for (const prefix of validPrefixes) {
              if (n.path.includes(prefix)) {
                const idx = acc.findIndex(a => a.path.includes(prefix))
                if (idx > -1) {
                  acc[idx].children.unshift(...n.children)
                }
                else {
                  acc.push(n)
                }
              }
            }
            return acc
          }, [])
          .map(enhanceTitlesAndIcons)
    const navFlat = nav.flatMap((n) => {
      if (n.children?.length) {
        return n.children
      }
      return n
    })
    return { navFlat, top, bottom }
  })
}
