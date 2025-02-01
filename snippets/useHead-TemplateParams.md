### ✅ Optimized Client Bundles

```ts twoslash
useServerHead({
  script: [{
    innerHTML: 'console.log("Hello World")',
    // render after <body>
    tagPosition: 'bodyOpen',
  }],
})
```
