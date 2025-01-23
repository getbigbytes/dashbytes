import { type ApiError, type ViewStatistics } from '@bigbytes/common';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { bigbytesApi } from '../../api';

const getChartViewStats = async (chartUuid: string) => {
    return bigbytesApi<ViewStatistics>({
        url: `/saved/${chartUuid}/views`,
        method: 'GET',
        body: undefined,
    });
};

export const useChartViewStats = (
    chartUuid: string | undefined,
    queryOptions?: UseQueryOptions<ViewStatistics, ApiError>,
) => {
    return useQuery<ViewStatistics, ApiError>(
        ['chart-views', chartUuid],
        () => getChartViewStats(chartUuid || ''),
        {
            enabled: !!chartUuid,
            ...queryOptions,
        },
    );
};
