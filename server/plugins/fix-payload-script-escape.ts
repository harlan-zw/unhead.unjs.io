// Nuxt Content minimark body can contain literal </script> from code examples.
// The HTML parser sees this and prematurely closes the __NUXT_DATA__ script tag,
// corrupting the JSON payload and breaking hydration.
// Fix: escape </script> as \u003C/script> only inside the __NUXT_DATA__ body.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    for (const key of ['body', 'bodyAppend', 'bodyPrepend', 'head'] as const) {
      html[key] = html[key].map((chunk: string) => {
        const marker = 'id="__NUXT_DATA__"'
        const tagPos = chunk.indexOf(marker)
        if (tagPos === -1)
          return chunk
        const bodyStart = chunk.indexOf('>', tagPos + marker.length)
        if (bodyStart === -1)
          return chunk
        const after = chunk.slice(bodyStart + 1)
        const closeIdx = after.lastIndexOf('</script>')
        if (closeIdx === -1)
          return chunk
        return chunk.slice(0, bodyStart + 1)
          + after.slice(0, closeIdx).replaceAll('</script>', '\\u003C/script>')
          + after.slice(closeIdx)
      })
    }
  })
})
