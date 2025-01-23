import type { ApiError, SpaceQuery } from '@bigbytes/common';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { bigbytesApi } from '../api';

const getChartsInProject = async (projectUuid: string) => {
    return bigbytesApi<SpaceQuery[]>({
        url: `/projects/${projectUuid}/charts`,
        method: 'GET',
        body: undefined,
    });
};

export const useCharts = (
    projectUuid: string,
    useQueryFetchOptions?: UseQueryOptions<SpaceQuery[], ApiError>,
) => {
    return useQuery<SpaceQuery[], ApiError>({
        queryKey: ['project', projectUuid, 'charts'],
        queryFn: () => getChartsInProject(projectUuid),
        ...useQueryFetchOptions,
    });
};
