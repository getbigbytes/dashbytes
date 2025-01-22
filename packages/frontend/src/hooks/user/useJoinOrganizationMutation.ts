import { type ApiError } from '@clairdash/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clairdashApi } from '../../api';

const joinOrgQuery = async (orgUuid: string) =>
    clairdashApi<null>({
        url: `/user/me/joinOrganization/${orgUuid}`,
        method: 'POST',
        body: undefined,
    });

export const useJoinOrganizationMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<null, ApiError, string>(joinOrgQuery, {
        mutationKey: ['organization_create'],
        onSuccess: async () => {
            await queryClient.invalidateQueries(['user']);
        },
    });
};
