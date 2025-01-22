import {
    type ApiError,
    type ClairdashUser,
    type UpdateUserArgs,
} from '@clairdash/common';
import {
    useMutation,
    useQueryClient,
    type UseMutationOptions,
} from '@tanstack/react-query';
import { clairdashApi } from '../../api';

const updateUserQuery = async (data: Partial<UpdateUserArgs>) =>
    clairdashApi<ClairdashUser>({
        url: `/user/me`,
        method: 'PATCH',
        body: JSON.stringify(data),
    });

export const useUserUpdateMutation = (
    useMutationOptions?: UseMutationOptions<
        ClairdashUser,
        ApiError,
        Partial<UpdateUserArgs>
    >,
) => {
    const queryClient = useQueryClient();
    return useMutation<ClairdashUser, ApiError, Partial<UpdateUserArgs>>({
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
