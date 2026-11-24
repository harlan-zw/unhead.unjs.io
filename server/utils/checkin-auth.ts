import type { H3Event } from 'h3'
import { timingSafeEqual } from 'node:crypto'
import { HTTPError } from 'h3'

export function requireCheckinAuth(event: H3Event, token: string) {
  const headers = { 'cache-control': 'no-store' }
  event.res.headers.set('cache-control', headers['cache-control'])
  const authorization = event.req.headers.get('authorization')
  const expected = Buffer.from(`Bearer ${token}`)
  const supplied = Buffer.from(authorization ?? '')
  if (event.req.method !== 'GET' || event.url.pathname !== '/api/internal/checkin'
    || !token || expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    throw new HTTPError({ status: 401, statusText: 'Unauthorized', headers })
  }
}
