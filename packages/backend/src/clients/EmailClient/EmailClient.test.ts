import * as nodemailer from 'nodemailer';
import EmailClient from './EmailClient';
import {
    expectedTransporterArgs,
    expectedTransporterWithOauth2Args,
    expectedTransporterWithSecurePortArgs,
    bigbytesConfigWithBasicSMTP,
    bigbytesConfigWithNoSMTP,
    bigbytesConfigWithOauth2SMTP,
    bigbytesConfigWithSecurePortSMTP,
    passwordResetLinkMock,
} from './EmailClient.mock';

jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        verify: jest.fn(),
        sendMail: jest.fn(() => ({ messageId: 'messageId' })),
        use: jest.fn(),
    })),
}));

describe('EmailClient', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Create transporter', () => {
        test('should not create a transporter when there is no smtp configs', async () => {
            const client = new EmailClient({
                bigbytesConfig: bigbytesConfigWithNoSMTP,
            });
            expect(nodemailer.createTransport).toHaveBeenCalledTimes(0);
            expect(client.transporter).toBeUndefined();
        });
        test('should create transporter when there is smtp configs', async () => {
            const client = new EmailClient({
                bigbytesConfig: bigbytesConfigWithBasicSMTP,
            });
            expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
            expect(nodemailer.createTransport).toHaveBeenCalledWith(
                ...expectedTransporterArgs,
            );
        });
        test('should create transported with secure connection when using port 465', async () => {
            const client = new EmailClient({
                bigbytesConfig: bigbytesConfigWithSecurePortSMTP,
            });
            expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
            expect(nodemailer.createTransport).toHaveBeenCalledWith(
                ...expectedTransporterWithSecurePortArgs,
            );
        });
        test('should create transported with Oauth2', async () => {
            const client = new EmailClient({
                bigbytesConfig: bigbytesConfigWithOauth2SMTP,
            });
            expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
            expect(nodemailer.createTransport).toHaveBeenCalledWith(
                ...expectedTransporterWithOauth2Args,
            );
        });
    });
    describe('Send emails', () => {
        test('should send email when there is smtp configs', async () => {
            const client = new EmailClient({
                bigbytesConfig: bigbytesConfigWithBasicSMTP,
            });
            await client.sendPasswordRecoveryEmail(passwordResetLinkMock);
            expect(client.transporter?.sendMail).toHaveBeenCalledTimes(1);
        });
    });
});
