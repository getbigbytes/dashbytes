import { subject } from '@casl/ability';
import {
    ForbiddenError,
    isUserWithOrg,
    SessionUser,
    ShareUrl,
} from '@bigbytes/common';
import { nanoid as nanoidGenerator } from 'nanoid';
import { BigbytesAnalytics } from '../../analytics/BigbytesAnalytics';
import { BigbytesConfig } from '../../config/parseConfig';
import { ShareModel } from '../../models/ShareModel';
import { BaseService } from '../BaseService';

type ShareServiceArguments = {
    analytics: BigbytesAnalytics;
    shareModel: ShareModel;
    bigbytesConfig: Pick<BigbytesConfig, 'siteUrl'>;
};

export class ShareService extends BaseService {
    private readonly bigbytesConfig: Pick<BigbytesConfig, 'siteUrl'>;

    private readonly analytics: BigbytesAnalytics;

    private readonly shareModel: ShareModel;

    constructor(args: ShareServiceArguments) {
        super();
        this.bigbytesConfig = args.bigbytesConfig;
        this.analytics = args.analytics;
        this.shareModel = args.shareModel;
    }

    private shareUrlWithHost(shareUrl: ShareUrl) {
        const host = this.bigbytesConfig.siteUrl;
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
