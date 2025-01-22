import { type ApiError, type ChartSummary } from '@clairdash/common';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { clairdashApi } from '../api';

const getChartSummariesInProject = async (projectUuid: string) => {
    return clairdashApi<ChartSummary[]>({
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
