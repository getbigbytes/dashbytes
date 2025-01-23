import {
    FeatureFlags,
    HealthState,
    BigbytesInstallType,
    BigbytesMode,
    SessionUser,
    UnexpectedDatabaseError,
} from '@bigbytes/common';
import { createHmac } from 'crypto';
import { getDockerHubVersion } from '../../clients/DockerHub/DockerHub';
import { BigbytesConfig } from '../../config/parseConfig';
import { MigrationModel } from '../../models/MigrationModel/MigrationModel';
import { OrganizationModel } from '../../models/OrganizationModel';
import { isFeatureFlagEnabled } from '../../postHog';
import { VERSION } from '../../version';
import { BaseService } from '../BaseService';

type HealthServiceArguments = {
    bigbytesConfig: BigbytesConfig;
    organizationModel: OrganizationModel;
    migrationModel: MigrationModel;
};

export class HealthService extends BaseService {
    private readonly bigbytesConfig: BigbytesConfig;

    private readonly organizationModel: OrganizationModel;

    private readonly migrationModel: MigrationModel;

    constructor({
        organizationModel,
        migrationModel,
        bigbytesConfig,
    }: HealthServiceArguments) {
        super();
        this.bigbytesConfig = bigbytesConfig;
        this.organizationModel = organizationModel;
        this.migrationModel = migrationModel;
    }

    async getHealthState(user: SessionUser | undefined): Promise<HealthState> {
        const isAuthenticated: boolean = !!user?.userUuid;

        const { status: migrationStatus, currentVersion } =
            await this.migrationModel.getMigrationStatus();

        if (migrationStatus < 0) {
            throw new UnexpectedDatabaseError(
                'Database has not been migrated yet',
                { currentVersion },
            );
        } else if (migrationStatus > 0) {
            console.warn(
                `There are more DB migrations than defined in the code (you are running old code against a newer DB). Current version: ${currentVersion}`,
            );
        } // else migrationStatus === 0 (all migrations are up to date)

        const requiresOrgRegistration =
            !(await this.organizationModel.hasOrgs());

        const localDbtEnabled =
            process.env.BIGBYTES_INSTALL_TYPE !==
                BigbytesInstallType.HEROKU &&
            this.bigbytesConfig.mode !== BigbytesMode.CLOUD_BETA;
        return {
            healthy: true,
            mode: this.bigbytesConfig.mode,
            version: VERSION,
            localDbtEnabled,
            defaultProject: undefined,
            isAuthenticated,
            requiresOrgRegistration,
            latest: { version: getDockerHubVersion() },
            rudder: this.bigbytesConfig.rudder,
            sentry: {
                frontend: this.bigbytesConfig.sentry.frontend,
                environment: this.bigbytesConfig.sentry.environment,
                release: this.bigbytesConfig.sentry.release,
                tracesSampleRate: this.bigbytesConfig.sentry.tracesSampleRate,
                profilesSampleRate:
                    this.bigbytesConfig.sentry.profilesSampleRate,
            },
            intercom: this.bigbytesConfig.intercom,
            pylon: {
                appId: this.bigbytesConfig.pylon.appId,
                verificationHash:
                    this.bigbytesConfig.pylon.identityVerificationSecret &&
                    user?.email
                        ? createHmac(
                              'sha256',
                              this.bigbytesConfig.pylon
                                  .identityVerificationSecret,
                          )
                              .update(user?.email)
                              .digest('hex')
                        : undefined,
            },
            siteUrl: this.bigbytesConfig.siteUrl,
            staticIp: this.bigbytesConfig.staticIp,
            posthog: this.bigbytesConfig.posthog,
            query: this.bigbytesConfig.query,
            pivotTable: this.bigbytesConfig.pivotTable,
            customVisualizationsEnabled:
                this.bigbytesConfig.customVisualizations &&
                this.bigbytesConfig.customVisualizations.enabled,
            hasSlack: this.hasSlackConfig(),
            hasGithub: process.env.GITHUB_PRIVATE_KEY !== undefined,
            auth: {
                disablePasswordAuthentication:
                    this.bigbytesConfig.auth.disablePasswordAuthentication,
                google: {
                    loginPath: this.bigbytesConfig.auth.google.loginPath,
                    oauth2ClientId:
                        this.bigbytesConfig.auth.google.oauth2ClientId,
                    googleDriveApiKey:
                        this.bigbytesConfig.auth.google.googleDriveApiKey,
                    enabled: this.isGoogleSSOEnabled(),
                },
                okta: {
                    loginPath: this.bigbytesConfig.auth.okta.loginPath,
                    enabled: !!this.bigbytesConfig.auth.okta.oauth2ClientId,
                },
                oneLogin: {
                    loginPath: this.bigbytesConfig.auth.oneLogin.loginPath,
                    enabled:
                        !!this.bigbytesConfig.auth.oneLogin.oauth2ClientId,
                },
                azuread: {
                    loginPath: this.bigbytesConfig.auth.azuread.loginPath,
                    enabled: !!this.bigbytesConfig.auth.azuread.oauth2ClientId,
                },
                oidc: {
                    loginPath: this.bigbytesConfig.auth.oidc.loginPath,
                    enabled: !!this.bigbytesConfig.auth.oidc.clientId,
                },
                pat: {
                    maxExpirationTimeInDays:
                        this.bigbytesConfig.auth.pat.maxExpirationTimeInDays,
                },
            },
            hasEmailClient: !!this.bigbytesConfig.smtp,
            hasHeadlessBrowser:
                this.bigbytesConfig.headlessBrowser?.host !== undefined,
            hasGroups: await this.hasGroups(user),
            hasExtendedUsageAnalytics:
                this.bigbytesConfig.extendedUsageAnalytics.enabled,
        };
    }

    private async hasGroups(user: SessionUser | undefined): Promise<boolean> {
        return (
            this.bigbytesConfig.groups.enabled ||
            (user
                ? await isFeatureFlagEnabled(
                      FeatureFlags.UserGroupsEnabled,
                      {
                          userUuid: user.userUuid,
                          organizationUuid: user.organizationUuid,
                      },
                      {
                          // because we are checking this in the health check, we don't want to throw an error
                          // nor do we want to wait too long
                          throwOnTimeout: false,
                          timeoutMilliseconds: 500,
                      },
                  )
                : false)
        );
    }

    private hasSlackConfig(): boolean {
        return (
            this.bigbytesConfig.slack?.clientId !== undefined &&
            this.bigbytesConfig.slack.signingSecret !== undefined
        );
    }

    private isGoogleSSOEnabled(): boolean {
        return (
            this.bigbytesConfig.auth.google.oauth2ClientId !== undefined &&
            this.bigbytesConfig.auth.google.oauth2ClientSecret !== undefined &&
            this.bigbytesConfig.auth.google.enabled
        );
    }
}
