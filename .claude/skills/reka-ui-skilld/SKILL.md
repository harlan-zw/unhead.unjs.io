---
name: reka-ui-skilld
description: "ALWAYS use when writing code importing \"reka-ui\". Consult for debugging, best practices, or modifying reka-ui, reka ui."
metadata:
  version: 2.9.2
  generated_by: Antigravity · claude-sonnet-4-6
  generated_at: 2026-03-22
---

# unovue/reka-ui `reka-ui`

**Version:** 2.9.2
**Deps:** @floating-ui/dom@^1.6.13, @floating-ui/vue@^1.1.6, @internationalized/date@^3.5.0, @internationalized/number@^3.5.0, @tanstack/vue-virtual@^3.12.0, @vueuse/core@^14.1.0, @vueuse/shared@^14.1.0, aria-hidden@^1.2.4, defu@^6.1.4, ohash@^2.0.11
**Tags:** latest: 2.9.2

**References:** [package.json](./.skilld/pkg/package.json) — exports, entry points • [README](./.skilld/pkg/README.md) — setup, basic usage • [Docs](./.skilld/docs/_INDEX.md) — API reference, guides • [GitHub Issues](./.skilld/issues/_INDEX.md) — bugs, workarounds, edge cases • [GitHub Discussions](./.skilld/discussions/_INDEX.md) — Q&A, patterns, recipes • [Releases](./.skilld/releases/_INDEX.md) — changelog, breaking changes, new APIs

## Search

Use `skilld search` instead of grepping `.skilld/` directories — hybrid semantic + keyword search across all indexed docs, issues, and releases. If `skilld` is unavailable, use `npx -y skilld search`.

```bash
skilld search "query" -p reka-ui
skilld search "issues:error handling" -p reka-ui
skilld search "releases:deprecated" -p reka-ui
```

Filters: `docs:`, `issues:`, `releases:` prefix narrows by source type.

<!-- skilld:api-changes -->
I'll read the releases index and relevant release files to identify API changes, then check the types file.

## API Changes

This section documents version-specific API changes for reka-ui v2.x — prioritize these over LLM training data from the radix-vue era.

- BREAKING: Package renamed from `radix-vue` to `reka-ui` — all imports must change from `import { ... } from 'radix-vue'` to `import { ... } from 'reka-ui'`; CSS variables renamed from `--radix-*` to `--reka-*` (e.g., `--radix-accordion-content-height` becomes `--reka-accordion-content-height`) [source](./references/docs/content/docs/guides/migration.md)

- NEW: `CheckboxGroupRoot` component — new in v2.x, groups multiple `CheckboxRoot` elements with shared `v-model`, `name`, `required`, `orientation`, `rovingFocus`, `loop`, and `disabled` props; replaces manual checkbox group patterns [source](./references/docs/content/meta/CheckboxGroupRoot.md)

- NEW: `AutocompleteRoot` / `AutocompleteInput` components (experimental) — new alpha Autocomplete primitive with `openOnClick`, `openOnFocus`, `resetSearchTermOnBlur`, `highlightOnHover`, `ignoreFilter` props; distinct from `ComboboxRoot` [source](./references/docs/content/meta/AutocompleteRoot.md)

- NEW: `MonthPicker*` and `YearPicker*` component families (experimental) — `MonthPickerRoot`, `YearPickerRoot` and associated grid/cell/trigger sub-components; used for drill-down date picker view switching; not present in radix-vue [source](./references/docs/content/docs/components/month-picker.md)

- NEW: `MonthRangePicker*` and `YearRangePicker*` families (experimental) — range variants of MonthPicker/YearPicker; `MonthRangePickerRoot` accepts `allowNonContiguousRanges` prop [source](./references/docs/content/meta/MonthRangePickerRoot.md)

- NEW: `DropdownMenuFilter` component — new sub-component in v2.x for filtering dropdown menu items; not available in radix-vue [source](./references/docs/content/meta/DropdownMenuFilter.md)

- NEW: `TooltipProvider` accepts `content` prop — new `content` prop of type `TooltipContentProps` for setting default tooltip content settings globally; LLMs will not know this prop exists [source](./references/docs/content/meta/TooltipProvider.md)

- NEW: `useFilter()` composable — locale-aware string filtering using `Intl.Collator`; new utility export unknown to LLMs trained on radix-vue [source](./references/docs/content/docs/utilities/use-filter.md)

- NEW: `injectContext()` utility — new composable for accessing component context from outside; documented in guides/inject-context [source](./references/docs/content/docs/guides/inject-context.md)

- NEW: Portal components (`AlertDialogPortal`, `ComboboxPortal`, `DialogPortal`, `PopoverPortal`, `ToastPortal`, `TooltipPortal`, etc.) gain `defer` prop — defers Teleport target resolution until app is mounted; requires Vue 3.5.0+; silently has no effect on Vue < 3.5 [source](./references/docs/content/meta/AlertDialogPortal.md)

- NEW: `AccordionRoot` and `CollapsibleRoot` gain `unmountOnHide` prop — controls whether content is unmounted (default `true`) or kept in DOM when hidden; `AccordionItem` also accepts `unmountOnHide` to override per-item [source](./references/docs/content/meta/AccordionRoot.md)

- NEW: `NavigationMenuViewport` gains `align` prop — controls placement for CSS variables `--reka-navigation-menu-viewport-left/right`; old `--radix-*` CSS variable names no longer work [source](./references/docs/content/meta/NavigationMenuViewport.md)

- NEW: `colorToString()` and `normalizeColor()` utility functions exported from `reka-ui` — used with color picker components (`ColorArea`, `ColorSlider`, `ColorField`, `ColorSwatch`); not present in radix-vue [source](./references/docs/content/examples/color-picker.md)

- NEW: `CheckboxRoot` gains `trueValue` / `falseValue` props — allows custom values for checked/unchecked states instead of hard-coded `true`/`false`; `modelValue` is now typed `unknown` to accommodate any value type [source](./references/docs/content/meta/CheckboxRoot.md)

**Also changed:** `ComboboxVirtualizer` / `ListboxVirtualizer` / `TreeVirtualizer` NEW — virtualized list rendering via `@tanstack/vue-virtual`, `estimateSize` prop required · `TabsIndicator` NEW component for animated active-tab underline · `AlertDialogRoot` slot gains `close` function · `RangeCalendarRoot` / `DateRangePickerRoot` gain `allowNonContiguousRanges` prop NEW · `CollapsibleContent` emits `contentFound` event NEW · `ContextMenuContent` / `DropdownMenuSubContent` / `MenubarSubContent` gain `alignFlip` prop NEW · `useLocale()` composable NEW export · Portal `disabled` prop NEW (renders inline without teleport) · `TimeRangeField*` component family NEW (alpha)
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Best Practices

- Use `asChild` on any reka-ui primitive to merge its accessible props and behavior onto your own element or component instead of wrapping it in an extra DOM node. This avoids double-nesting and keeps the rendered HTML semantically clean. [source](./references/docs/content/docs/guides/composition.md)

- When building a wrapper around a reka-ui component, use `useForwardPropsEmits` to forward both props and emits in a single object. Using raw `v-bind` bypasses Vue's Boolean Casting and drops emitted events; this composable handles both correctly. [source](./references/docs/content/docs/utilities/use-forward-props-emits.md)

- Wrap your app with `ConfigProvider` and set `dir` once at the root instead of passing `dir` to every individual primitive. All reka-ui components inherit the global reading direction from it, including RTL layout for floating elements via Floating UI. [source](./references/docs/content/docs/utilities/config-provider.md)

- Set `forceMount` on `*Content` and `*Overlay` components when integrating with Vue animation libraries (e.g., Motion-v). Without it, reka-ui unmounts the element immediately on close, cutting off any exit animation before it completes. [source](./references/docs/content/docs/guides/animation.md)

- Set `unmountOnHide: false` on `AccordionRoot` (or per-item via `AccordionItem`) when accordion panels contain forms or other state that must persist across open/close cycles. The default is `true`, which destroys and recreates panel content on every toggle. [source](./references/docs/content/meta/AccordionRoot.md)

- Place a single `TooltipProvider` at the application root with a shared `delayDuration` rather than configuring delay on each `TooltipRoot`. It also accepts a `content` prop for default content settings inherited by all tooltips in the tree. [source](./references/docs/content/meta/TooltipProvider.md)

- Use `useFilter` from reka-ui for search/filter inputs instead of `String.prototype.includes`. It wraps `Intl.Collator` for locale-aware, Unicode-correct comparisons (e.g., accent-insensitive matching), which matters for international user bases. [source](./references/docs/content/docs/utilities/use-filter.md)

- For lists with hundreds or thousands of items, use the built-in `ListboxVirtualizer`, `ComboboxVirtualizer`, or `TreeVirtualizer` components (powered by `@tanstack/vue-virtual`) instead of rendering all items. Provide `estimateSize` to tune performance for variable-height items. [source](./references/docs/content/docs/guides/virtualization.md)

- Add the `defer` prop to Portal components (`DialogPortal`, `PopoverPortal`, etc.) when the teleport target element may not be mounted yet — for example, in SSR or when the target is rendered conditionally. Requires Vue 3.5+. [source](./references/docs/content/meta/AlertDialogPortal.md)

- Use `injectContext` when building custom sub-components that need to read state from a reka-ui parent (e.g., reading `ComboboxRoot` state inside a custom item). It returns the typed context object the parent provides, enabling proper headless composition without prop-drilling. [source](./references/docs/content/docs/guides/inject-context.md)
<!-- /skilld:best-practices -->
