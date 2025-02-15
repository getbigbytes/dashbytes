import { type ApiError, type ApiExploresResults } from '@bigbytes/common';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { bigbytesApi } from '../api';
import useQueryError from './useQueryError';

const getExplores = async (projectUuid: string, filtered?: boolean) =>
    bigbytesApi<ApiExploresResults>({
        url: `/projects/${projectUuid}/explores?filtered=${
            filtered ? 'true' : 'false'
        }`,
        method: 'GET',
        body: undefined,
    });

export const useExplores = (
    projectUuid: string,
    filtered?: boolean,
    useQueryFetchOptions?: UseQueryOptions<ApiExploresResults, ApiError>,
) => {
    const setErrorResponse = useQueryError();
    const queryKey = ['tables', projectUuid, filtered ? 'filtered' : 'all'];
    return useQuery<ApiExploresResults, ApiError>({
        queryKey,
        queryFn: () => getExplores(projectUuid, filtered),
        onError: (result) => setErrorResponse(result),
        retry: false,
        ...useQueryFetchOptions,
    });
};
