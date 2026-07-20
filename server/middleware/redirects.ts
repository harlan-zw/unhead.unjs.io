export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // TypeScript no longer has a framework-authored upgrade page at this old
  // route. Other frameworks do, so they must be allowed through and indexed.
  const match = path.match(/^\/docs\/([\w-]+)\/head\/guides\/get-started\/migration\/?$/)
  if (match?.[1] === 'typescript') {
    return sendRedirect(event, `/docs/migration-guide/v3${url.search}`, 301)
  }

  // Consolidate the duplicate trailing-slash URLs visible in Search Console.
  if (path.startsWith('/docs/') && path.endsWith('/')) {
    return sendRedirect(event, `${path.slice(0, -1)}${url.search}`, 301)
  }
})
