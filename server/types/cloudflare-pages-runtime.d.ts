/// <reference types="@cloudflare/workers-types" />

declare module '#nitro/virtual/public-assets' {
  export function isPublicAssetURL(path: string): boolean
}

declare module '#unhead-cloudflare-pages-runtime' {
  const worker: {
    fetch: (request: Request, env: Cloudflare.Env, context: ExecutionContext) => Promise<Response>
    scheduled: (event: ScheduledController, env: Cloudflare.Env, context: ExecutionContext) => void
  }

  export default worker
}
