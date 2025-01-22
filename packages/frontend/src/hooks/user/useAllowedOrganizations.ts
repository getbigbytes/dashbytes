import { type ApiError, type UserAllowedOrganization } from '@clairdash/common';
import { useQuery } from '@tanstack/react-query';
import { clairdashApi } from '../../api';

const getAllowedOrganizations = async (): Promise<UserAllowedOrganization[]> =>
    clairdashApi<UserAllowedOrganization[]>({
        url: `/user/me/allowedOrganizations`,
        method: 'GET',
        body: undefined,
    });

const useAllowedOrganizations = () => {
    return useQuery<UserAllowedOrganization[], ApiError>({
        queryKey: ['user-allowed-organizations'],
        queryFn: getAllowedOrganizations,
    });
};

export default useAllowedOrganizations;
