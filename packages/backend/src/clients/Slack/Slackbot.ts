import {
    BigbytesMode,
    SlackInstallationNotFoundError,
} from '@bigbytes/common';
import * as Sentry from '@sentry/node';
import { App, ExpressReceiver, LogLevel } from '@slack/bolt';
import { Express } from 'express';
import { nanoid } from 'nanoid';
import { BigbytesAnalytics } from '../../analytics/BigbytesAnalytics';
import { BigbytesConfig } from '../../config/parseConfig';
import Logger from '../../logging/logger';
import { SlackAuthenticationModel } from '../../models/SlackAuthenticationModel';
import {
    Unfurl,
    type UnfurlService,
} from '../../services/UnfurlService/UnfurlService';
import { getUnfurlBlocks } from './SlackMessageBlocks';
import { slackOptions } from './SlackOptions';

const notifySlackError = async (
    error: unknown,
    url: string,
    client: any,
    event: any,
    { appProfilePhotoUrl }: { appProfilePhotoUrl?: string },
): Promise<void> => {
    /** Expected slack errors:
     * - cannot_parse_attachment: Means the image on the blocks is not accessible from slack, is the URL public ?
     */
    Logger.error(`Unable to unfurl slack URL ${url}: ${error} `);

    // Send message in thread
    await client.chat
        .postMessage({
            thread_ts: event.message_ts,
            channel: event.channel,
            ...(appProfilePhotoUrl ? { icon_url: appProfilePhotoUrl } : {}),
            text: `:fire: Unable to unfurl ${url}: ${error}`,
        })
        .catch((er: any) =>
            Logger.error(`Unable send slack error message: ${er} `),
        );
};

export type SlackBotArguments = {
    slackAuthenticationModel: SlackAuthenticationModel;
    bigbytesConfig: BigbytesConfig;
    analytics: BigbytesAnalytics;
    unfurlService: UnfurlService;
};

export class SlackBot {
    slackAuthenticationModel: SlackAuthenticationModel;

    bigbytesConfig: BigbytesConfig;

    analytics: BigbytesAnalytics;

    unfurlService: UnfurlService;

    constructor({
        slackAuthenticationModel,
        bigbytesConfig,
        analytics,
        unfurlService,
    }: SlackBotArguments) {
        this.bigbytesConfig = bigbytesConfig;
        this.analytics = analytics;
        this.slackAuthenticationModel = slackAuthenticationModel;
        this.unfurlService = unfurlService;
    }

    async start(expressApp: Express) {
        if (!this.bigbytesConfig.slack?.clientId) {
            Logger.warn(`Missing "SLACK_CLIENT_ID", Slack App will not run`);
            return;
        }

        try {
            if (this.bigbytesConfig.slack?.socketMode) {
                const app = new App({
                    ...slackOptions,
                    installationStore: {
                        storeInstallation: (i) =>
                            this.slackAuthenticationModel.createInstallation(i),
                        fetchInstallation: (i) =>
                            this.slackAuthenticationModel.getInstallation(i),
                        deleteInstallation: (i) =>
                            this.slackAuthenticationModel.deleteInstallation(i),
                    },
                    logLevel: LogLevel.INFO,
                    port: this.bigbytesConfig.slack.port,
                    socketMode: this.bigbytesConfig.slack.socketMode,
                    appToken: this.bigbytesConfig.slack.appToken,
                });
                this.addEventListeners(app);
            } else {
                const slackReceiver = new ExpressReceiver({
                    ...slackOptions,
                    installationStore: {
                        storeInstallation: (i) =>
                            this.slackAuthenticationModel.createInstallation(i),
                        fetchInstallation: (i) =>
                            this.slackAuthenticationModel.getInstallation(i),
                        deleteInstallation: (i) =>
                            this.slackAuthenticationModel.deleteInstallation(i),
                    },
                    logLevel: LogLevel.INFO,
                    app: expressApp,
                });
                const app = new App({
                    ...slackOptions,

                    receiver: slackReceiver,
                });
                this.addEventListeners(app);
            }
        } catch (e: unknown) {
            Logger.error(`Unable to start Slack app ${e}`);
        }
    }

    protected addEventListeners(app: App) {
        app.event('link_shared', (m) => this.unfurlSlackUrls(m));
    }

    private async sendUnfurl(
        event: any,
        originalUrl: string,
        unfurl: Unfurl,
        client: any,
    ) {
        const unfurlBlocks = getUnfurlBlocks(originalUrl, unfurl);
        await client.chat
            .unfurl({
                ts: event.message_ts,
                channel: event.channel,
                unfurls: unfurlBlocks,
            })
            .catch((e: any) => {
                this.analytics.track({
                    event: 'share_slack.unfurl_error',
                    userId: event.user,
                    properties: {
                        error: `${e}`,
                    },
                });
                Logger.error(
                    `Unable to unfurl on slack ${JSON.stringify(
                        unfurlBlocks,
                    )}: ${JSON.stringify(e)}`,
                );
            });
    }

    async unfurlSlackUrls(message: any) {
        const { event, client, context } = message;
        let appProfilePhotoUrl: string | undefined;

        if (event.channel === 'COMPOSER') return; // Do not unfurl urls when typing, only when message is sent

        Logger.debug(`Got link_shared slack event ${event.message_ts}`);

        event.links.map(async (l: any) => {
            const eventUserId = context.botUserId;

            try {
                const { teamId } = context;
                const details = await this.unfurlService.unfurlDetails(l.url);

                if (details) {
                    this.analytics.track({
                        event: 'share_slack.unfurl',
                        userId: eventUserId,
                        properties: {
                            organizationId: details?.organizationUuid,
                        },
                    });

                    Logger.debug(
                        `Unfurling ${details.pageType} with URL ${details.minimalUrl}`,
                    );

                    await this.sendUnfurl(event, l.url, details, client);

                    const imageId = `slack-image-${nanoid()}`;
                    const authUserUuid =
                        await this.slackAuthenticationModel.getUserUuid(teamId);

                    const installation =
                        await this.slackAuthenticationModel.getInstallationFromOrganizationUuid(
                            details?.organizationUuid,
                        );

                    if (!installation) {
                        throw new SlackInstallationNotFoundError();
                    }

                    appProfilePhotoUrl = installation.appProfilePhotoUrl;

                    const { imageUrl } = await this.unfurlService.unfurlImage({
                        url: details.minimalUrl,
                        bigbytesPage: details.pageType,
                        imageId,
                        authUserUuid,
                    });

                    if (imageUrl) {
                        await this.sendUnfurl(
                            event,
                            l.url,
                            { ...details, imageUrl },
                            client,
                        );

                        this.analytics.track({
                            event: 'share_slack.unfurl_completed',
                            userId: eventUserId,
                            properties: {
                                pageType: details.pageType,
                                organizationId: details?.organizationUuid,
                            },
                        });
                    }
                }
            } catch (e) {
                if (this.bigbytesConfig.mode === BigbytesMode.PR) {
                    void notifySlackError(e, l.url, client, event, {
                        appProfilePhotoUrl,
                    });
                }

                Sentry.captureException(e);

                this.analytics.track({
                    event: 'share_slack.unfurl_error',
                    userId: eventUserId,

                    properties: {
                        error: `${e}`,
                    },
                });
            }
        });
    }
}
