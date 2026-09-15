import type { ExternalOptions } from '@harlan-zw/nuxt-checkin/external'

export const externalCheckin = {
  prompts: [
    { id: 'site.setup', prompt: 'Before collection, load ~/.config/harlan-checkin/unhead.unjs.io.env without printing tokens. Preserve DAILY_CHECKIN_DIR. Configure SENTRY_ORG=harlan-zw and SENTRY_AUTH_TOKEN externally. Set CHECKIN_DEPLOYMENT from the active Cloudflare Pages build commit. Keep existing admin authentication separate from the read-only report token.' },
    { id: 'site.analysis', prompt: 'The report requires both supported documentation versions and the AI Ready database. Use existing documentation routes to confirm rendering after a collection failure. Check Pages deployment and content synchronization before changing documentation sources. Keep local previews separate from production evidence. Expected stale-documentation 404s and local preview errors follow existing Sentry policy. No system-health email exists. Do not create one or send test messages. Never deploy, mutate production data, or send messages during check-in.' },
  ],
  identity: { site: 'unhead.unjs.io', environment: 'production', deploymentEnv: 'CHECKIN_DEPLOYMENT' },
  required: ['unhead.report', 'unhead.sentry'],
  credentials: { sentry: 'SENTRY_AUTH_TOKEN' },
  save: { dir: 'docs/ops/checkins', baseline: 'daily', stateFile: 'state.json', timestampKey: 'lastRunAt' },
  timeoutMs: 65000,
  totalTimeoutMs: 70000,
} satisfies ExternalOptions
