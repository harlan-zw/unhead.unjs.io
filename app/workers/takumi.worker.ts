/* eslint-disable no-restricted-globals */
import init, { Renderer } from '@takumi-rs/wasm'
import wasmUrl from '@takumi-rs/wasm/takumi_wasm_bg.wasm?url'
import { parseOgImageJsx } from './parse-og-image-jsx'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const IMAGE_TIMEOUT_MS = 10_000
let rendererPromise: Promise<Renderer> | null = null

async function readResponseBytes(response: Response, limit: number): Promise<Uint8Array> {
  const declaredLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > limit)
    throw new Error(`Image exceeds the ${Math.round(limit / 1024 / 1024)} MB limit`)

  if (!response.body) {
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (bytes.byteLength > limit)
      throw new Error(`Image exceeds the ${Math.round(limit / 1024 / 1024)} MB limit`)
    return bytes
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done)
        break
      length += value.byteLength
      if (length > limit)
        throw new Error(`Image exceeds the ${Math.round(limit / 1024 / 1024)} MB limit`)
      chunks.push(value)
    }
  }
  finally {
    await reader.cancel().catch((error) => {
      // Cancellation can race with a stream that has already closed.
      void error
    })
  }

  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return bytes
}

async function getRenderer(): Promise<Renderer> {
  rendererPromise ||= (async () => {
    await init({ module_or_path: wasmUrl })
    const renderer = new Renderer()
    const fontResponse = await fetch('/fonts/HubotSans-Regular.ttf', { credentials: 'omit' })
    if (!fontResponse.ok)
      throw new Error(`Font request failed with ${fontResponse.status}`)
    renderer.registerFont({
      name: 'Hubot Sans',
      data: await readResponseBytes(fontResponse, MAX_IMAGE_BYTES),
    })
    return renderer
  })().catch((error) => {
    rendererPromise = null
    throw error
  })

  return rendererPromise
}

self.onmessage = async (event) => {
  const { type, id, code, options } = event.data

  if (type === 'init') {
    try {
      await getRenderer()
      self.postMessage({ type: 'ready' })
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize renderer'
      console.error('Worker: Failed to initialize renderer', error)
      self.postMessage({ type: 'init-error', error: message })
    }
    return
  }

  if (type === 'render-request') {
    try {
      const renderer = await getRenderer()
      const vnode = parseOgImageJsx(code)

      // Transform VNode to Takumi format
      function toTakumiNode(node: any, inheritedStyle: any = {}): any {
        if (node === null || node === undefined)
          return null

        if (typeof node === 'boolean')
          return null

        if (typeof node === 'string' || typeof node === 'number') {
          return {
            type: 'text',
            text: String(node),
            style: { ...inheritedStyle },
          }
        }

        if (Array.isArray(node)) {
          if (node.length === 1)
            return toTakumiNode(node[0], inheritedStyle)
          return {
            type: 'container',
            style: { display: 'flex', flexDirection: 'row', ...inheritedStyle },
            children: node.map(n => toTakumiNode(n, inheritedStyle)).filter(Boolean),
          }
        }

        const { type, props } = node

        // Extract style from props to merge with inherited
        const style = props.style || {}

        // properties that cascade to text nodes
        const cascadingProps = [
          'color',
          'fontSize',
          'fontWeight',
          'fontFamily',
          'textAlign',
          'lineHeight',
          'letterSpacing',
        ]

        const nextInheritedStyle = { ...inheritedStyle }
        cascadingProps.forEach((prop) => {
          if (style[prop]) {
            nextInheritedStyle[prop] = style[prop]
          }
        })

        // Handle Fragment
        if (type === 'symbol-fragment') {
          const children = Array.isArray(props.children) ? props.children : [props.children]
          return {
            type: 'container',
            style: { display: 'flex', flexDirection: 'column', width: '100%', height: '100%', ...style },
            children: children.map((n: any) => toTakumiNode(n, nextInheritedStyle)).filter(Boolean),
          }
        }

        let newType = 'container'
        if (type === 'img' || type === 'image') {
          newType = 'image'
        }

        const children = props.children
          ? (Array.isArray(props.children) ? props.children : [props.children])
          : []

        const mappedChildren = children.flat().map((n: any) => toTakumiNode(n, nextInheritedStyle)).filter(Boolean)

        // Construct flattened node
        const takumiNode: any = {
          type: newType,
          style: { ...style }, // Ensure style is copied
        }

        if (mappedChildren.length > 0) {
          takumiNode.children = mappedChildren
        }

        // Handle specific props that should be top-level
        if (newType === 'image' && props.src) {
          takumiNode.src = props.src
        }

        // Add other props? Takumi might ignore them, but safe to exclude usually.
        // If there are other layout props like 'width', 'height' on the node directly, they are usually in style.

        return takumiNode
      }

      const takumiNode = toTakumiNode(vnode)

      // Process images: fetch and convert to base64
      async function processImages(node: any) {
        if (!node)
          return

        if (node.type === 'image' && node.src && node.src.startsWith('http')) {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS)
          try {
            const imageUrl = new URL(node.src)
            if (!['http:', 'https:'].includes(imageUrl.protocol))
              throw new Error('Unsupported image URL protocol')

            const res = await fetch(imageUrl, {
              credentials: 'omit',
              mode: 'cors',
              referrerPolicy: 'no-referrer',
              signal: controller.signal,
            })
            if (res.ok) {
              const mimeType = res.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase()
              if (!mimeType?.startsWith('image/'))
                throw new Error('Remote URL did not return an image')
              const buffer = await readResponseBytes(res, MAX_IMAGE_BYTES)
              const base64 = btoa(
                buffer.reduce((data, byte) => data + String.fromCharCode(byte), ''),
              )
              node.src = `data:${mimeType};base64,${base64}`
            }
            else {
              console.error('Worker: Failed to fetch image', res.status)
            }
          }
          catch (e) {
            console.error('Worker: Error fetching image', e)
          }
          finally {
            clearTimeout(timeout)
          }
        }

        if (node.children) {
          await Promise.all(node.children.map((child: any) => processImages(child)))
        }
      }

      await processImages(takumiNode)

      const dataUrl = await renderer.renderAsDataUrl(takumiNode, {
        width: options.width || 1200,
        height: options.height || 630,
        format: 'png',
      })

      self.postMessage({
        type: 'render-result',
        id,
        result: {
          success: true,
          dataUrl,
        },
      })
    }
    catch (err: unknown) {
      console.error('Worker: Render error', err)
      self.postMessage({
        type: 'render-result',
        id,
        result: {
          success: false,
          error: err instanceof Error ? err.message : 'Rendering failed',
        },
      })
    }
  }
}
