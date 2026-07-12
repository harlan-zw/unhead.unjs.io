import { describe, expect, it } from 'vitest'
import {
  desiredObservability,
  LOG_HEAD_SAMPLING_RATE,
  matchesDesiredObservability,
} from '../scripts/configure-worker-observability.mjs'

describe('worker observability policy', () => {
  it('changes only observability while preserving existing nested destinations', () => {
    const current = {
      enabled: true,
      head_sampling_rate: 1,
      logs: {
        enabled: true,
        head_sampling_rate: 1,
        invocation_logs: true,
        persist: true,
        destinations: ['cloudflare'],
      },
      traces: { enabled: false, destinations: ['trace-sink'] },
    }

    const desired = desiredObservability(current)

    expect(desired).toEqual({
      enabled: true,
      head_sampling_rate: LOG_HEAD_SAMPLING_RATE,
      logs: {
        enabled: true,
        head_sampling_rate: LOG_HEAD_SAMPLING_RATE,
        invocation_logs: true,
        persist: true,
        destinations: ['cloudflare'],
      },
      traces: { enabled: false, destinations: ['trace-sink'] },
    })
    expect(matchesDesiredObservability(desired)).toBe(true)
    expect(matchesDesiredObservability(current)).toBe(false)
  })
})
