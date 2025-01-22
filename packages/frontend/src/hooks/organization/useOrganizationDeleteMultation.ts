import { type ApiError } from '@clairdash/common';
import { useMutation } from '@tanstack/react-query';
import { clairdashApi } from '../../api';
import useToaster from '../toaster/useToaster';

const deleteDashboard = async (id: string) =>
    clairdashApi<null>({
        url: `/org/${id}`,
        method: 'DELETE',
        body: undefined,
    });

export const useDeleteOrganizationMutation = () => {
    const { showToastApiError } = useToaster();
    return useMutation<null, ApiError, string>(deleteDashboard, {
        onSuccess: async () => {
            window.location.href = '/register';
        },
        onError: ({ error }) => {
            showToastApiError({
                title: `Failed to delete organization`,
                apiError: error,
            });
        },
    });
};
