export function humanNumber(s: string | number) {
  return Number(s).toLocaleString('en-US', { notation: 'compact', compactDisplay: 'short' })
}

export function safeDate(value: unknown): Date | undefined {
  if (!value)
    return undefined
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime()))
    return undefined
  return d
}

export function formatArticleDate(value: unknown, style: 'long' | 'short' = 'long'): string {
  const d = safeDate(value)
  if (!d)
    return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: style, day: 'numeric' })
}

export function toISODateTime(value: unknown): string | undefined {
  const d = safeDate(value)
  if (!d)
    return undefined
  return `${d.toISOString().split('T')[0]}T12:00:00Z`
}
