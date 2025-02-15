import {
    type ApiError,
    type ApiHealthResults,
    type HealthState,
} from '@bigbytes/common';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { bigbytesApi } from '../../api';
import useQueryError from '../useQueryError';

const getHealthState = async () =>
    bigbytesApi<ApiHealthResults>({
        url: `/health`,
        method: 'GET',
        body: undefined,
    });

const useHealth = (
    useQueryOptions?: UseQueryOptions<HealthState, ApiError>,
) => {
    const setErrorResponse = useQueryError();

    const health = useQuery<HealthState, ApiError>({
        queryKey: ['health'],
        queryFn: getHealthState,
        onError: (result) => {
            setErrorResponse(result);
        },
        ...useQueryOptions,
    });

    return health;
};

export default useHealth;
