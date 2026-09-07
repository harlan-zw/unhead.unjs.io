import { createApp, toWebHandler } from 'h3'
import { describe, expect, it } from 'vitest'
import redirects from '../server/middleware/redirects'

const app = createApp()
app.use(redirects)
const request = toWebHandler(app)

function redirectFor(path: string) {
  return request(new Request(`https://unhead.unjs.io${path}`))
}

describe('redirects middleware', () => {
  it('redirects the removed debugging guide to the guides overview', async () => {
    const res = await redirectFor('/docs/head/guides/debugging')
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('/docs/head/guides/get-started/overview')
  })

  it('redirects the trailing-slash variant of the debugging guide', async () => {
    const res = await redirectFor('/docs/head/guides/debugging/')
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('/docs/head/guides/get-started/overview')
  })

  it('preserves the query string on the debugging redirect', async () => {
    const res = await redirectFor('/docs/head/guides/debugging?utm_source=release-notes&utm_medium=docs')
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('/docs/head/guides/get-started/overview?utm_source=release-notes&utm_medium=docs')
  })

  it('still redirects the legacy typescript migration guide', async () => {
    const res = await redirectFor('/docs/typescript/head/guides/get-started/migration')
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('/docs/migration-guide/v3')
  })

  it('leaves existing docs pages alone', async () => {
    const res = await redirectFor('/docs/head/guides/get-started/overview')
    expect(res.status).toBe(404)
    expect(res.headers.get('location')).toBeNull()
  })
})
