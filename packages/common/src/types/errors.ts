// eslint-disable-next-line max-classes-per-file
import { type DbtLog } from './job';

type ClairdashErrorParams = {
    message: string;
    name: string;
    statusCode: number;
    data: { [key: string]: any };
};

export class ClairdashError extends Error {
    statusCode: number;

    data: { [key: string]: any };

    constructor({ message, name, statusCode, data }: ClairdashErrorParams) {
        super(message);
        this.name = name;
        this.statusCode = statusCode;
        this.data = data;
    }
}

export class ForbiddenError extends ClairdashError {
    constructor(
        message = "You don't have access to this resource or action",
        data: { [key: string]: any } = {},
    ) {
        super({
            message,
            name: 'ForbiddenError',
            statusCode: 403,
            data,
        });
    }
}

export class DeactivatedAccountError extends ClairdashError {
    constructor(
        message = 'Your account has been deactivated. Please contact your organization administrator.',
        data: { [key: string]: any } = {},
    ) {
        super({
            message,
            name: 'DeactivatedAccountError',
            statusCode: 403,
            data,
        });
    }
}

export class AuthorizationError extends ClairdashError {
    constructor(
        message = "You don't have authorization to perform this action",
        data: { [key: string]: any } = {},
    ) {
        super({
            message,
            name: 'AuthorizationError',
            statusCode: 401,
            data,
        });
    }
}

export class NotExistsError extends ClairdashError {
    constructor(message: string) {
        super({
            message,
            name: 'NotExistsError',
            statusCode: 404,
            data: {},
        });
    }
}

export class ExpiredError extends ClairdashError {
    constructor(message: string) {
        super({
            message,
            name: 'ExpiredError',
            statusCode: 406,
            data: {},
        });
    }
}

export class ParameterError extends ClairdashError {
    constructor(
        message: string = 'Incorrect parameters',
        data: Record<string, any> = {},
    ) {
        super({
            message,
            name: 'ParameterError',
            statusCode: 400,
            data,
        });
    }
}

export class NonCompiledModelError extends ClairdashError {
    constructor(message: string, data: { [key: string]: any } = {}) {
        super({
            message,
            name: 'NonCompiledModelError',
            statusCode: 400,
            data,
        });
    }
}

export class MissingCatalogEntryError extends ClairdashError {
    constructor(message: string, data: { [key: string]: any }) {
        super({
            message,
            name: 'MissingCatalogEntryError',
            statusCode: 400,
            data,
        });
    }
}

export class MissingWarehouseCredentialsError extends ClairdashError {
    constructor(message: string) {
        super({
            message,
            name: 'MissingWarehouseCredentialsError',
            statusCode: 400,
            data: {},
        });
    }
}

export class UnexpectedServerError extends ClairdashError {
    constructor(
        message = 'Something went wrong.',
        data: { [key: string]: any } = {},
    ) {
        super({
            message,
            name: 'UnexpectedServerError',
            statusCode: 500,
            data,
        });
    }
}

export class UnexpectedGitError extends ClairdashError {
    constructor(
        message = 'Unexpected error in Git adapter',
        data: { [key: string]: any } = {},
    ) {
        super({
            message,
            name: 'UnexpectedGitError',
            statusCode: 400,
            data,
        });
    }
}

export class UnexpectedDatabaseError extends ClairdashError {
    constructor(
        message = 'Unexpected error in Clairdash database.',
        data: { [key: string]: any } = {},
    ) {
        super({
            message,
            name: 'UnexpectedDatabaseError',
            statusCode: 500,
            data,
        });
    }
}

export class ParseError extends ClairdashError {
    constructor(
        message = 'Error parsing dbt project and clairdash metadata',
        data: { [key: string]: any } = {},
    ) {
        super({
            message,
            name: 'ParseError',
            statusCode: 400,
            data,
        });
    }
}

export class CompileError extends ClairdashError {
    constructor(
        message = 'Error compiling sql from Clairdash configuration',
        data: Record<string, any> = {},
    ) {
        super({
            message,
            name: 'CompileError',
            statusCode: 400,
            data,
        });
    }
}

export class FieldReferenceError extends ClairdashError {
    constructor(
        message = 'Failed to reference field in dbt project',
        data: Record<string, any> = {},
    ) {
        super({
            message,
            name: 'FieldReferenceError',
            statusCode: 400,
            data,
        });
    }
}

export class DbtError extends ClairdashError {
    logs: DbtLog[] | undefined;

    constructor(message = 'Dbt raised an error', logs: DbtLog[] = []) {
        super({
            message,
            name: 'DbtError',
            statusCode: 400,
            data: {},
        });
        this.logs = logs;
    }
}

export class NotFoundError extends ClairdashError {
    constructor(message: string) {
        super({
            message,
            name: 'NotFoundError',
            statusCode: 404,
            data: {},
        });
    }
}

export class InvalidUser extends ClairdashError {
    constructor(message: string) {
        super({
            message,
            name: 'InvalidUser',
            statusCode: 404,
            data: {},
        });
    }
}

export class WarehouseConnectionError extends ClairdashError {
    constructor(message: string) {
        super({
            message,
            name: 'WarehouseConnectionError',
            statusCode: 400,
            data: {},
        });
    }
}

export class WarehouseQueryError extends ClairdashError {
    constructor(message: string, data: { [key: string]: any } = {}) {
        super({
            message,
            name: 'WarehouseQueryError',
            statusCode: 400,
            data,
        });
    }
}

export class SmptError extends ClairdashError {
    constructor(message: string, data: { [key: string]: any } = {}) {
        super({
            message,
            name: 'SmptError',
            statusCode: 500,
            data,
        });
    }
}

export class AlreadyProcessingError extends ClairdashError {
    constructor(message: string) {
        super({
            message,
            name: 'AlreadyProcessingError',
            statusCode: 409,
            data: {},
        });
    }
}
export class AlreadyExistsError extends ClairdashError {
    constructor(message: string) {
        super({
            message,
            name: 'AlreadyExistsError',
            statusCode: 409,
            data: {},
        });
    }
}

export class MissingConfigError extends ClairdashError {
    constructor(message: string) {
        super({
            message,
            name: 'MissingConfigError',
            statusCode: 422,
            data: {},
        });
    }
}

export class NotEnoughResults extends ClairdashError {
    constructor(message: string) {
        super({
            message,
            name: 'NotEnoughResults',
            statusCode: 406,
            data: {},
        });
    }
}

export class KnexPaginationError extends ClairdashError {
    constructor(message: string) {
        super({
            message,
            name: 'KnexPaginationError',
            statusCode: 422,
            data: {},
        });
    }
}

export class SlackInstallationNotFoundError extends ClairdashError {
    constructor(message: string = 'Could not find slack installation') {
        super({
            message,
            name: 'SlackInstallationNotFoundError',
            statusCode: 404,
            data: {},
        });
    }
}
