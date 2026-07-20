import { computed, onMounted, onUnmounted, ref } from 'vue'

interface RenderOptions {
  format?: 'png'
  height?: number
  width?: number
}

interface PendingRender {
  reject: (error: Error) => void
  resolve: (value: string) => void
  timeout: ReturnType<typeof setTimeout>
}

const RENDER_TIMEOUT_MS = 20_000

export function useTakumiRenderer() {
  const isReady = ref(false)
  const pendingCount = ref(0)
  const isRendering = computed(() => pendingCount.value > 0)
  const result = ref<string | null>(null)
  const error = ref<string | null>(null)

  let worker: Worker | null = null
  let nextId = 1
  let latestRequestId = 0
  let unmounted = false
  const pendingRequests = new Map<number, PendingRender>()

  function rejectPending(message: string) {
    const pendingError = new Error(message)
    for (const request of pendingRequests.values()) {
      clearTimeout(request.timeout)
      request.reject(pendingError)
    }
    pendingRequests.clear()
    pendingCount.value = 0
  }

  function startWorker() {
    worker?.terminate()
    isReady.value = false
    worker = new Worker(new URL('../workers/takumi.worker.ts', import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (event) => {
      const { type, id, result: operationResult } = event.data

      if (type === 'ready') {
        isReady.value = true
        return
      }

      if (type === 'init-error') {
        error.value = event.data.error || 'Renderer initialization failed'
        rejectPending(error.value!)
        return
      }

      if (type !== 'render-result')
        return

      const request = pendingRequests.get(id)
      if (!request)
        return

      clearTimeout(request.timeout)
      pendingRequests.delete(id)
      pendingCount.value = Math.max(0, pendingCount.value - 1)

      if (operationResult.success) {
        if (id === latestRequestId) {
          result.value = operationResult.dataUrl
          error.value = null
        }
        request.resolve(operationResult.dataUrl)
      }
      else {
        if (id === latestRequestId)
          error.value = operationResult.error
        request.reject(new Error(operationResult.error))
      }
    }

    worker.onerror = (workerError) => {
      error.value = workerError.message || 'Renderer worker failed'
      rejectPending(error.value)
    }

    worker.postMessage({ type: 'init' })
  }

  onMounted(() => {
    startWorker()
  })

  onUnmounted(() => {
    unmounted = true
    rejectPending('Renderer was disposed')
    worker?.terminate()
    worker = null
  })

  const render = (code: string, options: RenderOptions = {}): Promise<string> => {
    if (!worker || !isReady.value)
      return Promise.reject(new Error('Worker not ready'))

    error.value = null

    return new Promise<string>((resolve, reject) => {
      const id = nextId++
      latestRequestId = id
      pendingCount.value += 1
      const timeout = setTimeout(() => {
        if (!pendingRequests.has(id))
          return
        error.value = 'Rendering timed out'
        rejectPending(error.value)
        if (!unmounted)
          startWorker()
      }, RENDER_TIMEOUT_MS)
      pendingRequests.set(id, { resolve, reject, timeout })
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
