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

  it('decodes an encoded fragment before finding its heading', () => {
    const getElementById = vi.fn(() => undefined)

    resolveHashScrollPosition('#server%20defaults', {
      getElementById,
      getScrollMarginTop: () => 0,
    })

    expect(getElementById).toHaveBeenCalledWith('server defaults')
  })
})
