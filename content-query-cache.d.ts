declare module '#unhead-content-query-original' {
  import type { EventHandler } from 'h3'

  /**
   * Build-time alias to the Nuxt Content query handler captured by
   * nuxt.config.ts. Nitro resolves it through `nitro.options.alias`.
   */
  const handler: EventHandler
  export default handler
}

declare module '#content/manifest' {
  /**
   * Fallback types for the build-generated @nuxt/content manifest template.
   * When TypeScript resolves the generated file instead, those types win.
   */
  export const checksums: Record<string, string>
}
