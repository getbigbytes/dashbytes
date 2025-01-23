import {
    type ApiError,
    type OnboardingStatus,
    type ProjectSavedChartStatus,
} from '@bigbytes/common';
import { useQuery } from '@tanstack/react-query';
import { bigbytesApi } from '../api';

const getOnboardingStatus = async () =>
    bigbytesApi<OnboardingStatus>({
        url: `/org/onboardingStatus`,
        method: 'GET',
        body: undefined,
    });

export const useOnboardingStatus = () =>
    useQuery<OnboardingStatus, ApiError>({
        queryKey: ['onboarding-status'],
        queryFn: getOnboardingStatus,
        retry: false,
        refetchOnMount: true,
    });

const getProjectSavedChartStatus = async (projectUuid: string) =>
    bigbytesApi<ProjectSavedChartStatus>({
        url: `/projects/${projectUuid}/hasSavedCharts`,
        method: 'GET',
        body: undefined,
    });

export const useProjectSavedChartStatus = (projectUuid: string) =>
    useQuery<ProjectSavedChartStatus, ApiError>({
        queryKey: [projectUuid, 'project-saved-chart-status'],
        queryFn: () => getProjectSavedChartStatus(projectUuid),
        retry: false,
        refetchOnMount: true,
    });
