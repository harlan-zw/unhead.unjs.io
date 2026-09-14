import { defineReportCheck } from '@harlan-zw/nuxt-checkin/external'

export default defineReportCheck({
  id: 'unhead.report',
  url: 'https://unhead.unjs.io/api/admin/daily-health',
  tokenEnv: 'CHECKIN_ADMIN_COOKIE',
  deploymentEnv: 'CHECKIN_DEPLOYMENT',
  site: 'unhead.unjs.io',
  environment: 'production',
  authHeader: 'Cookie',
  required: ['unhead.docs-v3', 'unhead.docs-v2', 'unhead.ai-ready'],
  maxAgeMs: 5 * 60_000,
})
