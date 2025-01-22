/// <reference path="../../../@types/passport-openidconnect.d.ts" />
/// <reference path="../../../@types/express-session.d.ts" />
import {
    ClairdashError,
    OpenIdIdentityIssuerType,
    OpenIdUser,
    UnexpectedServerError,
} from '@clairdash/common';
import * as Sentry from '@sentry/node';
import { Request, RequestHandler } from 'express';
import { generators, Issuer, UserinfoResponse } from 'openid-client';
import { Strategy } from 'passport-strategy';
import { URL } from 'url';
import { clairdashConfig } from '../../../config/clairdashConfig';
import Logger from '../../../logging/logger';
import { getLoginHint } from '../utils';

const createOpenIdUserFromUserInfo = (
    userInfo: UserinfoResponse,
    issuer: string,
    issuerType: OpenIdIdentityIssuerType,
    fail: OpenIDClientOktaStrategy['fail'],
) => {
    if (!userInfo.email || !userInfo.sub) {
        return fail(
            {
                message: 'Could not parse authentication token',
            },
            401,
        );
    }

    const displayName = userInfo.name || '';
    const [fallbackFirstName, fallbackLastName] = displayName.split(' ');
    const firstName = userInfo.given_name || fallbackFirstName;
    const lastName = userInfo.family_name || fallbackLastName;

    const openIdUser: OpenIdUser = {
        openId: {
            email: userInfo.email,
            issuer: issuer || '',
            subject: userInfo.sub,
            firstName,
            lastName,
            issuerType: issuerType || '',
        },
    };

    if (userInfo?.groups && Array.isArray(userInfo.groups)) {
        openIdUser.openId.groups = userInfo.groups;
    }

    return openIdUser;
};

const setupOktaIssuerClient = async () => {
    const { okta } = clairdashConfig.auth;

    const oktaIssuerUri = new URL(
        okta.authorizationServerId
            ? `/oauth2/${okta.authorizationServerId}`
            : '',
        `https://${okta.oktaDomain}`,
    ).href;

    const oktaIssuer = await Issuer.discover(oktaIssuerUri);

    const redirectUri = new URL(
        `/api/v1${clairdashConfig.auth.okta.callbackPath}`,
        clairdashConfig.siteUrl,
    ).href;

    const client = new oktaIssuer.Client({
        client_id: okta.oauth2ClientId ?? '',
        client_secret: okta.oauth2ClientSecret,
        redirect_uris: [redirectUri],
        response_types: ['code'],
    });

    return client;
};

export class OpenIDClientOktaStrategy extends Strategy {
    async authenticate(req: Request) {
        try {
            if (req.query.error) {
                if (req.query.error === 'access_denied') {
                    return this.fail(
                        {
                            message:
                                'Your Okta account doesn’t currently have access to Clairdash. Please contact support or your Okta administrator to enable access.',
                        },
                        401,
                    );
                }
                const errorMessage = `Okta authentication failed unexpectedly: ${req.query.error}, ${req.query.error_description}`;
                Sentry.captureException(
                    new UnexpectedServerError(errorMessage),
                );
                Logger.error(errorMessage);

                return this.fail(
                    {
                        message:
                            'Okta authentication failed. Please contact support.',
                    },
                    401,
                );
            }

            const client = await setupOktaIssuerClient();

            const redirectUri = new URL(
                `/api/v1${clairdashConfig.auth.okta.callbackPath}`,
                clairdashConfig.siteUrl,
            ).href;

            const params = client.callbackParams(req);
            const tokenSet = await client.callback(redirectUri, params, {
                code_verifier: req.session.oauth?.codeVerifier,
                state: req.session.oauth?.state,
            });

            const userInfo = tokenSet.access_token
                ? await client.userinfo(tokenSet.access_token)
                : undefined;

            if (!userInfo) return this.fail(401);

            try {
                const { inviteCode } = req.session.oauth || {};
                req.session.oauth = {};

                const openIdUser = createOpenIdUserFromUserInfo(
                    userInfo,
                    tokenSet.claims().iss,
                    OpenIdIdentityIssuerType.OKTA,
                    this.fail,
                );

                if (openIdUser) {
                    const user = await req.services
                        .getUserService()
                        .loginWithOpenId(openIdUser, req.user, inviteCode);
                    return this.success(user);
                }

                return this.fail(
                    { message: 'Unexpected error processing user information' },
                    401,
                );
            } catch (e) {
                if (e instanceof ClairdashError) {
                    return this.fail({ message: e.message }, 401);
                }
                Logger.warn(`Unexpected error while authorizing user: ${e}`);
                return this.error(e);
            }
        } catch (err) {
            return this.error(err);
        }
    }
}

export const initiateOktaOpenIdLogin: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const client = await setupOktaIssuerClient();

        const redirectUri = new URL(
            `/api/v1${clairdashConfig.auth.okta.callbackPath}`,
            clairdashConfig.siteUrl,
        ).href;

        const state = generators.state();
        const codeVerifier = generators.codeVerifier();
        const codeChallenge = generators.codeChallenge(codeVerifier);

        const authorizationUrl = client.authorizationUrl({
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: 'openid profile email'.concat(
                clairdashConfig.auth.okta.extraScopes
                    ? ` ${clairdashConfig.auth.okta.extraScopes}`
                    : '',
            ),
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            login_hint: getLoginHint(req),
            state,
        });

        req.session.oauth = {
            ...(req.session.oauth ?? {}),
            codeVerifier,
            state,
        };

        return res.redirect(authorizationUrl);
    } catch (e) {
        return next(e);
    }
};

export const isOktaPassportStrategyAvailableToUse = !!(
    clairdashConfig.auth.okta.oauth2ClientId &&
    clairdashConfig.auth.okta.oauth2ClientSecret &&
    clairdashConfig.auth.okta.oauth2Issuer &&
    clairdashConfig.auth.okta.oktaDomain
);
