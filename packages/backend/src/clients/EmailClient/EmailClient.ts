import {
    CreateProjectMember,
    InviteLink,
    PasswordResetLink,
    ProjectMemberRole,
    SessionUser,
    SmptError,
} from '@bigbytes/common';
import { marked } from 'marked';
import * as nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import Mail from 'nodemailer/lib/mailer';
import { AuthenticationType } from 'nodemailer/lib/smtp-connection';
import path from 'path';
import { BigbytesConfig } from '../../config/parseConfig';
import Logger from '../../logging/logger';

export type AttachmentUrl = {
    path: string;
    filename: string;
    localPath: string;
    truncated: boolean;
};
type EmailClientArguments = {
    bigbytesConfig: Pick<BigbytesConfig, 'smtp' | 'siteUrl' | 'query'>;
};

export default class EmailClient {
    bigbytesConfig: Pick<BigbytesConfig, 'smtp' | 'siteUrl' | 'query'>;

    transporter: nodemailer.Transporter | undefined;

    constructor({ bigbytesConfig }: EmailClientArguments) {
        this.bigbytesConfig = bigbytesConfig;

        if (this.bigbytesConfig.smtp) {
            Logger.debug(`Create email transporter`);

            const auth: AuthenticationType = this.bigbytesConfig.smtp.auth
                .accessToken
                ? {
                      type: 'OAuth2',
                      user: this.bigbytesConfig.smtp.auth.user,
                      accessToken: this.bigbytesConfig.smtp.auth.accessToken,
                  }
                : {
                      user: this.bigbytesConfig.smtp.auth.user,
                      pass: this.bigbytesConfig.smtp.auth.pass,
                  };

            this.transporter = nodemailer.createTransport(
                {
                    host: this.bigbytesConfig.smtp.host,
                    port: this.bigbytesConfig.smtp.port,
                    secure: this.bigbytesConfig.smtp.port === 465, // false for any port beside 465, other ports use STARTTLS instead.
                    auth,
                    requireTLS: this.bigbytesConfig.smtp.secure,
                    tls: this.bigbytesConfig.smtp.allowInvalidCertificate
                        ? { rejectUnauthorized: false }
                        : undefined,
                },
                {
                    from: `"${this.bigbytesConfig.smtp.sender.name}" <${this.bigbytesConfig.smtp.sender.email}>`,
                },
            );

            this.transporter.verify((error: any) => {
                if (error) {
                    throw new SmptError(
                        `Failed to verify email transporter. ${error}`,
                        {
                            error,
                        },
                    );
                } else {
                    Logger.debug(`Email transporter verified with success`);
                }
            });

            this.transporter.use(
                'compile',
                hbs({
                    viewEngine: {
                        partialsDir: path.join(__dirname, './templates/'),
                        defaultLayout: false,
                        extname: '.html',
                    },
                    viewPath: path.join(__dirname, './templates/'),
                    extName: '.html',
                }),
            );
        }
    }

    private async sendEmail(
        options: Mail.Options & {
            template: string;
            context: Record<string, any>;
        },
    ) {
        if (this.transporter) {
            try {
                const info = await this.transporter.sendMail(options);
                Logger.debug(`Email sent: ${info.messageId}`);
            } catch (error) {
                throw new SmptError(`Failed to send email. ${error}`, {
                    error,
                });
            }
        }
    }

    public async sendPasswordRecoveryEmail(link: PasswordResetLink) {
        return this.sendEmail({
            to: link.email,
            subject: 'Reset your password',
            template: 'recoverPassword',
            context: {
                url: link.url,
                host: this.bigbytesConfig.siteUrl,
            },
            text: `Forgotten your password? No worries! Just click on the link below within the next 24 hours to create a new one: ${link.url}`,
        });
    }

    public async sendInviteEmail(
        userThatInvited: Pick<
            SessionUser,
            'firstName' | 'lastName' | 'organizationName'
        >,
        invite: InviteLink,
    ) {
        return this.sendEmail({
            to: invite.email,
            subject: `You've been invited to join Bigbytes`,
            template: 'invitation',
            context: {
                orgName: userThatInvited.organizationName,
                inviteUrl: `${invite.inviteUrl}?from=email`,
                host: this.bigbytesConfig.siteUrl,
            },
            text: `Your teammates at ${userThatInvited.organizationName} are using Bigbytes to discover and share data insights. Click on the link below within the next 72 hours to join your team and start exploring your data! ${invite.inviteUrl}?from=email`,
        });
    }

    public async sendProjectAccessEmail(
        userThatInvited: Pick<SessionUser, 'firstName' | 'lastName'>,
        projectMember: CreateProjectMember,
        projectName: string,
        projectUrl: string,
    ) {
        let roleAction = 'view';
        switch (projectMember.role) {
            case ProjectMemberRole.VIEWER:
                roleAction = 'view';
                break;
            case ProjectMemberRole.INTERACTIVE_VIEWER:
                roleAction = 'explore';
                break;
            case ProjectMemberRole.EDITOR:
            case ProjectMemberRole.DEVELOPER:
                roleAction = 'edit';
                break;
            case ProjectMemberRole.ADMIN:
                roleAction = 'manage';
                break;
            default:
                const nope: never = projectMember.role;
        }
        return this.sendEmail({
            to: projectMember.email,
            subject: `${userThatInvited.firstName} ${userThatInvited.lastName} invited you to ${projectName}`,
            template: 'projectAccess',
            context: {
                inviterName: `${userThatInvited.firstName} ${userThatInvited.lastName}`,
                projectUrl,
                host: this.bigbytesConfig.siteUrl,
                projectName,
                roleAction,
            },
            text: `${userThatInvited.firstName} ${userThatInvited.lastName} has invited you to ${roleAction} this project: ${projectUrl}`,
        });
    }

    public async sendImageNotificationEmail(
        recipient: string,
        subject: string,
        title: string,
        description: string,
        message: string | undefined,
        date: string,
        frequency: string,
        imageUrl: string,
        url: string,
        schedulerUrl: string,
        includeLinks: boolean,
        pdfFile?: string,
        expirationDays?: number,
        deliveryType: string = 'Scheduled delivery',
    ) {
        return this.sendEmail({
            to: recipient,
            subject,
            template: 'imageNotification',
            context: {
                title,
                hasMessage: !!message,
                message: message && marked(message),
                imageUrl,
                description,
                date,
                frequency,
                url,
                host: this.bigbytesConfig.siteUrl,
                schedulerUrl,
                expirationDays,
                deliveryType,
                includeLinks,
            },
            text: title,
            attachments: pdfFile
                ? [
                      {
                          filename: `${title}.pdf`,
                          path: pdfFile,
                          contentType: 'application/pdf',
                      },
                  ]
                : undefined,
        });
    }

    public async sendChartCsvNotificationEmail(
        recipient: string,
        subject: string,
        title: string,
        description: string,
        message: string | undefined,
        date: string,
        frequency: string,
        attachment: AttachmentUrl,
        url: string,
        schedulerUrl: string,
        includeLinks: boolean,
        expirationDays?: number,
    ) {
        const csvUrl = attachment.path;
        return this.sendEmail({
            to: recipient,
            subject,
            template: 'chartCsvNotification',
            context: {
                title,
                description,
                hasMessage: !!message,
                message: message && marked(message),
                date,
                frequency,
                url,
                csvUrl,
                truncated: attachment.truncated,
                noResults: attachment.path === '#no-results',
                maxCells: this.bigbytesConfig.query.csvCellsLimit,
                host: this.bigbytesConfig.siteUrl,
                schedulerUrl,
                expirationDays,
                includeLinks,
            },
            text: title,
        });
    }

    public async sendDashboardCsvNotificationEmail(
        recipient: string,
        subject: string,
        title: string,
        description: string,
        message: string | undefined,
        date: string,
        frequency: string,
        attachments: AttachmentUrl[],
        url: string,
        schedulerUrl: string,
        includeLinks: boolean,
        expirationDays?: number,
    ) {
        const csvUrls = attachments.filter(
            (attachment) => !attachment.truncated,
        );

        const truncatedCsvUrls = attachments.filter(
            (attachment) => attachment.truncated,
        );

        return this.sendEmail({
            to: recipient,
            subject,
            template: 'dashboardCsvNotification',
            context: {
                title,
                description,
                hasMessage: !!message,
                message: message && marked(message),
                date,
                frequency,
                csvUrls,
                truncatedCsvUrls,
                truncated: truncatedCsvUrls.length > 0,
                maxCells: this.bigbytesConfig.query.csvCellsLimit,
                url,
                host: this.bigbytesConfig.siteUrl,
                schedulerUrl,
                expirationDays,
                includeLinks,
            },
            text: title,
        });
    }

    async sendOneTimePasscodeEmail({
        recipient,
        passcode,
    }: {
        recipient: string;
        passcode: string;
    }): Promise<void> {
        const subject = 'Verify your email address';
        const text = `
        Verify your email address by entering the following passcode in Bigbytes: ${passcode}
            `;
        return this.sendEmail({
            to: recipient,
            subject,
            template: 'oneTimePasscode',
            context: {
                passcode,
                title: subject,
                host: this.bigbytesConfig.siteUrl,
            },
            text,
        });
    }
}
