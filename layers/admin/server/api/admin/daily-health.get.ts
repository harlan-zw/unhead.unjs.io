import { runDailyCheckin } from '~~/server/utils/daily-checkin'
import { requireAdminAuth } from '../../utils/admin'

export default defineEventHandler(async (event) => {
  await requireAdminAuth(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return runDailyCheckin(event)
})
