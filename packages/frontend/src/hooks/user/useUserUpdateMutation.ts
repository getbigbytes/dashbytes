import {
    type ApiError,
    type BigbytesUser,
    type UpdateUserArgs,
} from '@bigbytes/common';
import {
    useMutation,
    useQueryClient,
    type UseMutationOptions,
} from '@tanstack/react-query';
import { bigbytesApi } from '../../api';

const updateUserQuery = async (data: Partial<UpdateUserArgs>) =>
    bigbytesApi<BigbytesUser>({
        url: `/user/me`,
        method: 'PATCH',
        body: JSON.stringify(data),
    });

export const useUserUpdateMutation = (
    useMutationOptions?: UseMutationOptions<
        BigbytesUser,
        ApiError,
        Partial<UpdateUserArgs>
    >,
) => {
    const queryClient = useQueryClient();
    return useMutation<BigbytesUser, ApiError, Partial<UpdateUserArgs>>({
        mutationKey: ['user_update'],
        mutationFn: updateUserQuery,
        ...useMutationOptions,
        onSuccess: async (data, variables, context) => {
            await queryClient.refetchQueries(['user']);
            await queryClient.refetchQueries(['email_status']);

            useMutationOptions?.onSuccess?.(data, variables, context);
        },
    });
};
