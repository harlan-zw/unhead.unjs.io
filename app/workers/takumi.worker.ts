import init, { Renderer } from '@takumi-rs/wasm'
import { transform } from 'sucrase'
// @ts-ignore
import wasmUrl from '~/assets/wasm/takumi.wasm?url'

let wasmInitialized = false
let renderer: Renderer | null = null

// Simple JSX runtime for Sucrase 'automatic' transform
function h(type: string, props: any, ...children: any[]) {
  return {
    type,
    props: { ...props, children: children.length <= 1 ? children[0] : children },
  }
}

const jsxRuntime = {
  h,
  Fragment: 'symbol-fragment',
}

self.onmessage = async (event) => {
  const { type, id, code, options } = event.data

  if (type === 'init') {
    if (!wasmInitialized) {
      console.log('Worker: Initializing WASM from import', wasmUrl)
      try {
        await init({ module_or_path: wasmUrl })
      }
      catch (e) {
        console.error('Worker: Failed to load WASM', e)
        throw e
      }
      wasmInitialized = true
      renderer = new Renderer()

      try {
        // Fetch and load font
        const fontRes = await fetch('/fonts/HubotSans-Regular.woff2')
        if (fontRes.ok) {
          const fontData = await fontRes.arrayBuffer()
          renderer.loadFont(new Uint8Array(fontData))
          console.log('Worker: Font loaded successfully')
        }
        else {
          console.error('Worker: Font fetch failed', fontRes.status)
        }
      }
      catch (e) {
        console.error('Worker: Failed to load font', e)
      }
    }
    self.postMessage({ type: 'ready' })
    return
  }

  if (type === 'render-request') {
    try {
      if (!renderer) {
        // Should have been initialized, but just in case
        await init({ module_or_path: '/takumi.wasm' })
        renderer = new Renderer()
      }

      // 1. Transform JSX to JS using Sucrase
      const transformed = transform(code, {
        transforms: ['jsx', 'typescript'],
        jsxRuntime: 'classic',
        jsxPragma: 'h',
        jsxFragmentPragma: 'Fragment',
        production: true,
      }).code

      // 2. Evaluate the code
      // We wrap it to handle the 'export default' and provide the runtime
      const wrappedCode = `
        const { h, Fragment } = runtime;
        ${transformed.replace(/export default/g, 'return')}
      `

      const renderFn = new Function('runtime', wrappedCode)
      const vnode = renderFn(jsxRuntime)()

      // Transform VNode to Takumi format
      function toTakumiNode(node: any, inheritedStyle: any = {}): any {
        if (node === null || node === undefined)
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

      console.log('Worker: VNode', JSON.stringify(vnode, null, 2))
      const takumiNode = toTakumiNode(vnode)
      console.log('Worker: Takumi Node', JSON.stringify(takumiNode, null, 2))

      // Process images: fetch and convert to base64
      async function processImages(node: any) {
        if (!node)
          return

        if (node.type === 'image' && node.src && node.src.startsWith('http')) {
          try {
            console.log('Worker: Fetching image', node.src)
            const res = await fetch(node.src)
            if (res.ok) {
              const blob = await res.blob()
              const buffer = await blob.arrayBuffer()
              const base64 = btoa(
                new Uint8Array(buffer)
                  .reduce((data, byte) => data + String.fromCharCode(byte), ''),
              )
              const mimeType = res.headers.get('content-type') || 'image/png'
              node.src = `data:${mimeType};base64,${base64}`
              console.log('Worker: Image fetched and converted')
            }
            else {
              console.error('Worker: Failed to fetch image', res.status)
            }
          }
          catch (e) {
            console.error('Worker: Error fetching image', e)
          }
        }

        if (node.children) {
          await Promise.all(node.children.map((child: any) => processImages(child)))
        }
      }

      await processImages(takumiNode)

      // 3. Render
      const dataUrl = renderer.renderAsDataUrl(takumiNode, {
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
    catch (err: any) {
      console.error('Worker: Render error', err)
      self.postMessage({
        type: 'render-result',
        id,
        result: {
          success: false,
          error: err.message,
        },
      })
    }
  }
}
