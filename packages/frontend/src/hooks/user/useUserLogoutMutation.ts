import { type ApiError, type ApiSuccessEmpty } from '@clairdash/common';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { clairdashApi } from '../../api';

const logoutQuery = async () =>
    clairdashApi<ApiSuccessEmpty>({
        url: `/logout`,
        method: 'GET',
        body: undefined,
    });

const useLogoutMutation = (
    options: UseMutationOptions<ApiSuccessEmpty, ApiError, void>,
) => {
    return useMutation(logoutQuery, {
        mutationKey: ['logout'],
        ...options,
    });
};

export default useLogoutMutation;
