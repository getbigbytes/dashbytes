import { ClairdashError, UnexpectedServerError } from '@clairdash/common';
import { ValidateError } from '@tsoa/runtime';

export const errorHandler = (error: Error): ClairdashError => {
    if (error instanceof ValidateError) {
        return new ClairdashError({
            statusCode: 422,
            name: error.name,
            message: error.message,
            data: error.fields,
        });
    }
    if (error instanceof ClairdashError) {
        return error;
    }
    // Return a generic error to avoid exposing internal details
    return new UnexpectedServerError();
};
