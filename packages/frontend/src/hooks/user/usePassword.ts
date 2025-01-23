import { type ApiError } from '@bigbytes/common';
import {
    useMutation,
    useQuery,
    type UseMutationOptions,
} from '@tanstack/react-query';
import { bigbytesApi } from '../../api';

const getUserHasPassword = async (): Promise<boolean> =>
    bigbytesApi<boolean>({
        url: `/user/password`,
        method: 'GET',
        body: undefined,
    });

export const useUserHasPassword = () =>
    useQuery<boolean, ApiError>({
        queryKey: ['user-has-password'],
        queryFn: getUserHasPassword,
    });

type UserPasswordUpdate = {
    password?: string;
    newPassword: string;
};

const updateUserPasswordQuery = (data: UserPasswordUpdate) =>
    bigbytesApi<null>({
        url: `/user/password`,
        method: 'POST',
        body: JSON.stringify(data),
    });

export const useUserUpdatePasswordMutation = (
    useMutationOptions?: UseMutationOptions<null, ApiError, UserPasswordUpdate>,
) => {
    return useMutation<null, ApiError, UserPasswordUpdate>(
        updateUserPasswordQuery,
        {
            mutationKey: ['user_password_update'],
            ...useMutationOptions,
        },
    );
};
