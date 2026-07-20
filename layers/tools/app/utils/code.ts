export function renderPlainCode(code: string): string {
  const escaped = code
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
  return `<pre><code>${escaped}</code></pre>`
}
