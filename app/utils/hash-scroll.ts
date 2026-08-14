export interface HashScrollDependencies {
  getElementById: (id: string) => Element | null | undefined
  getScrollMarginTop: (element: Element) => number
}

export interface HashScrollPosition {
  el: Element
  behavior: ScrollBehavior
  top: number
}

type HashTarget
  = | { _tag: 'valid', id: string }
    | { _tag: 'invalid' }

export function parseHashTarget(hash: string): HashTarget {
  if (!hash.startsWith('#') || hash.length === 1)
    return { _tag: 'invalid' }

  return { _tag: 'valid', id: hash.slice(1) }
}

export function resolveHashScrollPosition(
  hash: string,
  dependencies: HashScrollDependencies,
): HashScrollPosition | undefined {
  const target = parseHashTarget(hash)
  if (target._tag === 'invalid')
    return

  const element = dependencies.getElementById(target.id)
  if (!element)
    return

  return {
    el: element,
    behavior: 'smooth',
    top: dependencies.getScrollMarginTop(element),
  }
}
