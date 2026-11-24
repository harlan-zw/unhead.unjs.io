import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from 'nitropack/runtime'
import { requireCheckinAuth } from '../../utils/checkin-auth'
import { runDailyCheckin } from '../../utils/daily-checkin'

export default defineEventHandler(async (event) => {
  requireCheckinAuth(event, useRuntimeConfig(event).checkinToken)
  return runDailyCheckin(event)
})
