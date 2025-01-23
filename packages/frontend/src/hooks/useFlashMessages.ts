import { type ApiError, type ApiFlashResults } from '@bigbytes/common';
import { useQuery } from '@tanstack/react-query';
import { bigbytesApi } from '../api';

const getFlash = async () =>
    bigbytesApi<ApiFlashResults>({
        method: 'GET',
        url: '/flash',
        body: undefined,
    });

export const useFlashMessages = () =>
    useQuery<ApiFlashResults, ApiError>({
        queryKey: ['flash'],
        queryFn: getFlash,
        cacheTime: 200,
        refetchInterval: false,
    });
