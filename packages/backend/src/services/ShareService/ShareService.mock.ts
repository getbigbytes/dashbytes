import { Ability } from '@casl/ability';
import {
    BigbytesMode,
    OrganizationMemberRole,
    SessionUser,
    ShareUrl,
} from '@bigbytes/common';
import { BigbytesConfig } from '../../config/parseConfig';

export const Config = {
    mode: BigbytesMode.DEFAULT,
    siteUrl: 'https://test.bigbytes.cloud',
} as BigbytesConfig;

export const User: SessionUser = {
    userUuid: 'userUuid',
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    organizationUuid: 'organizationUuid',
    organizationName: 'organizationName',
    organizationCreatedAt: new Date(),
    isTrackingAnonymized: false,
    isMarketingOptedIn: false,
    isSetupComplete: true,
    userId: 0,
    role: OrganizationMemberRole.ADMIN,
    ability: new Ability([
        {
            subject: 'OrganizationMemberProfile',
            action: ['view'],
            conditions: { organizationUuid: 'organizationUuid' },
        },
    ]),
    isActive: true,
    abilityRules: [],
    createdAt: new Date(),
    updatedAt: new Date(),
};

export const UserFromAnotherOrg: SessionUser = {
    ...User,
    organizationUuid: 'anotherOrg',
    ability: new Ability([
        {
            subject: 'OrganizationMemberProfile',
            action: ['view'],
            conditions: { organizationUuid: 'anotherOrg' },
        },
    ]),
};

export const SampleShareUrl: ShareUrl = {
    nanoid: 'abc123',
    params: '?foo=bar',
    path: '/projects/uuid/tables/customers',
    createdByUserUuid: 'userUuid',
    organizationUuid: 'organizationUuid',
};

export const FullShareUrl = {
    ...SampleShareUrl,
    host: Config.siteUrl,
    shareUrl: `${Config.siteUrl}/share/${SampleShareUrl.nanoid}`,
    url: `${SampleShareUrl.path}${SampleShareUrl.params}`,
};

export const ShareUrlWithoutParams = {
    ...SampleShareUrl,
    nanoid: 'abc123',
    params: '',
    path: '/projects/uuid/tables/customers',
};

export const FullShareUrlWithoutParams = {
    ...ShareUrlWithoutParams,
    host: Config.siteUrl,
    shareUrl: `${Config.siteUrl}/share/${SampleShareUrl.nanoid}`,
    url: `${SampleShareUrl.path}`,
};
