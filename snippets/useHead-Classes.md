### ✅ Classes and styles however you like

```ts twoslash
useHead({
  bodyAttrs: {
    // use strings
    style: 'background-color: #343434',
    // arrays
    class: ['dark', 'overflow'],
  },
  htmlAttrs: {
    // objects
    style: {
      backgroundColor: 'white',
      color: 'black',
    },
    // computed boolean objects
    class: {
      dark: () => Date.now() % 2 === 0,
    },
  },
})
```
