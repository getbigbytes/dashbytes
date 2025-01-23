import { subject } from '@casl/ability';
import {
    CreatePersonalAccessToken,
    ForbiddenError,
    ParameterError,
    PersonalAccessToken,
    PersonalAccessTokenWithToken,
    RequestMethod,
    SessionUser,
} from '@bigbytes/common';
import { BigbytesAnalytics } from '../analytics/BigbytesAnalytics';
import { BigbytesConfig } from '../config/parseConfig';
import { PersonalAccessTokenModel } from '../models/DashboardModel/PersonalAccessTokenModel';
import { BaseService } from './BaseService';

type PersonalAccessTokenServiceArguments = {
    bigbytesConfig: BigbytesConfig;
    analytics: BigbytesAnalytics;
    personalAccessTokenModel: PersonalAccessTokenModel;
};

export class PersonalAccessTokenService extends BaseService {
    private readonly bigbytesConfig: BigbytesConfig;

    private readonly analytics: BigbytesAnalytics;

    private readonly personalAccessTokenModel: PersonalAccessTokenModel;

    constructor(args: PersonalAccessTokenServiceArguments) {
        super();
        this.bigbytesConfig = args.bigbytesConfig;
        this.analytics = args.analytics;
        this.personalAccessTokenModel = args.personalAccessTokenModel;
    }

    private throwIfExpirationTimeIsInvalid(expiresAt: string | Date | null) {
        const expiresAtDate = expiresAt ? new Date(expiresAt) : null;

        if (expiresAtDate && expiresAtDate.getTime() < Date.now()) {
            throw new ParameterError('Expire time must be in the future');
        }

        const { maxExpirationTimeInDays } = this.bigbytesConfig.auth.pat;
        if (maxExpirationTimeInDays) {
            const maxDate: Date = new Date(
                Date.now() + maxExpirationTimeInDays * 24 * 60 * 60 * 1000,
            );
            if (!expiresAtDate || expiresAtDate.getTime() > maxDate.getTime()) {
                throw new ParameterError(
                    `Expiration time can't be greater than ${maxExpirationTimeInDays} days`,
                );
            }
        }
    }

    async createPersonalAccessToken(
        user: SessionUser,
        data: CreatePersonalAccessToken,
        method: RequestMethod,
    ): Promise<PersonalAccessTokenWithToken> {
        if (user.ability.cannot('create', subject('PersonalAccessToken', {}))) {
            throw new ForbiddenError(
                'You do not have permission to create a personal access token',
            );
        }

        // validate expiration time
        this.throwIfExpirationTimeIsInvalid(data.expiresAt);

        const result = await this.personalAccessTokenModel.create(user, data);
        this.analytics.track({
            userId: user.userUuid,
            event: 'personal_access_token.created',
            properties: {
                userId: user.userUuid,
                autoGenerated: data.autoGenerated,
                method,
            },
        });
        return result;
    }

    async deletePersonalAccessToken(
        user: SessionUser,
        personalAccessTokenUuid: string,
    ): Promise<void> {
        if (user.ability.cannot('delete', subject('PersonalAccessToken', {}))) {
            throw new ForbiddenError(
                'You do not have permission to delete a personal access token',
            );
        }

        await this.personalAccessTokenModel.delete(personalAccessTokenUuid);
        this.analytics.track({
            userId: user.userUuid,
            event: 'personal_access_token.deleted',
        });
    }

    async getAllPersonalAccessTokens(
        user: SessionUser,
    ): Promise<PersonalAccessToken[]> {
        if (user.ability.cannot('view', subject('PersonalAccessToken', {}))) {
            throw new ForbiddenError(
                'You do not have permission to view personal access tokens',
            );
        }
        return this.personalAccessTokenModel.getAllForUser(user.userId);
    }

    async rotatePersonalAccessToken(
        user: SessionUser,
        personalAccessTokenUuid: string,
        data: { expiresAt: Date },
    ): Promise<PersonalAccessTokenWithToken> {
        if (user.ability.cannot('update', subject('PersonalAccessToken', {}))) {
            throw new ForbiddenError(
                'You do not have permission to rotate a personal access token',
            );
        }

        // validate expiration time
        this.throwIfExpirationTimeIsInvalid(data.expiresAt);

        const existingToken = await this.personalAccessTokenModel.getUserToken({
            userUuid: user.userUuid,
            tokenUuid: personalAccessTokenUuid,
        });

        // Business decision, we don't want to rotate tokens that don't expire. Rotation is a security feature that should be used with tokens that expire.
        if (!existingToken.expiresAt) {
            throw new ParameterError(
                'Token with no expiration date cannot be rotated',
            );
        }

        if (
            existingToken.rotatedAt &&
            existingToken.rotatedAt.getTime() > Date.now() - 3600000
        ) {
            throw new ParameterError('Token can only be rotated once per hour');
        }

        const newToken = await this.personalAccessTokenModel.rotate({
            personalAccessTokenUuid,
            expiresAt: data.expiresAt,
        });
        this.analytics.track({
            userId: user.userUuid,
            event: 'personal_access_token.rotated',
        });
        return newToken;
    }
}
