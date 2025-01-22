import { type ApiError } from '@clairdash/common';
import { useMutation } from '@tanstack/react-query';
import { clairdashApi } from '../../api';

const deleteUserQuery = async () =>
    clairdashApi<null>({
        url: `/user/me`,
        method: 'DELETE',
        body: undefined,
    });

export const useDeleteUserMutation = () =>
    useMutation<null, ApiError>(deleteUserQuery, {
        mutationKey: ['user_delete'],
        onSuccess: () => {
            window.location.href = '/login';
        },
    });
