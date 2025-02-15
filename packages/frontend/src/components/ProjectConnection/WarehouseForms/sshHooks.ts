import { type ApiError, type ApiSshKeyPairResponse } from '@bigbytes/common';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { bigbytesApi } from '../../../api';
import useToaster from '../../../hooks/toaster/useToaster';

export const useCreateSshKeyPair = (
    options: UseMutationOptions<ApiSshKeyPairResponse['results'], ApiError>,
) => {
    const { showToastApiError } = useToaster();
    return useMutation<ApiSshKeyPairResponse['results'], ApiError>(
        async () =>
            bigbytesApi({
                method: 'POST',
                url: '/ssh/key-pairs',
                body: undefined,
            }),
        {
            mutationKey: ['activeSshKeypair'],
            onError: ({ error }) => {
                showToastApiError({
                    title: 'Failed to create SSH keypair',
                    apiError: error,
                });
            },
            ...options,
        },
    );
};
