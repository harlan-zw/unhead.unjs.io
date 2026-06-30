import type { IncomingMessage, ServerResponse } from 'node:http'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join } from 'node:path'

const PORT = Number(process.argv.find((_, i, a) => a[i - 1] === '--port') ?? 3000)
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
}

const ROOT = join(import.meta.dirname, '..')

const RequestPattern = /^\/(minimal|medium|heavy)\/(.+\.html)$/

function resolve(url: string): string | null {
  const cleaned = url.split('?')[0].split('#')[0]
  if (cleaned.startsWith('/assets/'))
    return join(ROOT, 'pages', cleaned)
  // Map /minimal/optimal.html -> pages/minimal/optimal.html
  const match = cleaned.match(RequestPattern)
  if (match)
    return join(ROOT, 'pages', match[1], match[2])
  // Root-level files (favicon, apple-touch-icon)
  if (cleaned === '/favicon.ico' || cleaned === '/apple-touch-icon.png')
    return join(ROOT, 'pages', cleaned)
  if (cleaned === '/')
    return null
  return null
}

async function handler(req: IncomingMessage, res: ServerResponse) {
  const filePath = resolve(req.url ?? '/')

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not Found')
    return
  }

  const ext = extname(filePath)
  const contentType = MIME_TYPES[ext] ?? 'application/octet-stream'

  const content = await readFile(filePath).catch(() => null)
  if (!content) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not Found')
    return
  }

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  })
  res.end(content)
}

const server = createServer(handler)
server.listen(PORT, () => {
  console.log(`Serving test pages at http://localhost:${PORT}`)
  console.log(`Pages:  http://localhost:${PORT}/{minimal,medium,heavy}/{optimal,common-bad,random,worst}.html`)
  console.log(`Assets: http://localhost:${PORT}/assets/...`)
})
