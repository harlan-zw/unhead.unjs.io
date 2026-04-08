function escapePayloadScriptTags(chunks: string[]): string[] {
  return chunks.map((chunk) => {
    const dataTag = 'id="__NUXT_DATA__"'
    const tagPos = chunk.indexOf(dataTag)
    if (tagPos === -1)
      return chunk
    const bodyStart = chunk.indexOf('>', tagPos + dataTag.length)
    if (bodyStart === -1)
      return chunk
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
}

export default defineNitroPlugin((nitroApp) => {
  // Nuxt Content minimark body can contain literal </script> from code examples.
  // The HTML parser sees this and prematurely closes the __NUXT_DATA__ script tag,
  // corrupting the JSON payload and breaking hydration.
  // Fix: escape </script> only inside the __NUXT_DATA__ JSON payload body.
  // Check all html arrays since the payload location varies by Nuxt version.
  nitroApp.hooks.hook('render:html', (html) => {
    html.body = escapePayloadScriptTags(html.body)
    html.bodyAppend = escapePayloadScriptTags(html.bodyAppend)
    html.bodyPrepend = escapePayloadScriptTags(html.bodyPrepend)
    html.head = escapePayloadScriptTags(html.head)
  })
  // Also catch cached responses (SWR) that bypass render:html
  nitroApp.hooks.hook('render:response', (response) => {
    if (typeof response.body === 'string' && response.body.includes('__NUXT_DATA__')) {
      response.body = escapePayloadScriptTags([response.body])[0]
    }
  })
})
