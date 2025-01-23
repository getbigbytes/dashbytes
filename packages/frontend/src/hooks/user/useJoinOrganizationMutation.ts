import { type ApiError } from '@bigbytes/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { bigbytesApi } from '../../api';

const joinOrgQuery = async (orgUuid: string) =>
    bigbytesApi<null>({
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
