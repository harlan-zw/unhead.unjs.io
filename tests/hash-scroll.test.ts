import { describe, expect, it, vi } from 'vitest'
import { resolveHashScrollPosition } from '../app/utils/hash-scroll'

describe('resolveHashScrollPosition', () => {
  it('resolves an identifier that starts with a digit without treating it as a selector', () => {
    const heading = {} as Element
    const getElementById = vi.fn(() => heading)

    expect(resolveHashScrollPosition('#4-server-defaults', {
      getElementById,
      getScrollMarginTop: () => 48,
    })).toEqual({
      el: heading,
      behavior: 'smooth',
      top: 48,
    })
    expect(getElementById).toHaveBeenCalledWith('4-server-defaults')
  })

  it('preserves the normalized hash supplied by Vue Router', () => {
    const getElementById = vi.fn(() => undefined)

    resolveHashScrollPosition('#%26', {
      getElementById,
      getScrollMarginTop: () => 0,
    })

    expect(getElementById).toHaveBeenCalledWith('%26')
  })
})
