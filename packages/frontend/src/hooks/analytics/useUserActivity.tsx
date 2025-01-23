import { type ApiError, type UserActivity } from '@bigbytes/common';
import { useQuery } from '@tanstack/react-query';

import { bigbytesApi } from '../../api';
import useQueryError from '../useQueryError';

const getUserActivity = async (projectUuid: string) =>
    bigbytesApi<UserActivity>({
        url: `/analytics/user-activity/${projectUuid}`,
        method: 'GET',
        body: undefined,
    });

export const useUserActivity = (projectUuid?: string) => {
    const setErrorResponse = useQueryError();
    return useQuery<UserActivity, ApiError>({
        queryKey: ['user_activity', projectUuid],
        queryFn: () => getUserActivity(projectUuid || ''),
        enabled: projectUuid !== undefined,
        retry: false,
        onError: (result) => setErrorResponse(result),
    });
};
