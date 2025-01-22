/// <reference path="../../../@types/passport-openidconnect.d.ts" />
/// <reference path="../../../@types/express-session.d.ts" />
import { OpenIdIdentityIssuerType } from '@clairdash/common';
import { Strategy as OpenIDConnectStrategy } from 'passport-openidconnect';
import { URL } from 'url';
import { clairdashConfig } from '../../../config/clairdashConfig';
import { genericOidcHandler } from './oidcStrategy';

export const oneLoginPassportStrategy = !(
    clairdashConfig.auth.oneLogin.oauth2ClientId &&
    clairdashConfig.auth.oneLogin.oauth2ClientSecret &&
    clairdashConfig.auth.oneLogin.oauth2Issuer
)
    ? undefined
    : new OpenIDConnectStrategy(
          {
              clientID: clairdashConfig.auth.oneLogin.oauth2ClientId,
              clientSecret: clairdashConfig.auth.oneLogin.oauth2ClientSecret,
              issuer: new URL(
                  `/oidc/2`,
                  clairdashConfig.auth.oneLogin.oauth2Issuer,
              ).href,
              callbackURL: new URL(
                  `/api/v1${clairdashConfig.auth.oneLogin.callbackPath}`,
                  clairdashConfig.siteUrl,
              ).href,
              authorizationURL: new URL(
                  `/oidc/2/auth`,
                  clairdashConfig.auth.oneLogin.oauth2Issuer,
              ).href,
              tokenURL: new URL(
                  `/oidc/2/token`,
                  clairdashConfig.auth.oneLogin.oauth2Issuer,
              ).href,
              userInfoURL: new URL(
                  `/oidc/2/me`,
                  clairdashConfig.auth.oneLogin.oauth2Issuer,
              ).href,
              passReqToCallback: true,
          },
          genericOidcHandler(OpenIdIdentityIssuerType.ONELOGIN),
      );
