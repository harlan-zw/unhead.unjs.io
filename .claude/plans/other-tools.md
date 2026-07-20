# Other Tool Ideas for Unhead

Secondary tools to build after Meta Tag Generator. All focus on **code generation** to differentiate from NuxtSEO's validators/checkers.

---

## 1. OG Image Generator

**Keywords:** "og image generator" (210/mo, diff 30)

**Concept:** Visual editor to design OG images → outputs `defineOgImage()` code for Nuxt OG Image module.

**Features:**
- Template picker (blog, docs, product, landing)
- Text/color customization
- Live preview
- Output: `defineOgImage()` composable or Satori template code

**Differentiator:** NuxtSEO's Social Share Debugger checks existing images. This creates new ones with code output.

**Effort:** Medium-High (needs canvas/image generation)

---

## 2. Schema.org Code Generator

**Keywords:**
- "schema markup generator" (110/mo, diff 44)
- "faq schema markup generator" (20/mo, diff 42)
- "video schema markup generator" (30/mo, diff 19)

**Concept:** Form-based generator for common Schema.org types → outputs `useSchemaOrg()` composable code.

**Supported Types:**
- Article / BlogPosting
- FAQPage
- Product
- LocalBusiness
- Organization
- Person
- HowTo
- Video
- Event

**Features:**
- Type selector with relevant fields
- Nested object support (author, publisher)
- JSON-LD preview
- Output: `useSchemaOrg()` code or raw JSON-LD

**Differentiator:** NuxtSEO validates schema. This generates it.

**Effort:** Medium

---

## 3. useScript Snippet Library

**Keywords:** Low search volume but high utility for Unhead users

**Concept:** Pre-built `useScript()` snippets for popular third-party scripts.

**Scripts:**
- Google Analytics 4
- Google Tag Manager
- Meta Pixel (Facebook)
- Hotjar
- Microsoft Clarity
- Plausible
- Fathom
- Crisp Chat
- Intercom
- Stripe.js

**Features:**
- Search/filter scripts
- Copy snippet with placeholder for ID
- Loading strategy selector (lazy, idle, visible)
- Privacy/consent integration examples

**Effort:** Low (mostly content/snippets)

---

## 4. Head Tag Audit Tool

**Keywords:** Limited direct keywords, but captures "seo meta tags" (2900/mo) intent

**Concept:** Paste HTML or URL → analyze head tags → suggest Unhead improvements.

**Features:**
- Input: Raw HTML `<head>` content or URL
- Analysis: Missing tags, duplicates, ordering issues
- Output: Equivalent `useHead()` code with suggestions
- Capo.js ordering visualization

**Differentiator:** Focus on "convert to Unhead" rather than just reporting issues.

**Effort:** Medium

---

## 5. Migration Converter

**Keywords:** Very long-tail, low volume but high intent

**Concept:** Paste code from other head libraries → convert to Unhead.

**Supported Inputs:**
- React Helmet
- Next.js Head / next/head
- Vue Meta 2.x
- @vueuse/head
- Svelte `<svelte:head>`

**Features:**
- Auto-detect input library
- Side-by-side comparison
- Handle edge cases (dynamic values, SSR)

**Effort:** High (parsing complexity)

---

## Priority Order

1. **Meta Tag Generator** ← Current focus
2. **useScript Snippet Library** ← Low effort, high utility
3. **Schema.org Code Generator** ← Good keywords
4. **OG Image Generator** ← Good keywords but higher effort
5. **Head Tag Audit** ← Nice to have
6. **Migration Converter** ← Complex, niche audience

---

## Tools Landing Page

URL: `/tools`

Grid of tool cards with:
- Icon
- Title
- Short description
- "New" / "Pro" badge if applicable

Example layout:
```
┌─────────────────────────────────────────────────────────┐
│  Unhead Tools                                           │
│  Free developer tools for head tag management           │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐ │
│  │ 📝            │  │ 🖼️            │  │ 📊          │ │
│  │ Meta Tag      │  │ OG Image      │  │ Schema.org  │ │
│  │ Generator     │  │ Generator     │  │ Generator   │ │
│  │               │  │               │  │             │ │
│  │ Generate      │  │ Design social │  │ Build       │ │
│  │ useSeoMeta()  │  │ share images  │  │ structured  │ │
│  │ code          │  │ with code     │  │ data        │ │
│  └───────────────┘  └───────────────┘  └─────────────┘ │
│                                                         │
│  ┌───────────────┐  ┌───────────────┐                  │
│  │ 📜            │  │ 🔄            │                  │
│  │ useScript     │  │ Migration     │                  │
│  │ Snippets      │  │ Converter     │                  │
│  │               │  │               │                  │
│  │ Copy-paste    │  │ Convert from  │                  │
│  │ third-party   │  │ React Helmet  │                  │
│  │ scripts       │  │ & others      │                  │
│  └───────────────┘  └───────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

</head>
