import { onMounted, onUnmounted, ref } from 'vue'

export function useTakumiRenderer() {
  const isReady = ref(false)
  const isRendering = ref(false)
  const result = ref<string | null>(null)
  const error = ref<string | null>(null)

  let worker: Worker | null = null
  let nextId = 1
  const pendingRequests = new Map<number, { resolve: (val: any) => void, reject: (err: any) => void }>()

  onMounted(() => {
    // Vite worker import
    worker = new Worker(new URL('../workers/takumi.worker.ts', import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (event) => {
      const { type, id, result: opResult } = event.data

      if (type === 'ready') {
        console.log('Worker: Ready')
        isReady.value = true
        return
      }

      if (type === 'render-result') {
        isRendering.value = false
        const req = pendingRequests.get(id)
        if (req) {
          if (opResult.success) {
            result.value = opResult.dataUrl
            req.resolve(opResult.dataUrl)
          }
          else {
            error.value = opResult.error
            req.reject(new Error(opResult.error))
          }
          pendingRequests.delete(id)
        }
      }
    }

    worker.postMessage({ type: 'init' })
  })

  onUnmounted(() => {
    worker?.terminate()
  })

  const render = (code: string, options: any = {}) => {
    if (!worker || !isReady.value)
      return Promise.reject(new Error('Worker not ready'))

    isRendering.value = true
    error.value = null

    return new Promise((resolve, reject) => {
      const id = nextId++
      pendingRequests.set(id, { resolve, reject })
      worker?.postMessage({
        type: 'render-request',
        id,
        code,
        options,
      })
    })
  }

  return {
    isReady,
    isRendering,
    result,
    error,
    render,
  }
}
