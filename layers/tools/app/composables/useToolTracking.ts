type ToolAction = 'view' | 'use' | 'copy' | 'reset' | 'preset' | 'download'

export function useToolTracking(toolId: string) {
  const hasTrackedView = ref(false)
  const hasTrackedUse = ref(false)

  function track(action: ToolAction, label?: string) {
    $fetch('/api/tools/track', {
      method: 'POST',
      body: { tool: toolId, action, label },
    }).catch(() => {})
  }

  function trackView() {
    if (hasTrackedView.value)
      return
    hasTrackedView.value = true
    track('view')
  }

  function trackUse() {
    if (hasTrackedUse.value)
      return
    hasTrackedUse.value = true
    track('use')
  }

  function resetUseTracking() {
    hasTrackedUse.value = false
  }

  onMounted(trackView)

  return { track, trackView, trackUse, resetUseTracking }
}
