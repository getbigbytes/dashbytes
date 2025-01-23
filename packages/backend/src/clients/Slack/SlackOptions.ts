import { slackRequiredScopes } from '@bigbytes/common';
import { bigbytesConfig } from '../../config/bigbytesConfig';

export const slackOptions = {
    signingSecret: bigbytesConfig.slack?.signingSecret || '',
    clientId: bigbytesConfig.slack?.clientId || '',
    clientSecret: bigbytesConfig.slack?.clientSecret || '',
    stateSecret: bigbytesConfig.slack?.stateSecret || '',
    scopes: slackRequiredScopes,

    // Slack only allow https on redirections
    // When testing locally on http://localhost:3000, replace again https:// with http:// after redirection happens
    redirectUri: `${bigbytesConfig.siteUrl.replace(
        'http://',
        'https://',
    )}/api/v1/slack/oauth_redirect`,
    installerOptions: {
        directInstall: true,
        // The default value for redirectUriPath is ‘/slack/oauth_redirect’, but we override it to match the existing redirect route in the Slack app manifest files.
        redirectUriPath: '/api/v1/slack/oauth_redirect',
        userScopes: [],
    },
};
