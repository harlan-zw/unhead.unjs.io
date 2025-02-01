### A `<script>`{lang="html"} for full stack javascript

Better developer experience, performance and privacy.

::code-group

```ts twoslash [useScript]
const script = useScript({
  src: 'https://js.cdn/tracker.js',
}, {
  trigger: useOnIdle()
})
script.onError((error) => { /* uh oh */ })
// proxy function calls for when the script is loaded
script.proxy.track('foo')
// or just use onLoaded
script.onLoaded((api) => {
  api.track('bar')
})
```

```html [SSR Output]
<link fetchpriority="low" as="script" crossorigin="anonymous" referrerpolicy="no-referrer" href="https://js.cdn/tracker.js" rel="preload">
```

```html [Client Output]
<script data-onload="" data-onerror="" defer="" fetchpriority="low" crossorigin="anonymous" referrerpolicy="no-referrer" src="https://js.cdn/tracker.js"></script>
```

::
