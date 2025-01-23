import {
    ForbiddenError,
    NotFoundError,
    SessionUser,
    SlackSettings,
} from '@bigbytes/common';
import { BigbytesAnalytics } from '../../analytics/BigbytesAnalytics';
import { SlackAuthenticationModel } from '../../models/SlackAuthenticationModel';
import { BaseService } from '../BaseService';

type SlackIntegrationServiceArguments<
    T extends SlackAuthenticationModel = SlackAuthenticationModel,
> = {
    analytics: BigbytesAnalytics;
    slackAuthenticationModel: T;
};

export class SlackIntegrationService<
    T extends SlackAuthenticationModel = SlackAuthenticationModel,
> extends BaseService {
    private readonly analytics: BigbytesAnalytics;

    protected readonly slackAuthenticationModel: T;

    constructor(args: SlackIntegrationServiceArguments<T>) {
        super();
        this.analytics = args.analytics;
        this.slackAuthenticationModel = args.slackAuthenticationModel;
    }

    async getInstallationFromOrganizationUuid(user: SessionUser) {
        const organizationUuid = user?.organizationUuid;
        if (!organizationUuid) throw new ForbiddenError();

        const installation =
            await this.slackAuthenticationModel.getInstallationFromOrganizationUuid(
                organizationUuid,
            );

        if (installation === undefined) return undefined;

        const response: SlackSettings = {
            organizationUuid,
            slackTeamName: installation.slackTeamName,
            createdAt: installation.createdAt,
            scopes: installation.scopes,
            notificationChannel: installation.notificationChannel,
            appProfilePhotoUrl: installation.appProfilePhotoUrl,
        };
        return response;
    }

    async deleteInstallationFromOrganizationUuid(user: SessionUser) {
        const organizationUuid = user?.organizationUuid;
        if (!organizationUuid) throw new ForbiddenError();
        await this.slackAuthenticationModel.deleteInstallationFromOrganizationUuid(
            organizationUuid,
        );

        this.analytics.track({
            event: 'share_slack.delete',
            userId: user.userUuid,
            properties: {
                organizationId: organizationUuid,
            },
        });
    }
}
