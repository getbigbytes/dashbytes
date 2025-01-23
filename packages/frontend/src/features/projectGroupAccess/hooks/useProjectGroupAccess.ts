import {
    type CreateProjectGroupAccess,
    type DeleteProjectGroupAccess,
    type BigbytesError,
    type ProjectGroupAccess,
    type UpdateProjectGroupAccess,
} from '@bigbytes/common';
import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseQueryOptions,
} from '@tanstack/react-query';
import {
    addProjectGroupAccess,
    getProjectGroupAccessList,
    removeProjectGroupAccess,
    updateProjectGroupAccess,
} from '../api/projectGroupAccessApi';

export function useProjectGroupAccessList(
    projectUuid: string,
    useQueryOptions?: UseQueryOptions<ProjectGroupAccess[], BigbytesError>,
) {
    return useQuery<ProjectGroupAccess[], BigbytesError>({
        queryKey: ['projects', projectUuid, 'groupAccesses'],
        queryFn: () => getProjectGroupAccessList(projectUuid),
        ...useQueryOptions,
    });
}

export function useAddProjectGroupAccessMutation() {
    const queryClient = useQueryClient();

    return useMutation<
        ProjectGroupAccess,
        BigbytesError,
        CreateProjectGroupAccess
    >({
        mutationFn: ({ groupUuid, projectUuid, role }) =>
            addProjectGroupAccess({ groupUuid, projectUuid, role }),
        onSuccess: async (_data, { projectUuid }) => {
            await queryClient.invalidateQueries([
                'projects',
                projectUuid,
                'groupAccesses',
            ]);
        },
    });
}

export function useUpdateProjectGroupAccessMutation() {
    const queryClient = useQueryClient();

    return useMutation<
        ProjectGroupAccess,
        BigbytesError,
        UpdateProjectGroupAccess
    >({
        mutationFn: ({ groupUuid, projectUuid, role }) =>
            updateProjectGroupAccess({ groupUuid, projectUuid, role }),
        onSuccess: async (_data, { projectUuid }) => {
            await queryClient.invalidateQueries([
                'projects',
                projectUuid,
                'groupAccesses',
            ]);
        },
    });
}

export function useRemoveProjectGroupAccessMutation() {
    const queryClient = useQueryClient();

    return useMutation<null, BigbytesError, DeleteProjectGroupAccess>({
        mutationFn: ({ groupUuid, projectUuid }) =>
            removeProjectGroupAccess({ groupUuid, projectUuid }),
        onSuccess: async (_data, { projectUuid }) => {
            await queryClient.invalidateQueries([
                'projects',
                projectUuid,
                'groupAccesses',
            ]);
        },
    });
}
