import { type ApiError, type UserAllowedOrganization } from '@bigbytes/common';
import { useQuery } from '@tanstack/react-query';
import { bigbytesApi } from '../../api';

const getAllowedOrganizations = async (): Promise<UserAllowedOrganization[]> =>
    bigbytesApi<UserAllowedOrganization[]>({
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
