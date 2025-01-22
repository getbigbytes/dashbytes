import {
    type ApiError,
    type DeleteOpenIdentity,
    type OpenIdIdentitySummary,
} from '@clairdash/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clairdashApi } from '../../api';
import useToaster from '../toaster/useToaster';

const deleteOpenIdentity = async (data: DeleteOpenIdentity) =>
    clairdashApi<null>({
        url: `/user/identity`,
        method: 'DELETE',
        body: JSON.stringify(data),
    });

export const useDeleteOpenIdentityMutation = () => {
    const queryClient = useQueryClient();
    const { showToastSuccess, showToastApiError } = useToaster();
    return useMutation<null, ApiError, DeleteOpenIdentity>(deleteOpenIdentity, {
        onSuccess: async () => {
            await queryClient.invalidateQueries(['user_identities']);
            showToastSuccess({
                title: `Deleted! Social login was deleted.`,
            });
        },
        onError: ({ error }) => {
            showToastApiError({
                title: `Failed to delete social login`,
                apiError: error,
            });
        },
    });
};

const getIdentitiesQuery = async () =>
    clairdashApi<
        Record<OpenIdIdentitySummary['issuerType'], OpenIdIdentitySummary[]>
    >({
        url: '/user/identities',
        method: 'GET',
        body: undefined,
    });

export const useOpenIdentities = () =>
    useQuery<
        Record<OpenIdIdentitySummary['issuerType'], OpenIdIdentitySummary[]>,
        ApiError
    >({
        queryKey: ['user_identities'],
        queryFn: getIdentitiesQuery,
    });
