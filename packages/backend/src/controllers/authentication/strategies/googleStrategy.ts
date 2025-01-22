/// <reference path="../../../@types/passport-openidconnect.d.ts" />
/// <reference path="../../../@types/express-session.d.ts" />
import {
    ClairdashError,
    OpenIdIdentityIssuerType,
    OpenIdUser,
} from '@clairdash/common';
import {
    GoogleCallbackParameters,
    Profile,
    Strategy as GoogleStrategy,
    VerifyCallback,
} from 'passport-google-oauth20';
import { URL } from 'url';
import { clairdashConfig } from '../../../config/clairdashConfig';
import Logger from '../../../logging/logger';

export const googlePassportStrategy: GoogleStrategy | undefined = !(
    clairdashConfig.auth.google.oauth2ClientId &&
    clairdashConfig.auth.google.oauth2ClientSecret
)
    ? undefined
    : new GoogleStrategy(
          {
              clientID: clairdashConfig.auth.google.oauth2ClientId,
              clientSecret: clairdashConfig.auth.google.oauth2ClientSecret,
              callbackURL: new URL(
                  `/api/v1${clairdashConfig.auth.google.callbackPath}`,
                  clairdashConfig.siteUrl,
              ).href,
              passReqToCallback: true,
              pkce: true,
              state: true,
          },
          async (
              req: Express.Request,
              accessToken: string,
              refreshToken: string,
              params: GoogleCallbackParameters,
              profile: Profile,
              done: VerifyCallback,
          ) => {
              try {
                  const issuer = 'https://accounts.google.com';
                  const { inviteCode } = req.session.oauth || {};
                  const [{ value: email }] = profile.emails || [];
                  const { id: subject } = profile;
                  if (!(email && subject)) {
                      return done(null, undefined, {
                          message: 'Could not parse authentication token',
                      });
                  }

                  const normalisedIssuer = new URL('/', issuer).origin; // normalise issuer
                  const openIdUser: OpenIdUser = {
                      openId: {
                          issuer: normalisedIssuer,
                          email,
                          subject,
                          firstName: profile.name?.givenName,
                          lastName: profile.name?.familyName,
                          issuerType: OpenIdIdentityIssuerType.GOOGLE,
                      },
                  };

                  const user = await req.services
                      .getUserService()
                      .loginWithOpenId(
                          openIdUser,
                          req.user,
                          inviteCode,
                          refreshToken,
                      );
                  return done(null, user);
              } catch (e) {
                  if (e instanceof ClairdashError) {
                      return done(null, undefined, { message: e.message });
                  }
                  Logger.warn(`Unexpected error while authorizing user: ${e}`);
                  return done(null, undefined, {
                      message: 'Unexpected error authorizing user',
                  });
              }
          },
      );
