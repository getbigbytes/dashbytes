// eslint-disable-next-line max-classes-per-file
import { type DbtLog } from './job';

type BigbytesErrorParams = {
    message: string;
    name: string;
    statusCode: number;
    data: { [key: string]: any };
};

export class BigbytesError extends Error {
    statusCode: number;

    data: { [key: string]: any };

    constructor({ message, name, statusCode, data }: BigbytesErrorParams) {
        super(message);
        this.name = name;
        this.statusCode = statusCode;
        this.data = data;
    }
}

export class ForbiddenError extends BigbytesError {
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

export class DeactivatedAccountError extends BigbytesError {
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

export class AuthorizationError extends BigbytesError {
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

export class NotExistsError extends BigbytesError {
    constructor(message: string) {
        super({
            message,
            name: 'NotExistsError',
            statusCode: 404,
            data: {},
        });
    }
}

export class ExpiredError extends BigbytesError {
    constructor(message: string) {
        super({
            message,
            name: 'ExpiredError',
            statusCode: 406,
            data: {},
        });
    }
}

export class ParameterError extends BigbytesError {
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

export class NonCompiledModelError extends BigbytesError {
    constructor(message: string, data: { [key: string]: any } = {}) {
        super({
            message,
            name: 'NonCompiledModelError',
            statusCode: 400,
            data,
        });
    }
}

export class MissingCatalogEntryError extends BigbytesError {
    constructor(message: string, data: { [key: string]: any }) {
        super({
            message,
            name: 'MissingCatalogEntryError',
            statusCode: 400,
            data,
        });
    }
}

export class MissingWarehouseCredentialsError extends BigbytesError {
    constructor(message: string) {
        super({
            message,
            name: 'MissingWarehouseCredentialsError',
            statusCode: 400,
            data: {},
        });
    }
}

export class UnexpectedServerError extends BigbytesError {
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

export class UnexpectedGitError extends BigbytesError {
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

export class UnexpectedDatabaseError extends BigbytesError {
    constructor(
        message = 'Unexpected error in Bigbytes database.',
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

export class ParseError extends BigbytesError {
    constructor(
        message = 'Error parsing dbt project and bigbytes metadata',
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

export class CompileError extends BigbytesError {
    constructor(
        message = 'Error compiling sql from Bigbytes configuration',
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

export class FieldReferenceError extends BigbytesError {
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

export class DbtError extends BigbytesError {
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

export class NotFoundError extends BigbytesError {
    constructor(message: string) {
        super({
            message,
            name: 'NotFoundError',
            statusCode: 404,
            data: {},
        });
    }
}

export class InvalidUser extends BigbytesError {
    constructor(message: string) {
        super({
            message,
            name: 'InvalidUser',
            statusCode: 404,
            data: {},
        });
    }
}

export class WarehouseConnectionError extends BigbytesError {
    constructor(message: string) {
        super({
            message,
            name: 'WarehouseConnectionError',
            statusCode: 400,
            data: {},
        });
    }
}

export class WarehouseQueryError extends BigbytesError {
    constructor(message: string, data: { [key: string]: any } = {}) {
        super({
            message,
            name: 'WarehouseQueryError',
            statusCode: 400,
            data,
        });
    }
}

export class SmptError extends BigbytesError {
    constructor(message: string, data: { [key: string]: any } = {}) {
        super({
            message,
            name: 'SmptError',
            statusCode: 500,
            data,
        });
    }
}

export class AlreadyProcessingError extends BigbytesError {
    constructor(message: string) {
        super({
            message,
            name: 'AlreadyProcessingError',
            statusCode: 409,
            data: {},
        });
    }
}
export class AlreadyExistsError extends BigbytesError {
    constructor(message: string) {
        super({
            message,
            name: 'AlreadyExistsError',
            statusCode: 409,
            data: {},
        });
    }
}

export class MissingConfigError extends BigbytesError {
    constructor(message: string) {
        super({
            message,
            name: 'MissingConfigError',
            statusCode: 422,
            data: {},
        });
    }
}

export class NotEnoughResults extends BigbytesError {
    constructor(message: string) {
        super({
            message,
            name: 'NotEnoughResults',
            statusCode: 406,
            data: {},
        });
    }
}

export class KnexPaginationError extends BigbytesError {
    constructor(message: string) {
        super({
            message,
            name: 'KnexPaginationError',
            statusCode: 422,
            data: {},
        });
    }
}

export class SlackInstallationNotFoundError extends BigbytesError {
    constructor(message: string = 'Could not find slack installation') {
        super({
            message,
            name: 'SlackInstallationNotFoundError',
            statusCode: 404,
            data: {},
        });
    }
}
