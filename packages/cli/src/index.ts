#!/usr/bin/env node
import { BigbytesError, ValidationTarget } from '@bigbytes/common';
import { InvalidArgumentError, Option, program } from 'commander';
import { findDbtDefaultProfile } from './dbt/profile';
import { compileHandler } from './handlers/compile';
import { refreshHandler } from './handlers/dbt/refresh';
import { dbtRunHandler } from './handlers/dbt/run';
import { deployHandler } from './handlers/deploy';
import { downloadHandler, uploadHandler } from './handlers/download';
import { generateHandler } from './handlers/generate';
import { generateExposuresHandler } from './handlers/generateExposures';
import { login } from './handlers/login';
import {
    previewHandler,
    startPreviewHandler,
    stopPreviewHandler,
} from './handlers/preview';
import { setProjectHandler } from './handlers/setProject';
import { validateHandler } from './handlers/validate';
import * as styles from './styles';

// Suppress AWS SDK V2 warning, imported by snowflake SDK
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = '1';

const nodeVersion = require('parse-node-version')(process.version);

const OPTIMIZED_NODE_VERSION = 20;

const { version: VERSION } = require('../package.json');

const defaultProjectDir = process.env.DBT_PROJECT_DIR || '.';
const defaultProfilesDir: string = findDbtDefaultProfile();

function parseIntArgument(value: string) {
    const parsedValue = parseInt(value, 10);
    if (Number.isNaN(parsedValue)) {
        throw new InvalidArgumentError('Not a number.');
    }
    return parsedValue;
}

function parseStartOfWeekArgument(value: string) {
    const number = parseIntArgument(value);
    if (number < 0 || number > 6) {
        throw new InvalidArgumentError(
            'Not a valid number. Please use a number from 0 (Monday) to 6 (Sunday)',
        );
    }
    return number;
}

function parseUseDbtListOption(value: string | undefined): boolean {
    if (value === undefined) {
        return true;
    }
    return value.toLowerCase() !== 'false';
}

program
    .version(VERSION)
    .name(styles.title('⚡️bigbytes'))
    .description(
        'Developer tools for dbt and Bigbytes.\nSee https://docs.bigbytes.com for more help and examples',
    )
    .showHelpAfterError(
        styles.bold('Run ⚡️bigbytes help [command] for more information'),
    )
    .addHelpText(
        'after',
        `
${styles.bold('Examples:')}
  ${styles.title('⚡')}️bigbytes ${styles.bold('generate')} ${styles.secondary(
            '-- generates .yml file for all dbt models',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'generate',
        )} -s mymodel ${styles.secondary(
            '-- generates .yml file for a single dbt model',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'generate',
        )} -s model1 model2 ${styles.secondary(
            '-- generates .yml for multiple dbt models',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'generate',
        )} -s tag:sales ${styles.secondary(
            '-- generates .yml for all dbt models tagged as sales',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'generate',
        )} -s +mymodel ${styles.secondary(
            "-- generates .yml for mymodel and all it's parents",
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'generate',
        )} --help ${styles.secondary(
            '-- shows detailed help for the "generate" command',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold('dbt run')} ${styles.secondary(
            '-- runs dbt for all models and updates .yml for all models',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'dbt run',
        )} -s model1 model2+ tag:dev ${styles.secondary(
            '-- runs dbt for models and generates .yml for affected models',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'dbt run',
        )} --help ${styles.secondary(
            '-- shows detailed help for the "dbt run" command',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold('compile')} ${styles.secondary(
            '-- compiles Bigbytes metrics and dimensions',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold('deploy')} ${styles.secondary(
            '-- compiles and deploys Bigbytes metrics to active project',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'login https://bigbytes.domain.com',
        )} ${styles.secondary('-- logs in to a Bigbytes instance')}
`,
    );

// LOGIN
program
    .command('login <url>')
    .description('Logs in to a Bigbytes instance')
    .description(
        'Logs in to a Bigbytes instance.\n\n👀 See https://docs.bigbytes.com/guides/cli/cli-authentication for more help and examples',
    )
    .addHelpText(
        'after',
        `
${styles.bold('Examples:')}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'login',
        )} https://app.bigbytes.cloud ${styles.secondary(
            '-- Logs in to Bigbytes Cloud US instance',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'login',
        )} https://eu1.bigbytes.cloud ${styles.secondary(
            '-- Logs in to Bigbytes Cloud EU instance',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'login',
        )} https://custom.bigbytes.domain ${styles.secondary(
            '-- Logs in to a self-hosted instance at a custom domain',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'login',
        )} https://custom.bigbytes.domain --token 12345 ${styles.secondary(
            '-- Logs in with a personal access token (useful for users that use SSO in the browser)',
        )}
`,
    )
    .option('--token <token>', 'Login with a personal access token', undefined)
    .option('--verbose', undefined, false)

    .action(login);

// CONFIG
const configProgram = program
    .command('config')
    .description('Sets configuration');
configProgram
    .command('set-project')
    .description(
        'Choose project.\nSee https://docs.bigbytes.com/guides/cli/cli-authentication#set-active-project for more help and examples',
    )
    .option('--verbose', undefined, false)
    .addOption(
        new Option(
            '--name <project_name>',
            'Set the project non-interactively by passing a project name.',
        ),
    )
    .addOption(
        new Option(
            '--uuid <project_uuid>',
            'Set the project non-interactively by passing a project uuid.',
        ).conflicts('name'),
    )
    .action(setProjectHandler);

const dbtProgram = program.command('dbt').description('Runs dbt commands');

dbtProgram
    .command('run')
    .description('Runs dbt and then generates .yml for affected models')
    .addHelpText(
        'after',
        `
${styles.bold('Examples:')}
  ${styles.title('⚡')}️bigbytes ${styles.bold('dbt run')} ${styles.secondary(
            '-- run all models and generate .yml files',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'dbt run',
        )} -s mymodel ${styles.secondary(
            '-- runs a single model and generates .yml',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'dbt run',
        )} -s model1 model2 ${styles.secondary(
            '-- runs multiple models and generates .yml',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'dbt run',
        )} -s tag:sales ${styles.secondary(
            '-- runs all models tagged as "sales" and generates .yml',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'dbt run',
        )} -s +mymodel ${styles.secondary(
            "-- runs mymodel and it's parents and generates .yml",
        )}
`,
    )
    .option(
        '--project-dir <path>',
        'The directory of the dbt project',
        defaultProjectDir,
    )
    .option(
        '--profiles-dir <path>',
        'The directory of the dbt profiles',
        defaultProfilesDir,
    )
    .option('--profile <name>')
    .option('-t, --target <target>')
    .option('-x, --fail-fast')
    .option('--threads <threads>')
    .option('--no-version-check')
    .option('-s, --select, <select> [selects...]')
    .option('--state <state>')
    .option('--defer')
    .option('--no-defer')
    .option('--full-refresh')
    .option(
        '--exclude-meta',
        'exclude Bigbytes metadata from the generated .yml',
        false,
    )
    .option('--verbose', undefined, false)
    .option('-y, --assume-yes', 'assume yes to prompts', false)
    .action(dbtRunHandler);

program
    .command('compile')
    .description('Compiles Bigbytes resources')
    .option(
        '--project-dir <path>',
        'The directory of the dbt project',
        defaultProjectDir,
    )
    .option(
        '--profiles-dir <path>',
        'The directory of the dbt profiles',
        defaultProfilesDir,
    )
    .option(
        '--profile <name>',
        'The name of the profile to use (defaults to profile name in dbt_project.yml)',
        undefined,
    )
    .option('--target <name>', 'target to use in profiles.yml file', undefined)
    .option('--vars <vars>')
    .option('--threads <number>')
    .option('--no-version-check')
    .option(
        '-s, --select <models...>',
        'specify models (accepts dbt selection syntax)',
    )
    .option(
        '-m, --models <models...>',
        'specify models (accepts dbt selection syntax)',
    )
    .option('--exclude <models...>')
    .option('--selector <selector_name>')
    .option('--state <state>')
    .option('--full-refresh')
    .option('--verbose', undefined, false)

    .action(compileHandler);

program
    .command('preview')
    .description('Creates a new preview project - waits for a keypress to stop')
    .option(
        '--name <preview name>',
        'Custom name for the preview. If a name is not provided, a unique, randomly generated name will be created.',
    )
    .option(
        '--project-dir <path>',
        'The directory of the dbt project',
        defaultProjectDir,
    )
    .option(
        '--profiles-dir <path>',
        'The directory of the dbt profiles',
        defaultProfilesDir,
    )
    .option(
        '--profile <name>',
        'The name of the profile to use (defaults to profile name in dbt_project.yml)',
        undefined,
    )
    .option('--target <name>', 'target to use in profiles.yml file', undefined)
    .option('--vars <vars>')
    .option('--threads <number>')
    .option('--no-version-check')
    .option(
        '-s, --select <models...>',
        'specify models (accepts dbt selection syntax)',
    )
    .option(
        '-m, --models <models...>',
        'specify models (accepts dbt selection syntax)',
    )
    .option('--exclude <models...>')
    .option('--selector <selector_name>')
    .option('--state <state>')
    .option('--full-refresh')
    .option('--verbose', undefined, false)
    .option(
        '--start-of-week <number>',
        'Specifies the first day of the week (used by week-related date functions). 0 (Monday) to 6 (Sunday)',
        parseStartOfWeekArgument,
    )
    .option(
        '--skip-dbt-compile',
        'Skip `dbt compile` and deploy from the existing ./target/manifest.json',
        false,
    )
    .option(
        '--skip-warehouse-catalog',
        'Skip fetch warehouse catalog and use types in yml',
        false,
    )
    .option(
        '--use-dbt-list [true|false]',
        'Use `dbt list` instead of `dbt compile` to generate dbt manifest.json',
        parseUseDbtListOption,
        true,
    )
    .option('--ignore-errors', 'Allows deploy with errors on compile', false)
    .action(previewHandler);

program
    .command('start-preview')
    .description('Creates a new preview project')
    .option(
        '--name [preview name]',
        '[required] Name for the preview project. If a preview project with this name already exists, it will be updated, otherwise it will create a new preview project ',
    )
    .option(
        '--project-dir <path>',
        'The directory of the dbt project',
        defaultProjectDir,
    )
    .option(
        '--profiles-dir <path>',
        'The directory of the dbt profiles',
        defaultProfilesDir,
    )
    .option(
        '--profile <name>',
        'The name of the profile to use (defaults to profile name in dbt_project.yml)',
        undefined,
    )
    .option('--target <name>', 'target to use in profiles.yml file', undefined)
    .option('--vars <vars>')
    .option('--threads <number>')
    .option('--no-version-check')
    .option(
        '-s, --select <models...>',
        'specify models (accepts dbt selection syntax)',
    )
    .option(
        '-m, --models <models...>',
        'specify models (accepts dbt selection syntax)',
    )
    .option('--exclude <models...>')
    .option('--selector <selector_name>')
    .option('--state <state>')
    .option('--full-refresh')
    .option('--verbose', undefined, false)
    .option(
        '--start-of-week <number>',
        'Specifies the first day of the week (used by week-related date functions). 0 (Monday) to 6 (Sunday)',
        parseStartOfWeekArgument,
    )
    .option(
        '--skip-dbt-compile',
        'Skip `dbt compile` and deploy from the existing ./target/manifest.json',
        false,
    )
    .option(
        '--skip-warehouse-catalog',
        'Skip fetch warehouse catalog and use types in yml',
        false,
    )
    .option(
        '--use-dbt-list [true|false]',
        'Use `dbt list` instead of `dbt compile` to generate dbt manifest.json',
        parseUseDbtListOption,
        true,
    )
    .option('--ignore-errors', 'Allows deploy with errors on compile', false)
    .action(startPreviewHandler);

program
    .command('stop-preview')
    .description('Deletes preview project')
    .option(
        '--name [preview name]',
        '[required] Name for the preview project to be deleted',
    )
    .option('--verbose', undefined, false)
    .action(stopPreviewHandler);

program
    .command('download')
    .description('Downloads charts and dashboards as code')
    .option('--verbose', undefined, false)
    .action(downloadHandler);
program
    .command('upload')
    .description('Uploads charts and dashboards as code')
    .option('--verbose', undefined, false)
    .action(uploadHandler);

program
    .command('deploy')
    .description('Compiles and deploys a Bigbytes project')
    .option(
        '--project-dir <path>',
        'The directory of the dbt project',
        defaultProjectDir,
    )
    .option(
        '--profiles-dir <path>',
        'The directory of the dbt profiles',
        defaultProfilesDir,
    )
    .option(
        '--profile <name>',
        'The name of the profile to use (defaults to profile name in dbt_project.yml)',
        undefined,
    )
    .option('--target <name>', 'target to use in profiles.yml file', undefined)
    .option('--vars <vars>')
    .option('--threads <number>')
    .option('--no-version-check')
    .option(
        '-s, --select <models...>',
        'specify models (accepts dbt selection syntax)',
    )
    .option(
        '-m, --models <models...>',
        'specify models (accepts dbt selection syntax)',
    )
    .option('--exclude <models...>')
    .option('--selector <selector_name>')
    .option('--state <state>')
    .option('--full-refresh')
    .option('--verbose', undefined, false)

    .option(
        '--create [project_name]',
        "Create a new project. If a project name is not provided, you'll be prompted for one on creation.",
        undefined,
    )
    .option('--ignore-errors', 'Allows deploy with errors on compile', false)
    .option(
        '--start-of-week <number>',
        'Specifies the first day of the week (used by week-related date functions). 0 (Monday) to 6 (Sunday)',
        parseStartOfWeekArgument,
    )
    .option(
        '--skip-dbt-compile',
        'Skip `dbt compile` and deploy from the existing ./target/manifest.json',
        false,
    )
    .option(
        '--skip-warehouse-catalog',
        'Skip fetch warehouse catalog and use types in yml',
        false,
    )
    .option(
        '--use-dbt-list [true|false]',
        'Use `dbt list` instead of `dbt compile` to generate dbt manifest.json',
        parseUseDbtListOption,
        true,
    )
    .action(deployHandler);

program
    .command('refresh')
    .description('Refreshes Bigbytes project with remote repository')
    .addHelpText(
        'after',
        `
${styles.bold('Examples:')}
  ${styles.title('⚡')}️bigbytes ${styles.bold('refresh')}
`,
    )
    .option('--verbose', undefined, false)
    .action(refreshHandler);

program
    .command('validate')
    .description('Validates a project')
    .option(
        '--project <project uuid>',
        'Project UUID to validate, if not provided, the last preview will be used',
    )
    .option('--verbose', undefined, false)
    .option(
        '--project-dir <path>',
        'The directory of the dbt project',
        defaultProjectDir,
    )
    .option(
        '--profiles-dir <path>',
        'The directory of the dbt profiles',
        defaultProfilesDir,
    )
    .option(
        '--profile <name>',
        'The name of the profile to use (defaults to profile name in dbt_project.yml)',
        undefined,
    )
    .option('--target <name>', 'target to use in profiles.yml file', undefined)
    .option('--vars <vars>')
    .option('--threads <number>')
    .option('--no-version-check')
    .option('--preview', 'Validate the last preview if available', false)
    .option(
        '-s, --select <models...>',
        'specify models (accepts dbt selection syntax)',
    )
    .option(
        '-m, --models <models...>',
        'specify models (accepts dbt selection syntax)',
    )
    .option('--exclude <models...>')
    .option('--selector <selector_name>')
    .option('--state <state>')
    .option('--full-refresh')
    .option('--verbose', undefined, false)
    .option(
        '--skip-dbt-compile',
        'Skip `dbt compile` and deploy from the existing ./target/manifest.json',
        false,
    )
    .option(
        '--skip-warehouse-catalog',
        'Skip fetch warehouse catalog and use types in yml',
        false,
    )
    .option(
        '--use-dbt-list [true|false]',
        'Use `dbt list` instead of `dbt compile` to generate dbt manifest.json',
        parseUseDbtListOption,
        true,
    )
    .addOption(
        new Option('--only <elems...>', 'Specify project elements to validate')
            .choices(Object.values(ValidationTarget))
            .default(Object.values(ValidationTarget)),
    )
    .action(validateHandler);

program
    .command('generate')
    .description('Generates a new schema.yml file for model')
    .addHelpText(
        'after',
        `
${styles.bold('Examples:')}
  ${styles.title('⚡')}️bigbytes ${styles.bold('generate')} ${styles.secondary(
            '-- generates .yml file for all dbt models',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'generate',
        )} -s mymodel ${styles.secondary(
            '-- generates .yml file for a single dbt model',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'generate',
        )} -s model1 model2 ${styles.secondary(
            '-- generates .yml for multiple dbt models',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'generate',
        )} -s tag:sales ${styles.secondary(
            '-- generates .yml for all dbt models tagged as sales',
        )}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'generate',
        )} -s +mymodel ${styles.secondary(
            "-- generates .yml for mymodel and all it's parents",
        )}
`,
    )

    .option(
        '-s, --select <models...>',
        'specify models (accepts dbt selection syntax)',
    )
    .option(
        '-e, --exclude <models...>',
        'specify models (accepts dbt selection syntax)',
    )
    .option(
        '-m, --models <models...>',
        'specify models (accepts dbt selection syntax)',
    )
    .option(
        '--project-dir <path>',
        'The directory of the dbt project',
        defaultProjectDir,
    )
    .option(
        '--profiles-dir <path>',
        'The directory of the dbt profiles',
        defaultProfilesDir,
    )
    .option(
        '--profile <name>',
        'The name of the profile to use (defaults to profile name in dbt_project.yml)',
        undefined,
    )
    .option('--target <name>', 'target to use in profiles.yml file', undefined)
    .option('--vars <vars>')
    .option('-y, --assume-yes', 'assume yes to prompts', false)
    .option(
        '--exclude-meta',
        'exclude Bigbytes metadata from the generated .yml',
        false,
    )
    .option('--verbose', undefined, false)

    .action(generateHandler);

program
    .command('generate-exposures')
    .description(
        '[Experimental command] Generates a .yml file for Bigbytes exposures',
    )
    .addHelpText(
        'after',
        `
${styles.bold('Examples:')}
  ${styles.title('⚡')}️bigbytes ${styles.bold(
            'generate-exposures',
        )} ${styles.secondary(
            '-- generates .yml file for all bigbytes exposures',
        )}
`,
    )
    .option(
        '--project-dir <path>',
        'The directory of the dbt project',
        defaultProjectDir,
    )
    .option('--verbose', undefined, false)
    .option(
        '--output <path>',
        'The path where the output exposures YAML file will be written',
        undefined,
    )
    .action(generateExposuresHandler);

const errorHandler = (err: Error) => {
    console.error(styles.error(err.message || 'Error had no message'));
    if (err.name === 'AuthorizationError') {
        console.error(
            `Looks like you did not authenticate or the personal access token expired.\n\n👀 See https://docs.bigbytes.com/guides/cli/cli-authentication for help and examples`,
        );
    } else if (!(err instanceof BigbytesError)) {
        console.error(err);
        if (err.stack) {
            console.error(err.stack);
        }
        console.error('\nReport this issue with 1-click:\n');
        console.error(
            `  🐛 https://github.com/getbigbytes/bigbytes/issues/new?assignees=&labels=🐛+bug&template=bug_report.md&title=${encodeURIComponent(
                err.message,
            )}`,
        );
    }
    if (err.message.includes('ENOENT: dbt')) {
        console.error(
            styles.error(
                `\n You must have dbt installed to use this command. See https://docs.getdbt.com/docs/core/installation for installation instructions`,
            ),
        );
    }
    if (nodeVersion.major !== OPTIMIZED_NODE_VERSION) {
        console.warn(
            styles.warning(
                `⚠️ You are using Node.js version ${process.version}. Bigbytes CLI is optimized for v${OPTIMIZED_NODE_VERSION} so you might experience issues.`,
            ),
        );
    }
    process.exit(1);
};

const successHandler = () => {
    console.error(`Done 🕶`);
    process.exit(0);
};

program.parseAsync().then(successHandler).catch(errorHandler);
