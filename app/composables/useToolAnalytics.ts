type ToolName = 'meta-tag-generator' | 'schema-generator'
type ToolAction = 'view' | 'use' | 'copy' | 'reset' | 'preset'

export function useToolAnalytics(tool: ToolName) {
  const tracked = ref(false)

  function track(action: ToolAction, label?: string) {
    // Fire and forget - don't block UI
    $fetch('/api/tools/track', {
      method: 'POST',
      body: { tool, action, label },
    }).catch(() => {}) // Silently fail
  }

  // Track page view once
  function trackView() {
    if (tracked.value)
      return
    tracked.value = true
    track('view')
  }

  return {
    track,
    trackView,
  }
}
