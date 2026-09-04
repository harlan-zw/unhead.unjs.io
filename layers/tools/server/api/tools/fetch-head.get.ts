import { z } from 'zod'
import { checkFreeToolRateLimit } from '~~/server/utils/rate-limit'
import { fetchHeadHtml, isFetchHeadUpstreamError } from '../../utils/fetch-head'

const QuerySchema = z.object({
  url: z.string().trim().min(1).max(2048),
})
const HeadPattern = /<head[^>]*>([\s\S]*?)<\/head>/i

export default defineEventHandler(async (event) => {
  const query = QuerySchema.safeParse(getQuery(event))
  if (!query.success)
    throw createError({ statusCode: 400, statusMessage: 'A valid url parameter is required' })

  await checkFreeToolRateLimit(event)
  let html: string
  try {
    html = await fetchHeadHtml(query.data.url)
  }
  catch (error) {
    // A failing user-supplied upstream is an expected tool result. The Nitro
    // error hook reports every thrown H3 error 500+ to Sentry, so answer
    // these directly instead of throwing.
    if (!isFetchHeadUpstreamError(error))
      throw error
    setResponseStatus(event, error.statusCode, error.statusMessage)
    return { statusCode: error.statusCode, statusMessage: error.statusMessage }
  }
  const head = html.match(HeadPattern)?.[1]

  if (!head)
    throw createError({ statusCode: 422, statusMessage: 'No <head> tag found in response' })

  return { head }
})
