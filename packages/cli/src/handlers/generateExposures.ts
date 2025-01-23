import { AuthorizationError, DbtExposure } from '@bigbytes/common';
import { promises as fs } from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BigbytesAnalytics } from '../analytics/analytics';
import { getConfig } from '../config';
import GlobalState from '../globalState';
import * as styles from '../styles';
import { checkBigbytesVersion, bigbytesApi } from './dbt/apiClient';

type GenerateExposuresHandlerOptions = {
    projectDir: string;
    verbose: boolean;
    output?: string;
};

export const generateExposuresHandler = async (
    options: GenerateExposuresHandlerOptions,
) => {
    GlobalState.setVerbose(options.verbose);
    await checkBigbytesVersion();
    const executionId = uuidv4();
    const config = await getConfig();
    if (!(config.context?.project && config.context.serverUrl)) {
        throw new AuthorizationError(
            `No active Bigbytes project. Run 'bigbytes login --help'`,
        );
    }

    await BigbytesAnalytics.track({
        event: 'generate_exposures.started',
        properties: {
            executionId,
        },
    });

    console.info(
        styles.warning(
            `This is an experimental feature and may change in future versions`,
        ),
    );

    const spinner = GlobalState.startSpinner(
        `  Generating Bigbytes exposures .yml for project ${styles.bold(
            config.context.projectName || config.context.project,
        )}`,
    );
    try {
        const absoluteProjectPath = path.resolve(options.projectDir);

        const exposures = await bigbytesApi<Record<string, DbtExposure>>({
            method: 'GET',
            url: `/api/v1/projects/${config.context.project}/dbt-exposures`,
            body: undefined,
        });

        console.info(
            styles.info(`Found ${Object.keys(exposures).length} exposures`),
        );

        const outputFilePath =
            options.output ||
            path.join(absoluteProjectPath, 'models', 'bigbytes_exposures.yml');
        const updatedYml = {
            version: 2 as const,
            exposures: Object.values(exposures).map(
                ({ dependsOn, ...rest }) => ({
                    ...rest,
                    depends_on: dependsOn,
                }),
            ),
        };
        const ymlString = yaml.dump(updatedYml, {
            quotingType: '"',
        });
        await fs.writeFile(outputFilePath, ymlString);
        spinner.succeed(`  Generated exposures file in '${outputFilePath}'`);
        await BigbytesAnalytics.track({
            event: 'generate_exposures.completed',
            properties: {
                executionId,
                countExposures: Object.keys(exposures).length,
            },
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '-';
        await BigbytesAnalytics.track({
            event: 'generate_exposures.error',
            properties: {
                executionId,
                trigger: 'generate',
                error: `${msg}`,
            },
        });
        spinner.fail(`  Failed to generate exposures file'`);
        throw e;
    }
};
