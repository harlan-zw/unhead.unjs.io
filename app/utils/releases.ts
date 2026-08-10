const MarkdownFencePattern = /^\s*(`{3,}|~{3,})/
const MarkdownHeadingPattern = /^ {0,3}#{1,6}([ \t].*)$/
const MarkdownLinkPattern = /^\[[^\]]+\]\([^)]+\)$/

export function normalizeReleaseBodyHeadings(markdown: string): string {
  let activeFence: '`' | '~' | undefined

  return markdown.split('\n').map((line) => {
    const fence = MarkdownFencePattern.exec(line)?.[1]
    if (fence) {
      const marker = fence[0] as '`' | '~'
      activeFence = activeFence === marker ? undefined : activeFence || marker
      return line
    }

    if (activeFence)
      return line

    const heading = MarkdownHeadingPattern.exec(line)
    if (!heading)
      return line

    const content = heading[1]!.trimStart()
    const linkedContent = content.replaceAll('&nbsp;', '').trim()
    if (MarkdownLinkPattern.test(linkedContent))
      return linkedContent

    return `### ${content}`
  }).join('\n')
}
