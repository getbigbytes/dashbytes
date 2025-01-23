import { type ApiError } from '@bigbytes/common';
import { useMutation } from '@tanstack/react-query';
import { bigbytesApi } from '../../api';

const deleteUserQuery = async () =>
    bigbytesApi<null>({
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
