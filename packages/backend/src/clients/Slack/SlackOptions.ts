import { slackRequiredScopes } from '@clairdash/common';
import { clairdashConfig } from '../../config/clairdashConfig';

export const slackOptions = {
    signingSecret: clairdashConfig.slack?.signingSecret || '',
    clientId: clairdashConfig.slack?.clientId || '',
    clientSecret: clairdashConfig.slack?.clientSecret || '',
    stateSecret: clairdashConfig.slack?.stateSecret || '',
    scopes: slackRequiredScopes,

    // Slack only allow https on redirections
    // When testing locally on http://localhost:3000, replace again https:// with http:// after redirection happens
    redirectUri: `${clairdashConfig.siteUrl.replace(
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
