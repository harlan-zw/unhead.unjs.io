export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)

  return {
    hasOAuthClientId: !!config.oauth?.github?.clientId,
    hasOAuthClientSecret: !!config.oauth?.github?.clientSecret,
    hasSessionPassword: !!config.session?.password,
    oauthClientIdPrefix: config.oauth?.github?.clientId?.slice(0, 8) || 'not-set',
    // Check if redirect URL is being required
    oauthRedirectUrl: config.oauth?.github?.redirectUrl || 'not-set',
  }
})
