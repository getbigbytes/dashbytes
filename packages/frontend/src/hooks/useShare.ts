import {
    type ApiError,
    type CreateShareUrl,
    type ShareUrl,
} from '@bigbytes/common';
import { useMutation, useQuery } from '@tanstack/react-query';
import { bigbytesApi } from '../api';

const getShare = async (shareNanoid: string) =>
    bigbytesApi<ShareUrl>({
        url: `/share/${shareNanoid}`,
        method: 'GET',
        body: undefined,
    });

export const useGetShare = (shareNanoid?: string) =>
    useQuery<ShareUrl, ApiError>({
        queryKey: ['share', shareNanoid],
        queryFn: () => getShare(shareNanoid!),
        enabled: shareNanoid !== undefined,
        retry: false,
    });

const createShareUrl = async (data: CreateShareUrl) =>
    bigbytesApi<ShareUrl>({
        url: `/share/`,
        method: 'POST',
        body: JSON.stringify(data),
    });

export const useCreateShareMutation = () => {
    return useMutation<ShareUrl, ApiError, CreateShareUrl>(
        (data) => createShareUrl(data),
        {
            //mutationKey: ['share'],
            onSuccess: async () => {},
            onError: () => {},
        },
    );
};
