export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)

  return {
    hasOAuthClientId: !!config.oauth?.github?.clientId,
    hasOAuthClientSecret: !!config.oauth?.github?.clientSecret,
    hasSessionPassword: !!config.session?.password,
    oauthClientIdPrefix: config.oauth?.github?.clientId?.slice(0, 8) || 'not-set',
    oauthRedirectUrl: config.oauth?.github?.redirectUrl || 'not-set',
    // Analytics config
    hasCloudflareAccountId: !!config.cloudflareAccountId,
    hasCloudflareAnalyticsToken: !!config.cloudflareAnalyticsApiToken,
    cloudflareAccountIdPrefix: config.cloudflareAccountId?.slice(0, 8) || 'not-set',
  }
})
