import { type ApiError, type ApiFlashResults } from '@clairdash/common';
import { useQuery } from '@tanstack/react-query';
import { clairdashApi } from '../api';

const getFlash = async () =>
    clairdashApi<ApiFlashResults>({
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
