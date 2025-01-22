import { ClairdashConfig, SmtpConfig } from '../../config/parseConfig';

export const passwordResetLinkMock = {
    code: 'code',
    expiresAt: new Date(),
    email: 'demo@digi-trans.org',
    url: 'htt://localhost:3000/reset-password/code',
    isExpired: false,
};

export const clairdashConfigWithNoSMTP: Pick<
    ClairdashConfig,
    'smtp' | 'siteUrl' | 'query'
> = {
    smtp: undefined,
    siteUrl: 'https://test.clairdash.cloud',
    query: {
        maxLimit: 100,
        csvCellsLimit: 100,
        timezone: undefined,
    },
};

const smtpBase: SmtpConfig = {
    host: 'host',
    secure: true,
    port: 587,
    auth: {
        user: 'user',
        pass: 'pass',
        accessToken: undefined,
    },
    sender: {
        name: 'name',
        email: 'email',
    },
    allowInvalidCertificate: false,
};

export const clairdashConfigWithBasicSMTP: Pick<
    ClairdashConfig,
    'smtp' | 'siteUrl' | 'query'
> = {
    smtp: {
        ...smtpBase,
    },
    siteUrl: 'https://test.clairdash.cloud',
    query: {
        maxLimit: 100,
        csvCellsLimit: 100,
        timezone: undefined,
    },
};

export const clairdashConfigWithOauth2SMTP: Pick<
    ClairdashConfig,
    'smtp' | 'siteUrl' | 'query'
> = {
    smtp: {
        ...smtpBase,
        auth: {
            user: 'user',
            pass: undefined,
            accessToken: 'accessToken',
        },
    },
    siteUrl: 'https://test.clairdash.cloud',
    query: {
        maxLimit: 100,
        csvCellsLimit: 100,
        timezone: undefined,
    },
};

export const clairdashConfigWithSecurePortSMTP: Pick<
    ClairdashConfig,
    'smtp' | 'siteUrl' | 'query'
> = {
    smtp: {
        ...smtpBase,
        port: 465,
    },
    siteUrl: 'https://test.clairdash.cloud',
    query: {
        maxLimit: 100,
        csvCellsLimit: 100,
        timezone: undefined,
    },
};

export const expectedTransporterArgs = [
    {
        host: smtpBase.host,
        port: smtpBase.port,
        secure: false,
        auth: {
            user: smtpBase.auth.user,
            pass: smtpBase.auth.pass,
        },
        requireTLS: true,
        tls: undefined,
    },
    {
        from: `"${smtpBase.sender.name}" <${smtpBase.sender.email}>`,
    },
];

export const expectedTransporterWithOauth2Args = [
    {
        ...expectedTransporterArgs[0],
        auth: {
            type: 'OAuth2',
            user: clairdashConfigWithOauth2SMTP.smtp?.auth.user,
            accessToken: clairdashConfigWithOauth2SMTP.smtp?.auth.accessToken,
        },
    },
    expectedTransporterArgs[1],
];

export const expectedTransporterWithSecurePortArgs = [
    {
        ...expectedTransporterArgs[0],
        port: 465,
        secure: true,
    },
    expectedTransporterArgs[1],
];
