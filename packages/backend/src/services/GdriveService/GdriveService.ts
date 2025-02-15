import { subject } from '@casl/ability';
import {
    ForbiddenError,
    isCustomSqlDimension,
    SessionUser,
    UploadMetricGsheet,
    UploadMetricGsheetPayload,
} from '@bigbytes/common';
import { BigbytesConfig } from '../../config/parseConfig';
import { DashboardModel } from '../../models/DashboardModel/DashboardModel';
import { SavedChartModel } from '../../models/SavedChartModel';
import { UserModel } from '../../models/UserModel';
import { SchedulerClient } from '../../scheduler/SchedulerClient';
import { BaseService } from '../BaseService';
import { ProjectService } from '../ProjectService/ProjectService';

type GdriveServiceArguments = {
    bigbytesConfig: BigbytesConfig;
    projectService: ProjectService;
    savedChartModel: SavedChartModel;
    dashboardModel: DashboardModel;
    userModel: UserModel;
    schedulerClient: SchedulerClient;
};

export class GdriveService extends BaseService {
    bigbytesConfig: BigbytesConfig;

    projectService: ProjectService;

    savedChartModel: SavedChartModel;

    dashboardModel: DashboardModel;

    userModel: UserModel;

    schedulerClient: SchedulerClient;

    constructor({
        bigbytesConfig,
        userModel,
        projectService,
        savedChartModel,
        dashboardModel,
        schedulerClient,
    }: GdriveServiceArguments) {
        super();
        this.bigbytesConfig = bigbytesConfig;
        this.userModel = userModel;
        this.projectService = projectService;
        this.savedChartModel = savedChartModel;
        this.dashboardModel = dashboardModel;
        this.schedulerClient = schedulerClient;
    }

    async scheduleUploadGsheet(
        user: SessionUser,
        gsheetOptions: UploadMetricGsheet,
    ) {
        if (
            user.ability.cannot(
                'manage',
                subject('ExportCsv', {
                    organizationUuid: user.organizationUuid,
                    projectUuid: gsheetOptions.projectUuid,
                }),
            )
        ) {
            throw new ForbiddenError();
        }

        if (
            gsheetOptions.metricQuery.customDimensions?.some(
                isCustomSqlDimension,
            ) &&
            user.ability.cannot(
                'manage',
                subject('CustomSql', {
                    organizationUuid: user.organizationUuid,
                    projectUuid: gsheetOptions.projectUuid,
                }),
            )
        ) {
            throw new ForbiddenError(
                'User cannot run queries with custom SQL dimensions',
            );
        }

        const payload: UploadMetricGsheetPayload = {
            ...gsheetOptions,
            userUuid: user.userUuid,
            organizationUuid: user.organizationUuid,
        };

        const { jobId } = await this.schedulerClient.uploadGsheetFromQueryJob(
            payload,
        );

        return { jobId };
    }
}
