### ✅ Classes and styles however you like

```ts twoslash
useHead({
  bodyAttrs: {
    // use strings
    style: 'background-color: white; color: black',
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
      dark: () => isDarkMode.value,
    },
  },
})
```
