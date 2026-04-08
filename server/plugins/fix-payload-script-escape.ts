export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    // Nuxt Content minimark body can contain literal </script> from code examples.
    // The HTML parser sees this and prematurely closes the __NUXT_DATA__ script tag,
    // corrupting the JSON payload and breaking hydration.
    // Fix: escape </script> only inside the __NUXT_DATA__ JSON payload body.
    html.bodyAppend = html.bodyAppend.map((chunk) => {
      const dataTag = 'id="__NUXT_DATA__"'
      const tagPos = chunk.indexOf(dataTag)
      if (tagPos === -1)
        return chunk
      // Find the end of the opening tag (the >)
      const bodyStart = chunk.indexOf('>', tagPos + dataTag.length)
      if (bodyStart === -1)
        return chunk
      // Find the closing </script> for this tag (last one after bodyStart)
      const afterBody = chunk.slice(bodyStart + 1)
      const closeIdx = afterBody.lastIndexOf('</script>')
      if (closeIdx === -1)
        return chunk
      const jsonBody = afterBody.slice(0, closeIdx)
      const rest = afterBody.slice(closeIdx)
      return chunk.slice(0, bodyStart + 1)
        + jsonBody.replaceAll('</script>', '\\u003C/script>')
        + rest
    })
  })
})
