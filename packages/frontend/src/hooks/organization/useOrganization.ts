import { type ApiError, type Organization } from '@clairdash/common';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { clairdashApi } from '../../api';

const getOrganization = async () =>
    clairdashApi<Organization>({
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
