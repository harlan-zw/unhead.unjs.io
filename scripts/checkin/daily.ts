import type { ReportIdentity } from '@harlan-zw/nuxt-checkin/server'
import process from 'node:process'
import { checkReport, defineCheck, runChecks, unavailable } from '@harlan-zw/nuxt-checkin/server'
import { defineSentryCheck } from '@harlan-zw/nuxt-sentry/checks'

export interface DailyCheckinOptions {
  adminCookie?: string
  sentryToken?: string
  sentryOrg?: string
  deployment?: string
}

export function runDailyCheckin(options: DailyCheckinOptions, request: typeof fetch = fetch, clock = () => new Date()) {
  const identity: ReportIdentity = { site: 'unhead.unjs.io', environment: 'production', deployment: options.deployment || 'unknown' }
  return runChecks([
    defineCheck({
      id: 'unhead.report',
      async run({ signal }) {
        if (!options.adminCookie || !options.deployment)
          return unavailable('Admin session cookie and expected deployment are required.')
        const response = await request('https://unhead.unjs.io/api/admin/daily-health', {
          headers: { cookie: options.adminCookie },
          signal,
          redirect: 'error',
        })
        if (!response.ok)
          return unavailable(`Daily health request returned HTTP ${response.status}.`)
        return checkReport(await response.json(), { identity, required: ['unhead.docs-v3', 'unhead.docs-v2', 'unhead.ai-ready'], maxAgeMs: 5 * 60_000, now: clock() })
      },
    }),
    options.sentryOrg
      ? defineSentryCheck({ id: 'unhead.sentry', org: options.sentryOrg, project: 'unhead' })
      : defineCheck({ id: 'unhead.sentry', run: () => unavailable('Sentry organization is required.') }),
  ], {
    now: clock(),
    identity,
    required: ['unhead.report', 'unhead.sentry'],
    credentials: { sentry: options.sentryToken || '' },
    timeoutMs: 65_000,
    totalTimeoutMs: 70_000,
  })
}

if (import.meta.main) {
  const report = await runDailyCheckin({
    adminCookie: process.env.CHECKIN_ADMIN_COOKIE,
    deployment: process.env.CHECKIN_DEPLOYMENT,
    sentryToken: process.env.SENTRY_AUTH_TOKEN,
    sentryOrg: process.env.SENTRY_ORG,
  })
  console.log(JSON.stringify(report, null, 2))
  process.exitCode = report.severity === 'fail' ? 2 : report.severity === 'warn' || report.coverage === 'incomplete' ? 1 : 0
}
