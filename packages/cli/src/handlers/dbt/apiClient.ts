import {
    ApiError,
    ApiHealthResults,
    ApiResponse,
    AuthorizationError,
    ClairdashError,
    ClairdashRequestMethodHeader,
    RequestMethod,
} from '@clairdash/common';
import fetch, { BodyInit } from 'node-fetch';
import { URL } from 'url';
import { getConfig } from '../../config';
import GlobalState from '../../globalState';
import * as styles from '../../styles';

const { version: VERSION } = require('../../../package.json');

type ClairdashApiProps = {
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    url: string;
    body: BodyInit | undefined;
};
export const clairdashApi = async <T extends ApiResponse['results']>({
    method,
    url,
    body,
}: ClairdashApiProps): Promise<T> => {
    const config = await getConfig();
    if (!(config.context?.apiKey && config.context.serverUrl)) {
        throw new AuthorizationError(
            `Not logged in. Run 'clairdash login --help'`,
        );
    }
    const proxyAuthorizationHeader = config.context.proxyAuthorization
        ? { 'Proxy-Authorization': config.context.proxyAuthorization }
        : undefined;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `ApiKey ${config.context.apiKey}`,
        [ClairdashRequestMethodHeader]:
            process.env.CI === 'true'
                ? RequestMethod.CLI_CI
                : RequestMethod.CLI,
        ...proxyAuthorizationHeader,
    };
    const fullUrl = new URL(url, config.context.serverUrl).href;
    GlobalState.debug(`> Making HTTP ${method} request to: ${fullUrl}`);

    return fetch(fullUrl, { method, headers, body })
        .then((r) => {
            GlobalState.debug(`> HTTP request returned status: ${r.status}`);

            if (!r.ok)
                return r.json().then((d) => {
                    throw new ClairdashError(d.error);
                });
            return r;
        })
        .then((r) => r.json())
        .then((d: ApiResponse | ApiError) => {
            GlobalState.debug(`> HTTP request returned status: ${d.status}`);

            switch (d.status) {
                case 'ok':
                    return d.results as T;
                case 'error':
                    throw new ClairdashError(d.error);
                default:
                    throw new Error(d);
            }
        })
        .catch((err) => {
            throw err;
        });
};

export const checkClairdashVersion = async (): Promise<void> => {
    try {
        const health = await clairdashApi<ApiHealthResults>({
            method: 'GET',
            url: `/api/v1/health`,
            body: undefined,
        });
        if (health.version !== VERSION) {
            const config = await getConfig();
            console.error(
                `${styles.title(
                    'Warning',
                )}: CLI (${VERSION}) is running a different version than Clairdash (${
                    health.version
                }) on ${
                    config.context?.serverUrl
                }.\n         Some commands may fail, consider upgrading your CLI by doing: ${styles.secondary(
                    `npm install -g @clairdash/cli@${health.version}`,
                )}`,
            );
        }
    } catch (err) {
        // do nothing
    }
};
