import { subject } from '@casl/ability';
import {
    ForbiddenError,
    isUserWithOrg,
    SessionUser,
    ShareUrl,
} from '@clairdash/common';
import { nanoid as nanoidGenerator } from 'nanoid';
import { ClairdashAnalytics } from '../../analytics/ClairdashAnalytics';
import { ClairdashConfig } from '../../config/parseConfig';
import { ShareModel } from '../../models/ShareModel';
import { BaseService } from '../BaseService';

type ShareServiceArguments = {
    analytics: ClairdashAnalytics;
    shareModel: ShareModel;
    clairdashConfig: Pick<ClairdashConfig, 'siteUrl'>;
};

export class ShareService extends BaseService {
    private readonly clairdashConfig: Pick<ClairdashConfig, 'siteUrl'>;

    private readonly analytics: ClairdashAnalytics;

    private readonly shareModel: ShareModel;

    constructor(args: ShareServiceArguments) {
        super();
        this.clairdashConfig = args.clairdashConfig;
        this.analytics = args.analytics;
        this.shareModel = args.shareModel;
    }

    private shareUrlWithHost(shareUrl: ShareUrl) {
        const host = this.clairdashConfig.siteUrl;
        return {
            ...shareUrl,
            host,
            shareUrl: `${host}/share/${shareUrl.nanoid}`,
            url: `${shareUrl.path}${shareUrl.params}`,
        };
    }

    async getShareUrl(user: SessionUser, nanoid: string): Promise<ShareUrl> {
        if (!isUserWithOrg(user)) {
            throw new ForbiddenError('User is not part of an organization');
        }
        const shareUrl = await this.shareModel.getSharedUrl(nanoid);

        if (
            user.ability.cannot(
                'view',
                subject('OrganizationMemberProfile', {
                    organizationUuid: shareUrl.organizationUuid,
                }),
            )
        ) {
            throw new ForbiddenError();
        }
        this.analytics.track({
            userId: user.userUuid,
            event: 'share_url.used',
            properties: {
                path: shareUrl.path,
                organizationId: user.organizationUuid,
            },
        });
        return this.shareUrlWithHost(shareUrl);
    }

    async createShareUrl(
        user: SessionUser,
        path: string,
        params: string,
    ): Promise<ShareUrl> {
        if (!isUserWithOrg(user)) {
            throw new ForbiddenError('User is not part of an organization');
        }
        const shareUrl = await this.shareModel.createSharedUrl({
            path,
            params,
            nanoid: nanoidGenerator(),
            organizationUuid: user.organizationUuid,
            createdByUserUuid: user.userUuid,
        });

        this.analytics.track({
            userId: user.userUuid,
            event: 'share_url.created',
            properties: {
                path: shareUrl.path,
                organizationId: user.organizationUuid,
            },
        });

        return this.shareUrlWithHost(shareUrl);
    }
}
