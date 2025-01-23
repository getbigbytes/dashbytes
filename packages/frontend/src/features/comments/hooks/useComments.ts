import {
    type ApiCreateComment,
    type ApiDeleteComment,
    type ApiError,
    type ApiGetComments,
    type Comment,
} from '@bigbytes/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bigbytesApi } from '../../../api';

type CreateDashboardTileComment = Pick<
    Comment,
    'text' | 'textHtml' | 'mentions'
> & {
    projectUuid: string;
    dashboardUuid: string;
    dashboardTileUuid: string;
    replyTo?: string;
};

const createDashboardTileComment = async ({
    dashboardUuid,
    dashboardTileUuid,
    text,
    textHtml,
    replyTo,
    mentions,
}: CreateDashboardTileComment) =>
    bigbytesApi<ApiCreateComment['results']>({
        url: `/comments/dashboards/${dashboardUuid}/${dashboardTileUuid}`,
        method: 'POST',
        body: JSON.stringify({
            text,
            textHtml,
            replyTo,
            mentions,
        }),
    });

export const useCreateComment = () => {
    const queryClient = useQueryClient();

    return useMutation<
        ApiCreateComment['results'],
        ApiError,
        CreateDashboardTileComment
    >((data) => createDashboardTileComment(data), {
        mutationKey: ['create-comment'],
        onSuccess: async (_, { dashboardUuid }) => {
            await queryClient.invalidateQueries(['comments', dashboardUuid]);
        },
    });
};

const getDashboardComments = async ({
    dashboardUuid,
}: Pick<CreateDashboardTileComment, 'dashboardUuid'>) =>
    bigbytesApi<ApiGetComments['results']>({
        url: `/comments/dashboards/${dashboardUuid}`,
        method: 'GET',
        body: undefined,
    });

export const useGetComments = (dashboardUuid: string, enabled: boolean) =>
    useQuery<ApiGetComments['results'], ApiError>(
        ['comments', dashboardUuid],
        () => getDashboardComments({ dashboardUuid }),
        {
            refetchInterval: 3 * 60 * 1000, // 3 minutes
            retry: (_, error) => error.error.statusCode !== 403,
            enabled,
        },
    );

type RemoveCommentParams = { commentId: string } & Pick<
    CreateDashboardTileComment,
    'dashboardUuid'
>;

const removeComment = async ({
    commentId,
    dashboardUuid,
}: RemoveCommentParams) =>
    bigbytesApi<ApiDeleteComment>({
        url: `/comments/dashboards/${dashboardUuid}/${commentId}`,
        method: 'DELETE',
        body: undefined,
    });

export const useRemoveComment = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiDeleteComment, ApiError, RemoveCommentParams>(
        (data) => removeComment(data),
        {
            mutationKey: ['remove-comment'],
            onSuccess: async (_, { dashboardUuid }) => {
                await queryClient.invalidateQueries([
                    'comments',
                    dashboardUuid,
                ]);
            },
        },
    );
};
