export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    // Nuxt Content minimark body can contain literal </script> from code examples.
    // The HTML parser sees this and prematurely closes the __NUXT_DATA__ script tag,
    // corrupting the JSON payload and breaking hydration.
    // Fix: escape inner </script> occurrences so the HTML parser ignores them.
    html.bodyAppend = html.bodyAppend.map((chunk) => {
      if (!chunk.includes('__NUXT_DATA__') || !chunk.includes('</script'))
        return chunk
      // The last </script> is the real closing tag; all earlier ones are payload content
      const lastIdx = chunk.lastIndexOf('</script>')
      const before = chunk.slice(0, lastIdx)
      const after = chunk.slice(lastIdx)
      return before.replaceAll('</script>', '\\u003C/script>') + after
    })
  })
})
