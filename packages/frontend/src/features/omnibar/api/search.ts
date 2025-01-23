import { type SearchFilters, type SearchResults } from '@bigbytes/common';
import { isNil, omitBy } from 'lodash';
import { bigbytesApi } from '../../../api';

export const getSearchResults = async ({
    projectUuid,
    query,
    filters,
}: {
    projectUuid: string;
    query: string;
    filters?: SearchFilters;
}) => {
    const sanitisedFilters = omitBy(filters, isNil);
    const searchParams = sanitisedFilters
        ? new URLSearchParams(sanitisedFilters).toString()
        : undefined;

    return bigbytesApi<SearchResults>({
        url: `/projects/${projectUuid}/search/${encodeURIComponent(query)}${
            searchParams ? `?${searchParams}` : ''
        }`,
        method: 'GET',
        body: undefined,
    });
};
