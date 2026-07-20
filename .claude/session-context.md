# Session Context

Last updated: 2026-01-30 12:38

## Git State
```
Branch: main
 M app/app.vue
 M app/components/Footer.vue
 M app/components/FrameworkSelector.vue
 M app/components/Header.vue
A  app/components/content/ProseA.vue
 M app/composables/data.ts
 M app/composables/frameworkSelector.ts
A  app/composables/versionSelector.ts
AD app/layouts/docs-v2.vue
 M app/layouts/docs.vue
 M app/pages/docs/[...slug].vue
 D app/pages/docs/v2/[...slug].vue
 M nuxt.config.ts
 M utils/urls.ts
?? .claude/
```

## Recent Commits
```
897a687 chore: docs v2
baf769f chore: bump
d1b159a feat: og image generator
7e1a661 chore: sync vars
b19effa chore: sync vars
```

## Recently Modified
```
./app/composables/data.ts
./app/components/Header.vue
./.nuxt/module/nuxt-og-image.d.ts
./.nuxt/schema/nuxt.schema.d.ts
./.nuxt/imports.d.ts
./.nuxt/module/nuxt-schema-org.d.ts
./.nuxt/module/nuxt-seo-utils.assets.d.ts
./.nuxt/module/nuxt-scripts.d.ts
./.nuxt/module/nuxt-site-config.d.ts
./.nuxt/nuxt.node.d.ts
```

## Scratchpad State

## Goal
Build OG Image Generator tool using client-side Takumi (WASM) - visual editor with live preview, PNG export, resize

## Architecture (adapted from Takumi playground)

### Core Pattern
```
User edits template → Worker renders JSX → Returns dataUrl → Display preview / Export PNG
```

### Dependencies to Add
```json
{
  "@takumi-rs/wasm": "^x.x.x",
  "@takumi-rs/helpers": "^x.x.x",
  "sucrase": "^3.x.x" // JSX transform
}
```

### Files to Create

1. **`app/composables/useTakumiRenderer.ts`** - Worker management composable
   - Initialize WASM worker
   - Handle render requests/responses
   - Expose `render(code)`, `isReady`, `result`, `error`

2. **`app/workers/takumi.worker.ts`** - Web Worker (adapted from playground)
   - Init WASM + load fonts
   - Transform JSX with sucrase
   - Render via `renderer.renderAsDataUrl()`

3. **`app/composables/useOgImageGenerator.ts`** - Tool state & code generation
   - Template selection, customization state
   - Generate JSX code from state
   - Generate `defineOgImage()` output code

4. **`app/pages/tools/og-image-generator.vue`** - Main tool page

5. **`public/fonts/`** - Fonts for Takumi (Geist, emoji)

### Modify
6. `app/components/Header.vue` - Add nav link
7. `app/components/Footer.vue` - Add nav link

## Implementation Details

### Worker Schema (from Takumi)
```ts
// Messages
interface RenderRequest { type: 'render-request', id: number, code: string }
interface RenderResult { type: 'render-result', result: Success | Error }
interface Ready { type: 'ready' }

// Options (exported from template)
interface PlaygroundOptions {
  width?: number // 1200
  height?: number // 630
  format?: 'png' | 'jpeg' | 'webp'
  quality?: number // 1-100
  devicePixelRatio?: number
}
```

### Template Format (JSX with tw prop)
```tsx
export default function OgImage() {
  return (
    <div tw="w-full h-full flex bg-black text-white">
      <h1 tw="text-6xl font-bold">Title Here</h1>
    </div>
  )
}

export const options: PlaygroundOptions = {
  width: 1200,
  height: 630,
  format: 'png',
}
```

### Tool UI Flow

1. **Presets** - Blog, Docs, Product, Landing (pre-built JSX templates)
2. **Customization Panel**
   - Title input
   - Description input
   - Background color picker
   - Text color picker
   - Logo/icon upload (optional)
3. **Live Preview** - Renders via WASM worker
4. **Export Options**
   - Download as PNG/JPEG/WebP
   - Resize (width/height inputs)
   - Device pixel ratio (1x, 2x)
5. **Code Output**
   - `defineOgImage()` mode
   - `defineOgImageComponent()` mode
   - Raw JSX template

### Export Feature
```ts
function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}
```

## Current Task
- [x] Research Takumi playground architecture
- [x] Create implementation plan
- [ ] Add Takumi dependencies
- [ ] Create worker file
- [ ] Create useTakumiRenderer composable
- [ ] Create useOgImageGenerator composable
- [ ] Create page with UI
- [ ] Add preset templates (blog, docs, product, landing)
- [ ] Add export functionality
- [ ] Update nav (Header/Footer)
- [ ] Test and refine

## Technical Notes

- Vue/Nuxt needs Vite config for worker imports (`?worker` suffix)
- Fonts need to be in `/public/fonts/` for worker fetch
- Use `@vueuse/core` for reactive worker communication
- Color scheme: purple (matches plan)

## Status
Ready for user approval

## Sources
- [Takumi GitHub](https://github.com/kane50613/takumi)
- [Takumi Docs](https://takumi.kane.tw/docs/)
