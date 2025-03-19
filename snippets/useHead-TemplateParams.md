### ✅ Optimized Client Bundles

```ts twoslash
// Unhead tags are built to tree-shake, it just works
if (import.meta.server) {
  useHead({
    meta: [{
      name: 'description',
      content: 'Hello World',
    }],
    script: [{
      innerHTML: 'console.log("Hello World")',
    }],
  })
}
```
