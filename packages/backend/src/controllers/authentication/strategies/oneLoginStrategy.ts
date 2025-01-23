/// <reference path="../../../@types/passport-openidconnect.d.ts" />
/// <reference path="../../../@types/express-session.d.ts" />
import { OpenIdIdentityIssuerType } from '@bigbytes/common';
import { Strategy as OpenIDConnectStrategy } from 'passport-openidconnect';
import { URL } from 'url';
import { bigbytesConfig } from '../../../config/bigbytesConfig';
import { genericOidcHandler } from './oidcStrategy';

export const oneLoginPassportStrategy = !(
    bigbytesConfig.auth.oneLogin.oauth2ClientId &&
    bigbytesConfig.auth.oneLogin.oauth2ClientSecret &&
    bigbytesConfig.auth.oneLogin.oauth2Issuer
)
    ? undefined
    : new OpenIDConnectStrategy(
          {
              clientID: bigbytesConfig.auth.oneLogin.oauth2ClientId,
              clientSecret: bigbytesConfig.auth.oneLogin.oauth2ClientSecret,
              issuer: new URL(
                  `/oidc/2`,
                  bigbytesConfig.auth.oneLogin.oauth2Issuer,
              ).href,
              callbackURL: new URL(
                  `/api/v1${bigbytesConfig.auth.oneLogin.callbackPath}`,
                  bigbytesConfig.siteUrl,
              ).href,
              authorizationURL: new URL(
                  `/oidc/2/auth`,
                  bigbytesConfig.auth.oneLogin.oauth2Issuer,
              ).href,
              tokenURL: new URL(
                  `/oidc/2/token`,
                  bigbytesConfig.auth.oneLogin.oauth2Issuer,
              ).href,
              userInfoURL: new URL(
                  `/oidc/2/me`,
                  bigbytesConfig.auth.oneLogin.oauth2Issuer,
              ).href,
              passReqToCallback: true,
          },
          genericOidcHandler(OpenIdIdentityIssuerType.ONELOGIN),
      );
