import {
    FeatureFlags,
    HealthState,
    ClairdashInstallType,
    ClairdashMode,
    SessionUser,
    UnexpectedDatabaseError,
} from '@clairdash/common';
import { createHmac } from 'crypto';
import { getDockerHubVersion } from '../../clients/DockerHub/DockerHub';
import { ClairdashConfig } from '../../config/parseConfig';
import { MigrationModel } from '../../models/MigrationModel/MigrationModel';
import { OrganizationModel } from '../../models/OrganizationModel';
import { isFeatureFlagEnabled } from '../../postHog';
import { VERSION } from '../../version';
import { BaseService } from '../BaseService';

type HealthServiceArguments = {
    clairdashConfig: ClairdashConfig;
    organizationModel: OrganizationModel;
    migrationModel: MigrationModel;
};

export class HealthService extends BaseService {
    private readonly clairdashConfig: ClairdashConfig;

    private readonly organizationModel: OrganizationModel;

    private readonly migrationModel: MigrationModel;

    constructor({
        organizationModel,
        migrationModel,
        clairdashConfig,
    }: HealthServiceArguments) {
        super();
        this.clairdashConfig = clairdashConfig;
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
            process.env.CLAIRDASH_INSTALL_TYPE !==
                ClairdashInstallType.HEROKU &&
            this.clairdashConfig.mode !== ClairdashMode.CLOUD_BETA;
        return {
            healthy: true,
            mode: this.clairdashConfig.mode,
            version: VERSION,
            localDbtEnabled,
            defaultProject: undefined,
            isAuthenticated,
            requiresOrgRegistration,
            latest: { version: getDockerHubVersion() },
            rudder: this.clairdashConfig.rudder,
            sentry: {
                frontend: this.clairdashConfig.sentry.frontend,
                environment: this.clairdashConfig.sentry.environment,
                release: this.clairdashConfig.sentry.release,
                tracesSampleRate: this.clairdashConfig.sentry.tracesSampleRate,
                profilesSampleRate:
                    this.clairdashConfig.sentry.profilesSampleRate,
            },
            intercom: this.clairdashConfig.intercom,
            pylon: {
                appId: this.clairdashConfig.pylon.appId,
                verificationHash:
                    this.clairdashConfig.pylon.identityVerificationSecret &&
                    user?.email
                        ? createHmac(
                              'sha256',
                              this.clairdashConfig.pylon
                                  .identityVerificationSecret,
                          )
                              .update(user?.email)
                              .digest('hex')
                        : undefined,
            },
            siteUrl: this.clairdashConfig.siteUrl,
            staticIp: this.clairdashConfig.staticIp,
            posthog: this.clairdashConfig.posthog,
            query: this.clairdashConfig.query,
            pivotTable: this.clairdashConfig.pivotTable,
            customVisualizationsEnabled:
                this.clairdashConfig.customVisualizations &&
                this.clairdashConfig.customVisualizations.enabled,
            hasSlack: this.hasSlackConfig(),
            hasGithub: process.env.GITHUB_PRIVATE_KEY !== undefined,
            auth: {
                disablePasswordAuthentication:
                    this.clairdashConfig.auth.disablePasswordAuthentication,
                google: {
                    loginPath: this.clairdashConfig.auth.google.loginPath,
                    oauth2ClientId:
                        this.clairdashConfig.auth.google.oauth2ClientId,
                    googleDriveApiKey:
                        this.clairdashConfig.auth.google.googleDriveApiKey,
                    enabled: this.isGoogleSSOEnabled(),
                },
                okta: {
                    loginPath: this.clairdashConfig.auth.okta.loginPath,
                    enabled: !!this.clairdashConfig.auth.okta.oauth2ClientId,
                },
                oneLogin: {
                    loginPath: this.clairdashConfig.auth.oneLogin.loginPath,
                    enabled:
                        !!this.clairdashConfig.auth.oneLogin.oauth2ClientId,
                },
                azuread: {
                    loginPath: this.clairdashConfig.auth.azuread.loginPath,
                    enabled: !!this.clairdashConfig.auth.azuread.oauth2ClientId,
                },
                oidc: {
                    loginPath: this.clairdashConfig.auth.oidc.loginPath,
                    enabled: !!this.clairdashConfig.auth.oidc.clientId,
                },
                pat: {
                    maxExpirationTimeInDays:
                        this.clairdashConfig.auth.pat.maxExpirationTimeInDays,
                },
            },
            hasEmailClient: !!this.clairdashConfig.smtp,
            hasHeadlessBrowser:
                this.clairdashConfig.headlessBrowser?.host !== undefined,
            hasGroups: await this.hasGroups(user),
            hasExtendedUsageAnalytics:
                this.clairdashConfig.extendedUsageAnalytics.enabled,
        };
    }

    private async hasGroups(user: SessionUser | undefined): Promise<boolean> {
        return (
            this.clairdashConfig.groups.enabled ||
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
            this.clairdashConfig.slack?.clientId !== undefined &&
            this.clairdashConfig.slack.signingSecret !== undefined
        );
    }

    private isGoogleSSOEnabled(): boolean {
        return (
            this.clairdashConfig.auth.google.oauth2ClientId !== undefined &&
            this.clairdashConfig.auth.google.oauth2ClientSecret !== undefined &&
            this.clairdashConfig.auth.google.enabled
        );
    }
}
