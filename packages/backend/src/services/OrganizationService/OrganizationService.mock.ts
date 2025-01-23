import { Ability } from '@casl/ability';
import {
    BigbytesMode,
    Organization,
    OrganizationMemberRole,
    SessionUser,
} from '@bigbytes/common';
import { BigbytesConfig } from '../../config/parseConfig';

export const user: SessionUser = {
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
        { subject: 'Dashboard', action: ['update', 'delete', 'create'] },
    ]),
    isActive: true,
    abilityRules: [],
    createdAt: new Date(),
    updatedAt: new Date(),
};

export const organization: Organization = {
    organizationUuid: 'organizationUuid',
    name: 'Bigbytes',
};

export const Config = {
    mode: BigbytesMode.DEFAULT,
    auth: {
        disablePasswordAuthentication: false,
        google: {
            loginPath: '',
            oauth2ClientId: '',
            oauth2ClientSecret: '',
            callbackPath: '',
        },
    },
} as BigbytesConfig;
