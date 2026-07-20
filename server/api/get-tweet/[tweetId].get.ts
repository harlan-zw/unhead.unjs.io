import { z } from 'zod'
import { upstreamCacheTtl, withUpstreamCache } from '~~/server/utils/upstream-cache'

const TweetSchema = z.object({
  text: z.string().min(1),
}).passthrough()

export default defineEventHandler(async (event) => {
  const tweetId = event.context.params?.tweetId

  if (!tweetId)
    return sendError(event, new Error('Missing tweetId'))

  const SYNDICATION_URL = 'https://cdn.syndication.twimg.com'

  const url = new URL(`${SYNDICATION_URL}/tweet-result`)

  url.searchParams.set('id', tweetId)
  url.searchParams.set('lang', 'en')
  url.searchParams.set('token', '45je2ktobmo')
  url.searchParams.set(
    'features',
    [
      'tfw_timeline_list:',
      'tfw_follower_count_sunset:true',
      'tfw_tweet_edit_backend:on',
      'tfw_refsrc_session:on',
      'tfw_show_business_verified_badge:on',
      'tfw_duplicate_scribes_to_settings:on',
      'tfw_show_blue_verified_badge:on',
      'tfw_legacy_timeline_sunset:true',
      'tfw_show_gov_verified_badge:on',
      'tfw_show_business_affiliate_badge:on',
      'tfw_tweet_edit_frontend:on',
    ].join(';'),
  )

  return withUpstreamCache(event, {
    key: tweetId,
    maxAge: upstreamCacheTtl.day,
    name: 'twitter:tweet',
    schema: TweetSchema,
    staleMaxAge: upstreamCacheTtl.week,
  }, () => $fetch<unknown>(url.toString(), { responseType: 'json' }))
})
