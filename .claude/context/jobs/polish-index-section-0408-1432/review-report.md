---
verdict: FAIL
failed_criteria: []
failed_files: ["app/pages/index.vue:139", "app/components/Footer.vue:107", "app/app.vue:61", "app/components/Header.vue:166", "app/components/Header.vue:333"]
categories: ["broken-feature", "dark-mode", "design-system", "accessibility", "build-error"]
---

## FAIL — 2026-04-08 (Pass 2: post-repair review)

### Contract Scorecard

No contract provided (NO_CONTRACT). Graded against hard rejection criteria and rubric only.

### Previous Issues Status

The repair pass successfully fixed 6/7 issues from the first review:
- Hero text-primary amber contrast: FIXED (text-amber-700 in light mode)
- Success badge contrast: FIXED (variant='outline')
- Mount button contrast: FIXED (color='neutral')
- Search input missing aria-label: FIXED (added to both Header.vue inputs)
- Dark mode noise grain: FIXED (0.035 -> 0.055)
- Dark mode gradient: FIXED (0.04 -> 0.07)
- Missing section dividers: FIXED (added between ReactiveLifecycles and SEOTags, SEOTags and MakingWebsitesFaster)
- Shiki green code tokens: NOT FIXED (acknowledged third-party limitation)

### NEW Issues Found

#### [HARD REJECT] Broken feature: Hero badge links to deleted `/v3` page
- **File**: `app/pages/index.vue:139`
- **Evidence**: `<NuxtLink target="_blank" to="/v3">` links to `/v3`, but both `app/pages/v3.vue` and `docs/v3.md` are deleted in this diff. Route will 404.

#### [HARD REJECT] Broken feature: Footer links to deleted `/v2` page
- **File**: `app/components/Footer.vue:107`
- **Evidence**: `{ title: 'Announcing Unhead v2', path: '/v2' }` links to `/v2`, but both `app/pages/v2.vue` and `docs/v2.md` are deleted in this diff. Route will 404.

#### [HARD REJECT] Dark mode / Design system violation: `bg-white` and cool `gray-*` in SkewNotification
- **File**: `app/app.vue:61`
- **Evidence**: `bg-white dark:bg-gray-900 rounded-full shadow-lg ring-1 ring-gray-200 dark:ring-gray-800`. Uses `bg-white` (pure white, violates "always use amber-tinted neutrals") and `gray-*` (cool gray, violates "avoid cool-tinted grays"). Should use semantic tokens like `bg-elevated` and `ring-[var(--ui-border)]`.

#### [HARD REJECT] Build/runtime error: Dev server cannot start
- **Evidence**: `@nuxt/content` module fails during clone of unhead repo: "Your local changes to the following files would be overwritten by checkout." The app is not runnable in its current state. This is an environment/git state issue, not a code bug, but prevents verification.

#### [RUBRIC] Design system: `gray-*` classes throughout Header.vue
- **File**: `app/components/Header.vue:166`
- **Evidence**: `lg:bg-gray-500/[0.02]`, `lg:dark:bg-gray-900/10` use Tailwind's cool gray instead of configured neutral (warm stone). Also at lines 333, 338: `text-gray-800`, `text-gray-600`, `text-gray-400`, `group-hover:bg-gray-200`, `group-hover:bg-gray-700`.

#### [RUBRIC] Design guidelines stale: Noise grain and gradient opacity
- **File**: `app/app.vue:91` and `app/css/global.css:185`
- **Evidence**: Code has noise grain dark opacity 5.5% and gradient dark opacity 7%, but design-guidelines.md says 3.5% and 4% respectively. The repair pass intentionally changed these but did not update the design guidelines document. Guidelines should reflect actual values.

#### [RUBRIC] Accessibility: Tab buttons unreachable via keyboard
- **File**: `app/components/content/CodeGroup.vue:64` and `app/components/content/TabComparison.vue:68`
- **Evidence**: `tabindex="-1"` on tab buttons removes them from tab order. No arrow key navigation handler is implemented as substitute. Code group/comparison tabs cannot be switched via keyboard.

### Self-Assessment Comparison

- **Generator confidence**: medium
- **Weakest area identified**: "Shiki green code tokens at 4.42:1 remain borderline"
- **Actual weakest area**: Broken links to deleted `/v2` and `/v3` pages; `gray-*` design system violations
- **Self-assessment failures**:
  - Generator did NOT identify broken links to `/v2` (Footer.vue:107) and `/v3` (index.vue:139) despite both pages being deleted in this diff
  - Generator did NOT flag `gray-*` class usage in app.vue and Header.vue
  - Generator accurately flagged Shiki green contrast as borderline (honest)
  - Generator accurately described badge variant decision (honest)

### Mechanical Check Results

| Check | Result |
|-------|--------|
| TODO/FIXME/placeholder | Clean (only legitimate search input placeholder) |
| Hardcoded hex colors | Justified: code syntax colors documented as intentional in design decisions; theme tokens in global.css; SVG logo fills |
| rgb/hsl/rgba | Clean |
| Non-neutral colors (gray-/slate-/zinc-) | **FAIL**: app.vue:61, Header.vue:166,333,338 use `gray-*` instead of `neutral` |
| Dark mode (bg-white/text-black) | **FAIL**: app.vue:61 uses `bg-white` |
| Font compliance | Clean |
| Custom tokens | Justified: `--container-width`, `--scrollbar-thumb/track` have no Nuxt UI equivalents |

### What was verified
- All changed files read and analyzed (12/13; meta-tag-generator.vue partially)
- Full mechanical grep suite executed on all changed files
- Verified deleted pages (v2.vue, v3.vue, v2.md, v3.md) no longer exist on disk
- Attempted dev server start (failed due to @nuxt/content git clone conflict)
- Checked design guidelines against actual CSS values
- Analyzed self-assessment accuracy against independent findings

### What was NOT verified (no dev server / no browser)
- Visual rendering at any breakpoint
- Interactive behavior (buttons, links, switches)
- Client-side rendering and hydration
- Contrast ratios on rendered elements
- Mobile layout (375px, 768px)
- Dark mode toggle behavior
- Accessibility via axe-core

### Next Steps

1. Either restore `/v2` and `/v3` content/pages, or remove links pointing to them
2. Replace `gray-*` classes with `neutral` or semantic tokens in app.vue:61 and Header.vue
3. Replace `bg-white` with `bg-elevated` (or similar) in app.vue:61
4. Update design-guidelines.md noise/gradient opacity values to match actual code (5.5%/7%)
5. Address `tabindex="-1"` on CodeGroup/TabComparison buttons

### Decision Log

| Criterion | Checked | Found | Verdict |
|-----------|---------|-------|---------|
| Broken feature | Verified deleted files on disk, checked all NuxtLinks in changed files | /v3 and /v2 links point to deleted pages | FAIL |
| Build/runtime error | Attempted `pnpm dev --port 3300`, read server output | @nuxt/content git clone fails | FAIL |
| Invisible content | Cannot verify (no server) | Unverified | N/A |
| Unreadable text | Cannot verify rendered contrast (no server) | Unverified; previous contrast fixes look correct in code | N/A |
| Layout break | Cannot verify (no server) | Unverified | N/A |
| Missing state handling | Code review of async operations | Lazy loading with proper refs, appears handled | Likely PASS |
| Theme incoherence | Grep for gray-*/bg-white; checked guidelines vs code | gray-* and bg-white violate warm neutral identity | FAIL |
| Unnecessary custom tokens | Grep for non-ui custom properties | --container-width and --scrollbar-* only, justified | PASS |
| Responsiveness | Cannot verify (no server) | Unverified | N/A |
| Interaction states | Code review only | Mount/Unmount, Capo switch have handlers | Likely PASS |
| Accessibility | Code review for tabindex, aria-labels | tabindex="-1" on CodeGroup/TabComparison tabs | FAIL |
