import { DbtProjectType, JobStatusType, ProjectType } from '@bigbytes/common';
import {
    Anchor,
    Badge,
    Box,
    Button,
    Popover,
    Text,
    Tooltip,
    type ButtonProps,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useEffect, useState, type FC } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../../hooks/useProject';
import { useRefreshServer } from '../../hooks/useRefreshServer';
import { useActiveJob } from '../../providers/ActiveJobProvider';
import { useApp } from '../../providers/AppProvider';
import { useTracking } from '../../providers/TrackingProvider';
import { EventName } from '../../types/Events';
import MantineIcon from '../common/MantineIcon';

const RefreshDbtButton: FC<{
    onClick?: () => void;
    buttonStyles?: ButtonProps['sx'];
    leftIcon?: React.ReactNode;
    defaultTextOverride?: React.ReactNode;
    refreshingTextOverride?: React.ReactNode;
}> = ({
    onClick,
    buttonStyles,
    leftIcon,
    defaultTextOverride,
    refreshingTextOverride,
}) => {
    const { projectUuid } = useParams<{ projectUuid: string }>();
    const { data } = useProject(projectUuid);
    const { activeJob } = useActiveJob();
    const { mutate: refreshDbtServer } = useRefreshServer();
    const [isLoading, setIsLoading] = useState(false);

    const { track } = useTracking();
    const { user } = useApp();

    useEffect(() => {
        if (activeJob) {
            if (
                [JobStatusType.STARTED, JobStatusType.RUNNING].includes(
                    activeJob.jobStatus,
                )
            ) {
                setIsLoading(true);
            }

            if (
                [JobStatusType.DONE, JobStatusType.ERROR].includes(
                    activeJob.jobStatus,
                )
            ) {
                setIsLoading(false);
            }
        }
    }, [activeJob, activeJob?.jobStatus]);

    if (
        user.data?.ability?.cannot('manage', 'Job') ||
        user.data?.ability?.cannot('manage', 'CompileProject')
    )
        return null;

    if (data?.dbtConnection?.type === DbtProjectType.NONE) {
        if (data?.dbtConnection.hideRefreshButton) {
            return null;
        }
        return (
            <Popover withinPortal withArrow width={300}>
                <Popover.Target>
                    <Box
                        sx={{
                            cursor: 'pointer',
                        }}
                    >
                        <Button
                            size="xs"
                            variant="outline"
                            leftIcon={<MantineIcon icon={IconRefresh} />}
                            disabled
                        >
                            Refresh dbt
                        </Button>
                    </Box>
                </Popover.Target>
                <Popover.Dropdown>
                    <Text>
                        You're still connected to a dbt project created from the
                        CLI.
                        <br />
                        To keep your Bigbytes project in sync with your dbt
                        project,
                        <br /> you need to either{' '}
                        <Anchor
                            href={
                                'https://docs.bigbytes.com/get-started/setup-bigbytes/connect-project#2-import-a-dbt-project'
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            change your connection type
                        </Anchor>
                        , setup a{' '}
                        <Anchor
                            href={
                                'https://docs.bigbytes.com/guides/cli/how-to-use-bigbytes-deploy#automatically-deploy-your-changes-to-bigbytes-using-a-github-action'
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            GitHub action
                        </Anchor>
                        <br />
                        or, run{' '}
                        <Anchor
                            href={
                                'https://docs.bigbytes.com/guides/cli/how-to-use-bigbytes-deploy#bigbytes-deploy-syncs-the-changes-in-your-dbt-project-to-bigbytes'
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            bigbytes deploy
                        </Anchor>
                        ) from your command line.
                    </Text>
                </Popover.Dropdown>
            </Popover>
        );
    }

    const handleRefresh = () => {
        setIsLoading(true);
        refreshDbtServer();
        onClick?.();
        track({
            name: EventName.REFRESH_DBT_CONNECTION_BUTTON_CLICKED,
        });
    };

    if (data?.type === ProjectType.PREVIEW) {
        return (
            <Tooltip
                withinPortal
                label={`Developer previews are temporary Bigbytes projects`}
            >
                <Badge color="yellow" size="lg" radius="sm">
                    Developer preview
                </Badge>
            </Tooltip>
        );
    }

    return (
        <Tooltip
            withinPortal
            multiline
            w={320}
            position="bottom"
            label="If you've updated your YAML files, you can sync your changes to Bigbytes by clicking this button."
        >
            <Button
                size="xs"
                variant="default"
                leftIcon={leftIcon ?? <MantineIcon icon={IconRefresh} />}
                loading={isLoading}
                onClick={handleRefresh}
                sx={buttonStyles}
            >
                {!isLoading
                    ? defaultTextOverride ?? 'Refresh dbt'
                    : refreshingTextOverride ?? 'Refreshing dbt'}
            </Button>
        </Tooltip>
    );
};

export default RefreshDbtButton;
