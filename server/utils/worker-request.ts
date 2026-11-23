/// <reference types="@cloudflare/workers-types" />

/**
 * The same-origin URL a request should be redirected to when its path starts
 * with more than one slash, or `undefined` when the path is already canonical.
 *
 * A path such as `//` reads as a protocol-relative URL with an empty host, so
 * Nuxt's `new URL(event.path, origin)` throws and the request answers 500.
 * The target keeps the request origin, so it can never point at another host.
 */
export function getLeadingSlashRedirect(url: URL): URL | undefined {
  if (!url.pathname.startsWith('//'))
    return undefined
  return new URL(`/${url.pathname.replace(/^\/+/, '')}${url.search}`, url.origin)
}

/**
 * Starts a render and registers it with `ctx.waitUntil`, so the request stays
 * alive until the render settles even after its client disconnects.
 *
 * Nuxt Content's integrity check and Nitro's cached functions share one
 * in-flight promise across every request in an isolate. Cloudflare cancels a
 * disconnected request's pending work, so a promise that request created can
 * never settle, and every later request awaiting it fails.
 */
export function extendRenderLifetime(
  context: Pick<ExecutionContext, 'waitUntil'>,
  render: () => Promise<Response>,
): Promise<Response> {
  const response = render()
  // The caller receives any rejection; this copy only extends the lifetime.
  context.waitUntil(response.then(() => undefined, () => undefined))
  return response
}
