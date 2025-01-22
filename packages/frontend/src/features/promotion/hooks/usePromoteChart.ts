import {
    type ApiError,
    type PromotionChanges,
    type SavedChart,
} from '@clairdash/common';
import { IconArrowRight } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { clairdashApi } from '../../../api';
import useToaster from '../../../hooks/toaster/useToaster';

const promoteChart = async (chartUuid: string): Promise<SavedChart> => {
    return clairdashApi<SavedChart>({
        url: `/saved/${chartUuid}/promote`,
        method: 'POST',
        body: undefined,
    });
};

export const usePromoteMutation = () => {
    const { showToastSuccess, showToastError } = useToaster();
    return useMutation<SavedChart, ApiError, string>(
        (data) => promoteChart(data),
        {
            mutationKey: ['promote_chart'],
            onSuccess: (data) => {
                showToastSuccess({
                    title: `Success! Chart was promoted.`,
                    action: {
                        children: 'Open chart',
                        icon: IconArrowRight,
                        onClick: () => {
                            window.open(
                                `/projects/${data.projectUuid}/saved/${data.uuid}`,
                                '_blank',
                            );
                        },
                    },
                });
            },
            onError: (error) => {
                showToastError({
                    title: `Failed to promote chart`,
                    subtitle: error.error.message,
                });
            },
        },
    );
};

const getPromoteChartDiff = async (
    chartUuid: string,
): Promise<PromotionChanges> => {
    return clairdashApi<PromotionChanges>({
        url: `/saved/${chartUuid}/promoteDiff`,
        method: 'GET',
        body: undefined,
    });
};

export const usePromoteChartDiffMutation = () => {
    const { showToastError } = useToaster();
    return useMutation<PromotionChanges, ApiError, string>(
        (data) => getPromoteChartDiff(data),
        {
            mutationKey: ['promote_chart_diff'],
            onSuccess: (data) => {
                return data;
            },
            onError: (error) => {
                showToastError({
                    title: `Failed to get diff from chart`,
                    subtitle: error.error.message,
                });
            },
        },
    );
};
