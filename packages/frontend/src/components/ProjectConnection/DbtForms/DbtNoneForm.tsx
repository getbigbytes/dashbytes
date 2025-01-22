import { Alert, Anchor, Group, Stack, Switch, Text } from '@mantine/core';
import { IconExclamationCircle } from '@tabler/icons-react';
import { type FC } from 'react';
import { Controller } from 'react-hook-form';
import MantineIcon from '../../common/MantineIcon';

const DbtNoneForm: FC<{ disabled: boolean }> = ({ disabled }) => (
    <Stack>
        <Alert
            color="orange"
            icon={<MantineIcon icon={IconExclamationCircle} size="lg" />}
        >
            <Text color="orange">
                This project was created from the CLI. If you want to keep
                Clairdash in sync with your dbt project, you need to either{' '}
                <Anchor
                    href={
                        'https://docs.clairdash.com/get-started/setup-clairdash/connect-project#2-import-a-dbt-project'
                    }
                    target="_blank"
                    rel="noreferrer"
                >
                    change your connection type
                </Anchor>
                , setup a{' '}
                <Anchor
                    href={
                        'https://docs.clairdash.com/guides/cli/how-to-use-clairdash-deploy#automatically-deploy-your-changes-to-clairdash-using-a-github-action'
                    }
                    target="_blank"
                    rel="noreferrer"
                >
                    GitHub action
                </Anchor>{' '}
                or, run{' '}
                <Anchor
                    href={
                        'https://docs.clairdash.com/guides/cli/how-to-use-clairdash-deploy#clairdash-deploy-syncs-the-changes-in-your-dbt-project-to-clairdash'
                    }
                    target="_blank"
                    rel="noreferrer"
                >
                    clairdash deploy
                </Anchor>{' '}
                from your command line.
            </Text>
        </Alert>

        <Controller
            name="dbt.hideRefreshButton"
            render={({ field }) => (
                <Switch.Group
                    label="Hide refresh dbt button in the app"
                    description={
                        <p>
                            This will hide the refresh dbt button from the
                            explore page. Read more about your{' '}
                            <Anchor
                                href={
                                    'https://docs.clairdash.com/references/dbt-projects'
                                }
                                target="_blank"
                                rel="noreferrer"
                            >
                                options for refreshing dbt here
                            </Anchor>
                        </p>
                    }
                    value={field.value ? ['true'] : []}
                    onChange={(values) => field.onChange(values.length > 0)}
                    size="md"
                >
                    <Group mt="xs">
                        <Switch
                            onLabel="Yes"
                            offLabel="No"
                            value="true"
                            disabled={disabled}
                        />
                    </Group>
                </Switch.Group>
            )}
        />
    </Stack>
);

export default DbtNoneForm;
