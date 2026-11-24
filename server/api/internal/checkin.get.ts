import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from 'nuxt/server'
import { requireCheckinAuth } from '../../utils/checkin-auth'
import { runDailyCheckin } from '../../utils/daily-checkin'

export default defineEventHandler(async (event) => {
  requireCheckinAuth(event, useRuntimeConfig().checkinToken)
  return runDailyCheckin(event)
})
