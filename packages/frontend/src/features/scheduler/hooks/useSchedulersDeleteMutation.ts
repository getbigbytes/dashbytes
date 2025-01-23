import { type ApiError } from '@bigbytes/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bigbytesApi } from '../../../api';
import useToaster from '../../../hooks/toaster/useToaster';

const deleteScheduler = async (uuid: string) =>
    bigbytesApi<null>({
        url: `/schedulers/${uuid}`,
        method: 'DELETE',
        body: undefined,
    });

export const useSchedulersDeleteMutation = () => {
    const queryClient = useQueryClient();
    const { showToastSuccess, showToastApiError } = useToaster();
    return useMutation<null, ApiError, string>(deleteScheduler, {
        mutationKey: ['delete_scheduler'],
        onSuccess: async () => {
            await queryClient.invalidateQueries(['chart_schedulers']);
            await queryClient.invalidateQueries(['dashboard_schedulers']);
            showToastSuccess({
                title: `Success! Scheduled delivery was deleted`,
            });
        },
        onError: ({ error }) => {
            showToastApiError({
                title: `Failed to delete scheduled delivery`,
                apiError: error,
            });
        },
    });
};
