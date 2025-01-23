import {
    type ApiError,
    type CompleteUserArgs,
    type BigbytesUser,
} from '@bigbytes/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bigbytesApi } from '../../api';

const completeUserQuery = async (data: CompleteUserArgs) =>
    bigbytesApi<BigbytesUser>({
        url: `/user/me/complete`,
        method: 'PATCH',
        body: JSON.stringify(data),
    });

export const useUserCompleteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<BigbytesUser, ApiError, CompleteUserArgs>(
        completeUserQuery,
        {
            mutationKey: ['user_complete'],
            onSuccess: async () => {
                await queryClient.invalidateQueries(['user']);
                await queryClient.invalidateQueries(['organization']);
            },
        },
    );
};
