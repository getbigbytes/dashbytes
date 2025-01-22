import { type ApiError, type UpdateMetadata } from '@clairdash/common';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clairdashApi } from '../../../api';
import useToaster from '../../../hooks/toaster/useToaster';

const updateProject = async (id: string, data: UpdateMetadata) =>
    clairdashApi<null>({
        url: `/projects/${id}/metadata`,
        method: 'PATCH',
        body: JSON.stringify(data),
    });

export const useUpdateMutation = (id: string) => {
    const queryClient = useQueryClient();
    const { showToastError, showToastSuccess } = useToaster();
    return useMutation<null, ApiError, UpdateMetadata>(
        (data) => updateProject(id, data),
        {
            mutationKey: ['project_update', id],
            onSuccess: async () => {
                await queryClient.invalidateQueries(['project', id]);
                showToastSuccess({
                    title: `Project updated`,
                    subtitle: `Project upstream project updated successfully`,
                });
            },
            onError: (error) => {
                showToastError({
                    title: `Failed to update project`,
                    subtitle: error.error.message,
                });
            },
        },
    );
};
