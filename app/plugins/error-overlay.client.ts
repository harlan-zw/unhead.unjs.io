export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.dev)
    return

  const errors: string[] = []
  const warnings: string[] = []
  const seen = new Set<string>()

  const overlay = document.createElement('div')
  Object.assign(overlay.style, {
    position: 'fixed',
    bottom: '12px',
    right: '12px',
    zIndex: '99999',
    fontFamily: 'monospace',
    fontSize: '13px',
    cursor: 'pointer',
    userSelect: 'none',
    padding: '8px 14px',
    borderRadius: '20px',
    color: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    transition: 'background 0.2s',
  })

  const panel = document.createElement('div')
  Object.assign(panel.style, {
    position: 'fixed',
    bottom: '52px',
    right: '12px',
    zIndex: '99998',
    background: '#1a1a2e',
    color: '#e0e0e0',
    border: '1px solid #333',
    borderRadius: '8px',
    maxWidth: '600px',
    maxHeight: '400px',
    fontFamily: 'monospace',
    fontSize: '12px',
    display: 'none',
    flexDirection: 'column',
  })

  const toolbar = document.createElement('div')
  Object.assign(toolbar.style, {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: '1px solid #333',
    gap: '8px',
  })

  const title = document.createElement('span')
  title.style.fontWeight = 'bold'

  const btnGroup = document.createElement('div')
  Object.assign(btnGroup.style, { display: 'flex', gap: '6px' })

  function makeBtn(label: string, onClick: () => void) {
    const btn = document.createElement('button')
    btn.textContent = label
    Object.assign(btn.style, {
      background: '#333',
      color: '#e0e0e0',
      border: '1px solid #555',
      borderRadius: '4px',
      padding: '2px 8px',
      cursor: 'pointer',
      fontSize: '11px',
    })
    btn.addEventListener('click', onClick)
    return btn
  }

  const content = document.createElement('pre')
  Object.assign(content.style, {
    margin: '0',
    padding: '12px',
    overflow: 'auto',
    flex: '1',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  })

  panel.appendChild(toolbar)
  panel.appendChild(content)
  toolbar.appendChild(title)
  toolbar.appendChild(btnGroup)

  document.body.appendChild(overlay)
  document.body.appendChild(panel)

  const FRAMEWORK_COMPONENTS = new Set([
    'NuxtRoot',
    'App',
    'ConfigProvider',
    'TooltipProvider',
    'ToastProvider',
    'Toaster',
    'NuxtLayout',
    'NuxtLayoutProvider',
    'LayoutLoader',
    'AsyncComponentWrapper',
    'RouterView',
    'NuxtPage',
    'BaseTransition',
    'Transition',
    'RouteProvider',
  ])

  function relPath(file: string): string {
    return file.match(/site\/unhead\.unjs\.io\/(.+)/)?.[1] || file
  }

  // Walk the internal component tree via ComponentPublicInstance.$
  function componentTrace(instance: { $: { type?: any, parent?: any } } | null): string {
    if (!instance)
      return ''
    const entries: string[] = []
    let internal: any = instance.$
    while (internal) {
      const name = internal.type?.__name || internal.type?.name
      if (name && !FRAMEWORK_COMPONENTS.has(name)) {
        const file = internal.type?.__file
        entries.push(file ? `${name} (${relPath(file)})` : name)
      }
      internal = internal.parent
    }
    if (!entries.length)
      return ''
    return `  in: ${entries.slice(0, 4).join(' > ')}${entries.length > 4 ? ' > ...' : ''}`
  }

  // Extract the source file from a ComponentPublicInstance
  function sourceFile(instance: { $: { type?: any } } | null): string {
    const file = instance?.$?.type?.__file
    if (!file)
      return ''
    return `  file: ${relPath(file)}`
  }

  // For hydration mismatches, try to extract the DOM element context
  function hydrationContext(instance: { $: { type?: any, vnode?: any, subTree?: any } } | null): string {
    if (!instance)
      return ''
    const parts: string[] = []
    // Try to get the el from the vnode/subTree for DOM context
    const el = instance.$?.vnode?.el || instance.$?.subTree?.el
    if (el instanceof Element) {
      // Show the element tag, id, and first class for identification
      let selector = el.tagName.toLowerCase()
      if (el.id)
        selector += `#${el.id}`
      else if (el.className)
        selector += `.${el.className.split(' ')[0]}`
      parts.push(`  element: <${selector}>`)
      // Show a snippet of the element's outer HTML (first 120 chars)
      const html = el.outerHTML
      if (html)
        parts.push(`  html: ${html.slice(0, 120)}${html.length > 120 ? '...' : ''}`)
    }
    return parts.join('\n')
  }

  function addIssue(list: string[], msg: string) {
    if (seen.has(msg))
      return
    seen.add(msg)
    list.push(msg)
    render()
  }

  function formatForAgent(): string {
    const route = useRoute()
    const lines: string[] = []

    lines.push(`Fix the following client-side issues on this page.`)
    lines.push('')
    lines.push(`## Context`)
    lines.push(`- URL: ${window.location.origin}${route.fullPath}`)
    lines.push(`- Route name: ${String(route.name)}`)

    // Extract page component file from matched route
    const matched = route.matched.at(-1)
    const pageComponent = matched?.components?.default as any
    if (pageComponent?.__file) {
      const file = pageComponent.__file
      const rel = file.match(/site\/unhead\.unjs\.io\/(.+)/)?.[1] || file
      lines.push(`- Page component: ${rel}`)
    }

    // Collect all unique files referenced in issues for quick access
    const fileRefs = new Set<string>()
    for (const msg of [...errors, ...warnings]) {
      const fileMatch = msg.match(/file: (.+)/g)
      if (fileMatch)
        fileMatch.forEach(f => fileRefs.add(f.replace('file: ', '').trim()))
    }
    if (fileRefs.size) {
      lines.push(`- Files involved: ${[...fileRefs].join(', ')}`)
    }

    lines.push('')

    if (errors.length) {
      lines.push(`## Errors`)
      errors.forEach((msg, i) => {
        lines.push(`### ${i + 1}.`)
        lines.push(msg)
        lines.push('')
      })
    }
    if (warnings.length) {
      lines.push(`## Warnings`)
      warnings.forEach((msg, i) => {
        lines.push(`### ${i + 1}.`)
        lines.push(msg)
        lines.push('')
      })
    }

    if (!errors.length && !warnings.length) {
      lines.push('No issues detected.')
    }

    return lines.join('\n')
  }

  function copyToClipboard(text: string, btn: HTMLButtonElement) {
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.textContent
      btn.textContent = 'Copied!'
      setTimeout(() => btn.textContent = orig, 1500)
    })
  }

  btnGroup.appendChild(makeBtn('Copy', () => {
    copyToClipboard(formatForAgent(), btnGroup.children[0] as HTMLButtonElement)
  }))
  btnGroup.appendChild(makeBtn('Clear', () => {
    errors.length = 0
    warnings.length = 0
    seen.clear()
    render()
    panel.style.display = 'none'
  }))

  function render() {
    const e = errors.length
    const w = warnings.length
    const total = e + w

    overlay.style.background = total === 0 ? '#16a34a' : e > 0 ? '#dc2626' : '#ca8a04'

    const parts: string[] = []
    if (e > 0)
      parts.push(`${e} err`)
    if (w > 0)
      parts.push(`${w} warn`)
    overlay.textContent = parts.length ? parts.join(' | ') : '0 issues'

    if (panel.style.display !== 'none') {
      renderPanel()
    }
  }

  function renderPanel() {
    title.textContent = `Issues (${errors.length + warnings.length})`
    const lines: string[] = []
    for (const msg of errors) lines.push(`\u274C ${msg}`)
    for (const msg of warnings) lines.push(`\u26A0\uFE0F  ${msg}`)
    content.textContent = lines.length ? lines.join('\n\n') : 'No issues'
  }

  overlay.addEventListener('click', () => {
    if (panel.style.display === 'none') {
      renderPanel()
      panel.style.display = 'flex'
    }
    else {
      panel.style.display = 'none'
    }
  })

  // Vue warn handler: structured access to warning, instance, and trace
  nuxtApp.vueApp.config.warnHandler = (msg, instance, _trace) => {
    const cleaned = msg.trim()
    const parts = [cleaned]
    const inst = instance as any
    const file = sourceFile(inst)
    const trace = componentTrace(inst)
    if (file)
      parts.push(file)
    if (trace)
      parts.push(trace)
    // For hydration mismatches, add DOM element context
    if (cleaned.includes('Hydration')) {
      const ctx = hydrationContext(inst)
      if (ctx)
        parts.push(ctx)
    }
    addIssue(warnings, parts.join('\n'))
    console.warn(`[Vue warn]: ${parts.join(' | ')}`)
  }

  // Vue error handler: catch render/lifecycle errors
  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    const errMsg = err instanceof Error ? (err.stack || err.message) : String(err)
    const parts = [`${info}: ${errMsg}`]
    const inst = instance as any
    const file = sourceFile(inst)
    const trace = componentTrace(inst)
    if (file)
      parts.push(file)
    if (trace)
      parts.push(trace)
    addIssue(errors, parts.join('\n'))
    console.error(`[Vue error]: ${parts.join(' | ')}`)
  }

  // Intercept console.error for non-Vue errors (network, etc.)
  const origError = console.error
  console.error = (...args: unknown[]) => {
    // Skip if it looks like our own Vue error handler output
    if (typeof args[0] === 'string' && args[0].startsWith('[Vue error]:')) {
      origError.apply(console, args)
      return
    }
    const raw = args.map(a => typeof a === 'string' ? a : a instanceof Error ? (a.stack || a.message) : String(a)).join(' ')
    // Clean: strip Vue component tree traces from any source
    const cleaned = raw
      .replace(/\s*at <[A-Z][^>]*>\s*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    if (cleaned)
      addIssue(errors, cleaned)
    origError.apply(console, args)
  }

  // Note: we don't intercept console.warn since warnHandler covers Vue warnings.
  // Non-Vue console.warn messages are typically not actionable dev errors.

  window.addEventListener('error', (event) => {
    addIssue(errors, event.message || String(event.error))
  })

  window.addEventListener('unhandledrejection', (event) => {
    addIssue(errors, `Unhandled rejection: ${event.reason}`)
  })

  render()
})
