# Meta Tag Code Generator

## Overview

A tool that generates `useSeoMeta()` / `useHead()` code from form inputs. Users fill out SEO fields → get copy-paste composable code for their framework.

**Target Keywords:**
- "meta tag generator" (590/mo, diff 43)
- "meta tag generator seo" (210/mo, diff 34)
- "og meta tag generator" (20/mo, diff 19)
- "social media meta tag generator" (10/mo)

**URL:** `/tools/meta-tag-generator`

---

## Features

### Core
- Form inputs for common meta tags (title, description, og:image, etc.)
- Live preview of generated code
- Framework toggle (Vue/React/Nuxt/Solid/Svelte)
- Copy to clipboard
- Character count warnings (title 60, desc 160)

### Output Modes
1. `useSeoMeta({})` - flat API (recommended)
2. `useHead({})` - full head object
3. Raw HTML `<meta>` tags (for non-Unhead users, captures broader audience)

### Preview Panel
- Google SERP preview (title + description truncation)
- Social card preview (Twitter/Facebook/LinkedIn mock)
- Raw HTML output preview

---

## Technical Implementation

### File Structure

```
app/pages/tools/
├── index.vue                    # Tools landing page
├── meta-tag-generator.vue       # Main tool page

app/components/tools/
├── MetaTagForm.vue              # Input form component
├── MetaTagPreview.vue           # SERP/Social preview
├── CodeOutput.vue               # Code display with copy button

app/composables/
├── useMetaTagGenerator.ts       # State & code generation logic
```

### State Shape

```ts
interface MetaTagState {
  // Basic
  title: string
  description: string

  // Open Graph
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogType: 'website' | 'article' | 'product'
  ogUrl: string

  // Twitter
  twitterCard: 'summary' | 'summary_large_image'
  twitterSite: string
  twitterCreator: string

  // Technical
  canonical: string
  robots: string

  // Output
  framework: 'vue' | 'react' | 'nuxt' | 'solid' | 'svelte'
  outputMode: 'useSeoMeta' | 'useHead' | 'html'
}
```

### Code Generation

```ts
// composables/useMetaTagGenerator.ts
export function useMetaTagGenerator() {
  const state = reactive<MetaTagState>({...})

  const generatedCode = computed(() => {
    if (state.outputMode === 'useSeoMeta') {
      return generateUseSeoMeta(state)
    }
    if (state.outputMode === 'useHead') {
      return generateUseHead(state)
    }
    return generateHtml(state)
  })

  return { state, generatedCode }
}
```

### UI Components

Use existing Nuxt UI components:
- `UFormGroup` + `UInput` for form fields
- `USelect` for dropdowns (og:type, twitter:card)
- `USwitch` for toggles
- `UTabs` for output mode switching
- `UButton` for copy action
- `UBadge` for character count warnings

### Code Display

Reuse pattern from `ProsePre.vue`:
- Shiki for syntax highlighting
- Copy button with `useClipboard()`
- Framework-specific syntax (imports, composable calls)

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Meta Tag Generator                                         │
│  Generate useSeoMeta() code for Vue, React, Nuxt & more    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │ FORM INPUTS         │  │ PREVIEW                     │  │
│  │                     │  │                             │  │
│  │ [Title............] │  │ ┌─Google SERP─────────────┐ │  │
│  │ [Description.......│  │ │ Title Here              │ │  │
│  │ ....................│  │ │ example.com › page      │ │  │
│  │ ..................] │  │ │ Description text...     │ │  │
│  │                     │  │ └─────────────────────────┘ │  │
│  │ ── Open Graph ────  │  │                             │  │
│  │ [OG Title.........] │  │ ┌─Twitter Card────────────┐ │  │
│  │ [OG Description...] │  │ │ ┌──────────────────┐   │ │  │
│  │ [OG Image URL.....] │  │ │ │    og:image      │   │ │  │
│  │ [OG Type ▼........] │  │ │ └──────────────────┘   │ │  │
│  │                     │  │ │ Title                   │ │  │
│  │ ── Twitter ───────  │  │ │ Description             │ │  │
│  │ [Card Type ▼......] │  │ │ example.com             │ │  │
│  │ [@site............] │  │ └─────────────────────────┘ │  │
│  │                     │  │                             │  │
│  │ ── Advanced ──────  │  │                             │  │
│  │ [Canonical URL....] │  │                             │  │
│  │ [Robots..........] │  │                             │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  OUTPUT                              [Vue ▼] [Copy Code]    │
│  ┌─ useSeoMeta ─┬─ useHead ─┬─ HTML ─┐                     │
│  │                                                         │
│  │  useSeoMeta({                                           │
│  │    title: 'My Page Title',                              │
│  │    description: 'Page description here...',            │
│  │    ogTitle: 'My Page Title',                            │
│  │    ogDescription: 'Page description here...',          │
│  │    ogImage: 'https://example.com/og.png',              │
│  │    twitterCard: 'summary_large_image',                 │
│  │  })                                                     │
│  │                                                         │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Core Tool
1. Create `/app/pages/tools/meta-tag-generator.vue`
2. Create `useMetaTagGenerator` composable with state + code gen
3. Build form inputs (basic fields: title, description)
4. Add code output with syntax highlighting
5. Framework selector (reuse `useFrameworkSelector`)
6. Copy to clipboard

### Phase 2: Previews
1. SERP preview component (title truncation at 60, desc at 160)
2. Twitter card preview mock
3. Character count badges with warnings

### Phase 3: Advanced Features
1. Open Graph fields (og:title, og:description, og:image, og:type)
2. Twitter fields (twitter:card, twitter:site, twitter:creator)
3. Technical fields (canonical, robots)
4. Output mode tabs (useSeoMeta / useHead / HTML)

### Phase 4: Polish
1. URL params for shareable state (`?title=...&desc=...`)
2. "Reset" button
3. SEO page meta (target keywords)
4. Tools index page with card linking here

---

## SEO Strategy

### Page Meta
```ts
useSeoMeta({
  title: 'Meta Tag Generator - Generate useSeoMeta Code',
  description: 'Free meta tag generator for Vue, React, Nuxt. Generate useSeoMeta() code with live SERP and social card preview.',
  ogTitle: 'Meta Tag Generator | Unhead',
  ogDescription: 'Generate SEO meta tags as useSeoMeta() composable code. Preview Google SERP and social cards.',
})
```

### Internal Linking
- Link from docs pages about `useSeoMeta()`
- Link from homepage features section
- Cross-link to other tools once built

### Content
- Brief explanation of meta tags importance
- Why `useSeoMeta()` is better than manual `<meta>` tags
- Link to full documentation

---

## Differentiation from NuxtSEO

| NuxtSEO Meta Tag Checker | Unhead Meta Tag Generator |
|--------------------------|---------------------------|
| Input: URL | Input: Form fields |
| Output: Report/issues | Output: Code |
| Validates existing tags | Creates new tags |
| For debugging | For building |

Clear positioning: "Generate the code" vs "Check your tags"

</meta>
</meta>
