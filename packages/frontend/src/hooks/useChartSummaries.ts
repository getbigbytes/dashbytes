import { type ApiError, type ChartSummary } from '@bigbytes/common';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { bigbytesApi } from '../api';

const getChartSummariesInProject = async (projectUuid: string) => {
    return bigbytesApi<ChartSummary[]>({
        url: `/projects/${projectUuid}/chart-summaries?excludeChartsSavedInDashboard=true`,
        method: 'GET',
        body: undefined,
    });
};

export const useChartSummaries = (
    projectUuid: string,
    useQueryFetchOptions?: UseQueryOptions<ChartSummary[], ApiError>,
) => {
    return useQuery<ChartSummary[], ApiError>({
        queryKey: ['project', projectUuid, 'chart-summaries'],
        queryFn: () => getChartSummariesInProject(projectUuid),
        ...useQueryFetchOptions,
    });
};
