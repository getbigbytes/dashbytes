import { type ApiError, type ApiSuccessEmpty } from '@bigbytes/common';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { bigbytesApi } from '../../api';

const logoutQuery = async () =>
    bigbytesApi<ApiSuccessEmpty>({
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
