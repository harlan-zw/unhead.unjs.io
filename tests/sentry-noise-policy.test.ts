import type { ModuleOptions } from '@harlan-zw/nuxt-sentry'
import type { ErrorReport, ErrorReportHint, ReportPolicy, ReportScope } from '@harlan-zw/nuxt-sentry/server'
import { createBeforeSend } from '@harlan-zw/nuxt-sentry/server'
import { createError } from 'h3'
import { describe, expect, it } from 'vitest'
import nuxtConfig from '../nuxt.config'

// The module resolves the site's `nuxtSentry.policy` once at build time into
// the serialisable `ReportPolicy` both runtime plugins hand to `beforeSend`.
// Resolve one scope the same way so these tests drive the wire format.
function resolvePolicy(policy: ModuleOptions['policy'] | undefined, scope: ReportScope): ReportPolicy {
  const configured = scope === 'client' ? policy?.dropClientStatus : policy?.dropServerStatus
  return {
    scope,
    dataCollection: 'scrubbed',
    dropStatus: (configured ?? []).map(status =>
      typeof status === 'number' ? { from: status, to: status } : { from: status[0], to: status[1] },
    ),
    dropTransient: policy?.dropTransient ?? true,
    ignoreErrors: (policy?.ignoreErrors ?? []).map(value => ({ _tag: 'literal' as const, value })),
    denyUrls: (policy?.denyUrls ?? []).map(pattern => ({
      _tag: 'pattern' as const,
      source: pattern.source,
      flags: pattern.flags.replace(/[gy]/g, ''),
    })),
    secretKeys: [],
  }
}

const declaredPolicy = nuxtConfig.nuxtSentry?.policy
const clientBeforeSend = createBeforeSend(resolvePolicy(declaredPolicy, 'client'))
const serverBeforeSend = createBeforeSend(resolvePolicy(declaredPolicy, 'server'))

function errorReport(error: { name: string, message: string }): ErrorReport {
  return { exception: { values: [{ type: error.name, value: error.message }] } }
}

function reportWithStackFrames(filenames: string[]): ErrorReport {
  return {
    exception: {
      values: [{
        type: 'Error',
        value: 'Session verification failed',
        stacktrace: { frames: filenames.map(filename => ({ filename })) },
      }],
    },
  }
}

describe('sentry noise policy', () => {
  it('drops the expected fatal 404 that stale docs URLs throw', () => {
    const error = createError({ statusCode: 404, statusMessage: 'Page not found: /docs/head/guides/debugging', fatal: true })
    const hint: ErrorReportHint = { originalException: error }
    expect(clientBeforeSend(errorReport(error), hint)).toBeNull()
    expect(serverBeforeSend(errorReport(error), hint)).toBeNull()
  })

  it('drops a serialized 404 report that reaches beforeSend without its original error', () => {
    const report = errorReport({ name: 'Error', message: 'Page not found: /docs/head/guides/debugging' })
    expect(clientBeforeSend(report)).toBeNull()
    expect(serverBeforeSend(report)).toBeNull()
  })

  it('keeps unexpected client errors', () => {
    const error = new TypeError('Cannot read properties of null (reading \'head\')')
    const event = clientBeforeSend(errorReport(error), { originalException: error })
    expect(event?.exception?.values?.[0]?.value).toBe(error.message)
  })

  it('keeps server errors that are not expected noise', () => {
    const error = createError({ statusCode: 500, statusMessage: 'Database unavailable' })
    const event = serverBeforeSend(errorReport(error), { originalException: error })
    expect(event?.exception?.values?.[0]?.value).toBe(error.message)
  })

  it('drops a report whose whole stack is served by a local dev origin', () => {
    const localFrameUrls = [
      'http://localhost:3000/_nuxt/entry.js',
      'http://127.0.0.1:3000/_nuxt/entry.js',
      'http://10.0.0.5:3000/_nuxt/entry.js',
      'http://192.168.1.10:3000/_nuxt/entry.js',
      'http://172.16.5.4:3000/_nuxt/entry.js',
      'http://[::1]:3000/_nuxt/entry.js',
      'http://harlan-macbook.local:3000/_nuxt/entry.js',
      'localhost:3000/app/pages/index.vue',
      '192.168.1.10:3000/app/pages/index.vue',
    ]
    for (const filename of localFrameUrls) {
      const report = reportWithStackFrames([filename])
      expect(clientBeforeSend(report), filename).toBeNull()
      expect(serverBeforeSend(report), filename).toBeNull()
    }
  })

  it('keeps a report with any production frame', () => {
    const productionReport = reportWithStackFrames(['https://unhead.unjs.io/_nuxt/entry.js'])
    expect(clientBeforeSend(productionReport)?.exception?.values?.[0]?.value).toBe('Session verification failed')
    expect(serverBeforeSend(productionReport)?.exception?.values?.[0]?.value).toBe('Session verification failed')
  })

  it('keeps a mixed stack that has one production frame', () => {
    const mixedReport = reportWithStackFrames([
      'http://192.168.1.10:3000/_nuxt/entry.js',
      'https://unhead.unjs.io/_nuxt/entry.js',
    ])
    expect(clientBeforeSend(mixedReport)?.exception?.values?.[0]?.value).toBe('Session verification failed')
  })

  it('keeps a frame from a host outside the private 172 range', () => {
    const publicReport = reportWithStackFrames(['http://172.15.5.4:3000/_nuxt/entry.js'])
    expect(clientBeforeSend(publicReport)?.exception?.values?.[0]?.value).toBe('Session verification failed')
  })
})
