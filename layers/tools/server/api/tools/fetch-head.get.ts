import { z } from 'zod'
import { checkFreeToolRateLimit } from '~~/server/utils/rate-limit'
import { fetchHeadHtml } from '../../utils/fetch-head'

const QuerySchema = z.object({
  url: z.string().trim().min(1).max(2048),
})
const HeadPattern = /<head[^>]*>([\s\S]*?)<\/head>/i

export default defineEventHandler(async (event) => {
  const query = QuerySchema.safeParse(getQuery(event))
  if (!query.success)
    throw createError({ statusCode: 400, statusMessage: 'A valid url parameter is required' })

  await checkFreeToolRateLimit(event)
  const html = await fetchHeadHtml(query.data.url)
  const head = html.match(HeadPattern)?.[1]

  if (!head)
    throw createError({ statusCode: 422, statusMessage: 'No <head> tag found in response' })

  return { head }
})
