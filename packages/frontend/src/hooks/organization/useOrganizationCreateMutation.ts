import { type ApiError, type CreateOrganization } from '@clairdash/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clairdashApi } from '../../api';

const createOrgQuery = async (data: CreateOrganization) =>
    clairdashApi<null>({
        url: `/org`,
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const useOrganizationCreateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<null, ApiError, CreateOrganization>(createOrgQuery, {
        mutationKey: ['organization_create'],
        onSuccess: async () => {
            await queryClient.invalidateQueries(['user']);
        },
    });
};
