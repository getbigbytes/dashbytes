import { type ApiError, type ProjectCatalog } from '@bigbytes/common';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { bigbytesApi } from '../api';
import useQueryError from './useQueryError';

const getProjectCatalogQuery = async (projectUuid: string) =>
    bigbytesApi<ProjectCatalog>({
        url: `/projects/${projectUuid}/catalog`,
        method: 'GET',
        body: undefined,
    });

export const useProjectCatalog = () => {
    const { projectUuid } = useParams<{ projectUuid: string }>();
    const setErrorResponse = useQueryError();
    return useQuery<ProjectCatalog, ApiError>({
        queryKey: ['projectCatalog', projectUuid],
        queryFn: () => getProjectCatalogQuery(projectUuid),
        onError: (result) => setErrorResponse(result),
    });
};
