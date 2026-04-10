const frameworks = ['typescript', 'vue', 'react', 'svelte', 'solid-js', 'angular', 'nuxt']

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  // /docs/:framework/head/guides/get-started/migration -> /docs/:framework/migration-guide/v3
  const match = path.match(/^\/docs\/([\w-]+)\/head\/guides\/get-started\/migration\/?$/)
  if (match && frameworks.includes(match[1])) {
    return sendRedirect(event, `/docs/${match[1]}/migration-guide/v3`, 301)
  }
})
