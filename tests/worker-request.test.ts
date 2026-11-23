import { describe, expect, it } from 'vitest'
import { extendRenderLifetime, getLeadingSlashRedirect } from '../server/utils/worker-request'

describe('getLeadingSlashRedirect', () => {
  it.each([
    ['https://unhead.unjs.io//', 'https://unhead.unjs.io/'],
    ['https://unhead.unjs.io///docs/head?tab=vue', 'https://unhead.unjs.io/docs/head?tab=vue'],
    ['https://unhead.unjs.io//evil.example/path', 'https://unhead.unjs.io/evil.example/path'],
  ])('redirects %s to %s on the same origin', (input, expected) => {
    expect(getLeadingSlashRedirect(new URL(input))?.href).toBe(expected)
  })

  it.each([
    'https://unhead.unjs.io/',
    'https://unhead.unjs.io/docs//head',
  ])('leaves %s alone', (input) => {
    expect(getLeadingSlashRedirect(new URL(input))).toBeUndefined()
  })
})

describe('extendRenderLifetime', () => {
  it('keeps the request alive until a pending render settles', async () => {
    const registered: Promise<unknown>[] = []
    let finish: (response: Response) => void = () => {}
    const response = extendRenderLifetime(
      { waitUntil: promise => registered.push(promise) },
      () => new Promise<Response>((resolve) => {
        finish = resolve
      }),
    )
    let released = false
    void registered[0]?.then(() => {
      released = true
    })

    await new Promise(resolve => setTimeout(resolve, 10))
    expect(released).toBe(false)

    finish(new Response('rendered'))
    expect(await (await response).text()).toBe('rendered')
    await registered[0]
    expect(released).toBe(true)
  })

  it('rejects for the caller and still releases the request', async () => {
    const registered: Promise<unknown>[] = []
    const failure = new Error('render failed')
    const response = extendRenderLifetime(
      { waitUntil: promise => registered.push(promise) },
      () => Promise.reject(failure),
    )

    await expect(response).rejects.toBe(failure)
    await expect(registered[0]).resolves.toBeUndefined()
  })
})
