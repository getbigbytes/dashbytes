/// <reference path="../../@types/passport-openidconnect.d.ts" />
/// <reference path="../../@types/express-session.d.ts" />
import {
    AuthorizationError,
    DeactivatedAccountError,
    BigbytesMode,
} from '@bigbytes/common';
import { Request, RequestHandler } from 'express';
import passport from 'passport';
import { URL } from 'url';
import { bigbytesConfig } from '../../config/bigbytesConfig';

export const isAuthenticated: RequestHandler = (req, res, next) => {
    if (req.user?.userUuid) {
        if (req.user.isActive) {
            next();
        } else {
            // Destroy session if user is deactivated and return error
            req.session.destroy((err) => {
                if (err) {
                    next(err);
                } else {
                    next(new DeactivatedAccountError());
                }
            });
        }
    } else {
        next(new AuthorizationError(`Failed to authorize user`));
    }
};

export const unauthorisedInDemo: RequestHandler = (req, res, next) => {
    if (bigbytesConfig.mode === BigbytesMode.DEMO) {
        throw new AuthorizationError('Action not available in demo');
    } else {
        next();
    }
};

export const allowApiKeyAuthentication: RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
        return;
    }

    if (!bigbytesConfig.auth.pat.enabled) {
        throw new AuthorizationError('Personal access tokens are disabled');
    }
    passport.authenticate('headerapikey', { session: false })(req, res, next);
};

export const storeOIDCRedirect: RequestHandler = (req, res, next) => {
    const { redirect, inviteCode, isPopup } = req.query;
    req.session.oauth = {};

    if (typeof inviteCode === 'string') {
        req.session.oauth.inviteCode = inviteCode;
    }
    if (typeof redirect === 'string') {
        try {
            const redirectUrl = new URL(redirect, bigbytesConfig.siteUrl);
            const originUrl = new URL(bigbytesConfig.siteUrl);
            if (
                redirectUrl.host === originUrl.host ||
                process.env.NODE_ENV === 'development'
            ) {
                req.session.oauth.returnTo = redirectUrl.href;
            }
        } catch (e) {
            next(); // fail silently if we can't parse url
        }
    }
    if (typeof isPopup === 'string' && isPopup === 'true') {
        req.session.oauth.isPopup = true;
    }
    next();
};

export const getOidcRedirectURL =
    (isSuccess: boolean) =>
    (req: Request): string => {
        if (req.session.oauth?.isPopup) {
            return new URL(
                isSuccess ? '/auth/popup/success' : '/auth/popup/failure',
                bigbytesConfig.siteUrl,
            ).href;
        }
        if (
            req.session.oauth?.returnTo &&
            typeof req.session.oauth?.returnTo === 'string'
        ) {
            const returnUrl = new URL(
                req.session.oauth?.returnTo,
                bigbytesConfig.siteUrl,
            );
            if (returnUrl.host === new URL(bigbytesConfig.siteUrl).host) {
                return returnUrl.href;
            }
        }
        return new URL('/', bigbytesConfig.siteUrl).href;
    };
