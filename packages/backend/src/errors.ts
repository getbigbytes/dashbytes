import { BigbytesError, UnexpectedServerError } from '@bigbytes/common';
import { ValidateError } from '@tsoa/runtime';

export const errorHandler = (error: Error): BigbytesError => {
    if (error instanceof ValidateError) {
        return new BigbytesError({
            statusCode: 422,
            name: error.name,
            message: error.message,
            data: error.fields,
        });
    }
    if (error instanceof BigbytesError) {
        return error;
    }
    // Return a generic error to avoid exposing internal details
    return new UnexpectedServerError();
};
