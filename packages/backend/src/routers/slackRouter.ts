import { NotFoundError } from '@clairdash/common';
import { ExpressReceiver } from '@slack/bolt';
import express from 'express';
import path from 'path';
import { ClairdashAnalytics } from '../analytics/ClairdashAnalytics';
import { slackOptions } from '../clients/Slack/SlackOptions';
import { clairdashConfig } from '../config/clairdashConfig';
import {
    isAuthenticated,
    unauthorisedInDemo,
} from '../controllers/authentication';

// TODO: to be removed once this is refactored. https://github.com/clairview/clairdash/issues/9174
const analytics = new ClairdashAnalytics({
    clairdashConfig,
    writeKey: clairdashConfig.rudder.writeKey || 'notrack',
    dataPlaneUrl: clairdashConfig.rudder.dataPlaneUrl
        ? `${clairdashConfig.rudder.dataPlaneUrl}/v1/batch`
        : 'notrack',
    options: {
        enable:
            clairdashConfig.rudder.writeKey &&
            clairdashConfig.rudder.dataPlaneUrl,
    },
});

export const slackRouter = express.Router({ mergeParams: true });

slackRouter.get(
    '/',
    isAuthenticated,
    unauthorisedInDemo,

    async (req, res, next) => {
        try {
            res.json({
                status: 'ok',
                results: await req.services
                    .getSlackIntegrationService()
                    .getInstallationFromOrganizationUuid(req.user!),
            });
        } catch (error) {
            next(error);
        }
    },
);

slackRouter.get(
    '/image/:nanoId',

    async (req, res, next) => {
        try {
            const { nanoId } = req.params;
            const { path: filePath } = await req.services
                .getDownloadFileService()
                .getDownloadFile(nanoId);
            const normalizedPath = path.normalize(filePath);
            if (!normalizedPath.startsWith('/tmp/')) {
                throw new NotFoundError(`File not found ${normalizedPath}`);
            }
            res.sendFile(normalizedPath);
        } catch (error) {
            next(error);
        }
    },
);

slackRouter.delete(
    '/',
    isAuthenticated,
    unauthorisedInDemo,

    async (req, res, next) => {
        try {
            await req.services
                .getSlackIntegrationService()
                .deleteInstallationFromOrganizationUuid(req.user!);

            res.json({
                status: 'ok',
            });
        } catch (error) {
            next(error);
        }
    },
);

slackRouter.get(
    '/install/',
    isAuthenticated,
    unauthorisedInDemo,

    async (req, res, next) => {
        try {
            const metadata = {
                organizationUuid: req.user?.organizationUuid,
                userId: req.user?.userId,
            };
            const options = {
                redirectUri: slackOptions.redirectUri,
                scopes: slackOptions.scopes,
                userScopes: slackOptions.installerOptions.userScopes,
                metadata: JSON.stringify(metadata),
            };
            analytics.track({
                event: 'share_slack.install',
                userId: req.user?.userUuid,
                properties: {
                    organizationId: req.params.organizationUuid,
                },
            });

            const slackReceiver = new ExpressReceiver(slackOptions);

            await slackReceiver.installer?.handleInstallPath(
                req,
                res,
                {},
                options,
            );
        } catch (error) {
            analytics.track({
                event: 'share_slack.install_error',
                userId: req.user?.userUuid,
                anonymousId: !req.user?.userUuid
                    ? ClairdashAnalytics.anonymousId
                    : undefined,
                properties: {
                    error: `${error}`,
                },
            });
            next(error);
        }
    },
);
