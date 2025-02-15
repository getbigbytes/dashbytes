import { isRequestMethod, RequestMethod } from '../types/api';

export const BigbytesRequestMethodHeader = 'Bigbytes-Request-Method';

export const getRequestMethod = (
    headerValue: string | undefined,
): RequestMethod =>
    isRequestMethod(headerValue) ? headerValue : RequestMethod.UNKNOWN;
