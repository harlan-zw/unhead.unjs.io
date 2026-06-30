import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const BASE_URL = process.env.OG_BASE_URL || 'http://localhost:3456'
const SNAPSHOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '__snapshots__/og')

const OG_META_RE = /<meta\s+property="og:image"\s+content="([^"]+)"/

async function getOgImageUrl(path: string): Promise<string> {
  const res = await fetch(`${BASE_URL}${path}`, { redirect: 'follow' })
  if (!res.ok)
    throw new Error(`${path} returned ${res.status}`)
  const html = await res.text()
  const match = html.match(OG_META_RE)
  if (!match)
    throw new Error(`No og:image meta tag found for ${path}`)
  return match[1]
}

async function snapshot(path: string, filename: string) {
  const ogUrl = await getOgImageUrl(path)
  const res = await fetch(ogUrl)
  expect(res.status, `og image fetch for ${path}`).toBe(200)
  expect(res.headers.get('content-type')).toContain('image/png')
  const buf = Buffer.from(await res.arrayBuffer())
  expect(buf.byteLength, 'og image should be non-empty').toBeGreaterThan(1000)
  await mkdir(SNAPSHOT_DIR, { recursive: true })
  await writeFile(resolve(SNAPSHOT_DIR, filename), buf)
  return { buf, ogUrl }
}

describe('og image snapshots', () => {
  it('home', async () => {
    const { ogUrl } = await snapshot('/', 'home.png')
    expect(ogUrl).toContain('c_Home')
  })

  it('docs page (typescript framework)', async () => {
    const { ogUrl } = await snapshot('/docs/head/guides/plugins/canonical', 'docs-canonical-ts.png')
    expect(ogUrl).toContain('c_Unhead')
    expect(ogUrl).toContain('i-logos-typescript-icon')
  })

  it('docs page (vue framework, long description)', async () => {
    const { ogUrl } = await snapshot('/docs/vue/head/guides/plugins/template-params', 'docs-template-params-vue.png')
    expect(ogUrl).toContain('i-logos-vue')
  })
})
