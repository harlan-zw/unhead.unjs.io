/// <reference types="@cloudflare/workers-types" />
import type { H3Event } from 'h3'
import { toolLookups } from '../database/schema'
import { useDB } from './db'

type ToolName = 'meta-tag-generator' | 'schema-generator'
type ToolAction = 'view' | 'use' | 'copy' | 'reset' | 'preset'

export interface AnalyticsDataPoint {
  blobs: string[]
  doubles: number[]
  indexes?: string[]
}

export function getAnalyticsEngine(event: H3Event): AnalyticsEngineDataset | undefined {
  return (event.context.cloudflare?.env as { TOOL_ANALYTICS?: AnalyticsEngineDataset } | undefined)?.TOOL_ANALYTICS
}

export function trackToolUsage(
  event: H3Event,
  toolId: ToolName,
  action: ToolAction,
  metadata?: {
    label?: string // e.g. preset name, framework, output mode
    responseTime?: number
    error?: boolean
  },
) {
  const analytics = getAnalyticsEngine(event)
  if (!analytics)
    return

  const sessionId = getCookie(event, 'analytics-session') || crypto.randomUUID()
  const timestamp = Date.now()

  const dataPoint: AnalyticsDataPoint = {
    blobs: [
      'tool', // category
      toolId,
      action,
      sessionId,
      metadata?.error ? 'error' : 'success',
      metadata?.label || '',
    ],
    doubles: [
      timestamp,
      metadata?.responseTime || 0,
    ],
    indexes: [sessionId.substring(0, 8)],
  }

  analytics.writeDataPoint(dataPoint)
}

export function getTimeRangeFilter(range: string): { value: string, unit: string } {
  const intervals: Record<string, { value: string, unit: string }> = {
    '1h': { value: '1', unit: 'HOUR' },
    '24h': { value: '24', unit: 'HOUR' },
    '7d': { value: '7', unit: 'DAY' },
    '30d': { value: '30', unit: 'DAY' },
    '90d': { value: '90', unit: 'DAY' },
  }
  return intervals[range] || intervals['24h']
}

export async function trackToolLookup(
  event: H3Event,
  tool: ToolName,
  action: ToolAction,
  label?: string,
) {
  const db = useDB(event)
  const sessionId = getCookie(event, 'analytics-session')

  await db.insert(toolLookups).values({
    sessionId,
    tool,
    action,
    label,
  })
}
