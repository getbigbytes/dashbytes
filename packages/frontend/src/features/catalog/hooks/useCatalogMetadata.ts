import {
    type ApiCatalogMetadataResults,
    type ApiError,
} from '@bigbytes/common';
import { useMutation } from '@tanstack/react-query';
import { bigbytesApi } from '../../../api';
import useQueryError from '../../../hooks/useQueryError';

export type GetCatalogMetadataParams = {
    projectUuid: string;
    table: string;
};

const fetchCatalogMetadata = async ({
    projectUuid,
    table,
}: GetCatalogMetadataParams) =>
    bigbytesApi<ApiCatalogMetadataResults>({
        url: `/projects/${projectUuid}/dataCatalog/${table}/metadata`,
        method: 'GET',
        body: undefined,
    });

export const useCatalogMetadata = (
    projectUuid: string,
    onSuccess?: (data: ApiCatalogMetadataResults) => void,
) => {
    const setErrorResponse = useQueryError();

    return useMutation<ApiCatalogMetadataResults, ApiError, string>(
        (table) => fetchCatalogMetadata({ projectUuid, table }),
        {
            mutationKey: ['catalog_metadata', projectUuid],
            onSuccess: (data) => onSuccess?.(data),
            onError: (result) => setErrorResponse(result),
        },
    );
};
