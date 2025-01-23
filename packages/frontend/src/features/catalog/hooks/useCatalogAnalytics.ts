import {
    type ApiCatalogAnalyticsResults,
    type ApiError,
} from '@bigbytes/common';
import { useMutation } from '@tanstack/react-query';
import { bigbytesApi } from '../../../api';
import useQueryError from '../../../hooks/useQueryError';

export type GetCatalogAnalyticsParams = {
    projectUuid: string;
    table: string;
    field?: string;
};

const fetchCatalogAnalytics = async ({
    projectUuid,
    table,
    field,
}: GetCatalogAnalyticsParams) =>
    bigbytesApi<ApiCatalogAnalyticsResults>({
        url: `/projects/${projectUuid}/dataCatalog/${table}/analytics${
            field ? `/${field}` : ''
        }`,
        method: 'GET',
        body: undefined,
    });

export const useCatalogAnalytics = (
    projectUuid: string,
    onSuccess: (data: ApiCatalogAnalyticsResults) => void,
) => {
    const setErrorResponse = useQueryError();

    return useMutation<
        ApiCatalogAnalyticsResults,
        ApiError,
        { table: string; field?: string }
    >(
        ({ table, field }) =>
            fetchCatalogAnalytics({ projectUuid, table, field }),
        {
            mutationKey: ['catalog_analytics', projectUuid],
            onSuccess: (data) => onSuccess(data),
            onError: (result) => setErrorResponse(result),
        },
    );
};
