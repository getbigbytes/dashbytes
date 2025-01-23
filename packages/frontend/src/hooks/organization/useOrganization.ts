import { type ApiError, type Organization } from '@bigbytes/common';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { bigbytesApi } from '../../api';

const getOrganization = async () =>
    bigbytesApi<Organization>({
        url: `/org`,
        method: 'GET',
        body: undefined,
    });

export const useOrganization = (
    useQueryOptions?: UseQueryOptions<Organization, ApiError>,
) =>
    useQuery<Organization, ApiError>({
        queryKey: ['organization'],
        queryFn: getOrganization,
        ...useQueryOptions,
    });
