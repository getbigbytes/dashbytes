import {
    type ApiError,
    type OnboardingStatus,
    type ProjectSavedChartStatus,
} from '@clairdash/common';
import { useQuery } from '@tanstack/react-query';
import { clairdashApi } from '../api';

const getOnboardingStatus = async () =>
    clairdashApi<OnboardingStatus>({
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
    clairdashApi<ProjectSavedChartStatus>({
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
