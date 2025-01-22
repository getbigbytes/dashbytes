import {
    type ApiCreateUserTokenResults,
    type ApiError,
    type CreatePersonalAccessToken,
    type PersonalAccessToken,
} from '@clairdash/common';
import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseQueryOptions,
} from '@tanstack/react-query';
import { clairdashApi } from '../api';
import useToaster from './toaster/useToaster';
import useQueryError from './useQueryError';

// gets users access tokens
const getAccessToken = async () =>
    clairdashApi<any[]>({
        url: `/user/me/personal-access-tokens`,
        method: 'GET',
        body: undefined,
    });

const createAccessToken = async (data: CreatePersonalAccessToken) =>
    clairdashApi<ApiCreateUserTokenResults>({
        url: `/user/me/personal-access-tokens`,
        method: 'POST',
        body: JSON.stringify(data),
    });

const deleteAccessToken = async (tokenUuid: string) =>
    clairdashApi<null>({
        url: `/user/me/personal-access-tokens/${tokenUuid}`,
        method: 'DELETE',
        body: undefined,
    });

export const useAccessToken = (
    useQueryOptions?: UseQueryOptions<PersonalAccessToken[], ApiError>,
) => {
    const setErrorResponse = useQueryError();
    return useQuery<PersonalAccessToken[], ApiError>({
        queryKey: ['personal_access_tokens'],
        queryFn: () => getAccessToken(),
        retry: false,
        onError: (result) => setErrorResponse(result),
        ...useQueryOptions,
    });
};

export const useCreateAccessToken = () => {
    const queryClient = useQueryClient();
    const { showToastApiError } = useToaster();
    return useMutation<
        ApiCreateUserTokenResults,
        ApiError,
        CreatePersonalAccessToken
    >((data) => createAccessToken(data), {
        mutationKey: ['personal_access_tokens'],
        retry: 3,
        onSuccess: async () => {
            await queryClient.invalidateQueries(['personal_access_tokens']);
        },
        onError: ({ error }) => {
            showToastApiError({
                title: `Failed to create token`,
                apiError: error,
            });
        },
    });
};

export const useDeleteAccessToken = () => {
    const queryClient = useQueryClient();
    const { showToastSuccess, showToastApiError } = useToaster();
    return useMutation<null, ApiError, string>(deleteAccessToken, {
        mutationKey: ['personal_access_tokens'],
        onSuccess: async () => {
            await queryClient.invalidateQueries(['personal_access_tokens']);
            showToastSuccess({
                title: `Success! Your token was deleted.`,
            });
        },
        onError: ({ error }) => {
            showToastApiError({
                title: `Failed to delete token`,
                apiError: error,
            });
        },
    });
};
