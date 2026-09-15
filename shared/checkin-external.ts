import type { ExternalOptions } from '@harlan-zw/nuxt-checkin/external'

export const externalCheckin = {
  identity: { site: 'unhead.unjs.io', environment: 'production', deploymentEnv: 'CHECKIN_DEPLOYMENT' },
  required: ['unhead.report', 'unhead.sentry'],
  credentials: { sentry: 'SENTRY_AUTH_TOKEN' },
  save: { dir: 'docs/ops/checkins', dirEnv: 'DAILY_CHECKIN_DIR', baseline: 'daily', stateFile: 'state.json', timestampKey: 'lastRunAt' },
  timeoutMs: 65000,
  totalTimeoutMs: 70000,
} satisfies ExternalOptions
