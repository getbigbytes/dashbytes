import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { bigbytesConfig } from './config/bigbytesConfig';
import { VERSION } from './version';

Sentry.init({
    release: VERSION,
    dsn: bigbytesConfig.sentry.backend.dsn,
    environment:
        process.env.NODE_ENV === 'development'
            ? 'development'
            : bigbytesConfig.mode,
    integrations: [
        // NOTE: Http, express, and postgres integrations are enabled by default
        nodeProfilingIntegration(),
        ...(bigbytesConfig.sentry.anr.enabled
            ? [
                  Sentry.anrIntegration({
                      pollInterval: 50, // ms
                      anrThreshold: bigbytesConfig.sentry.anr.timeout || 5000, // ms
                      captureStackTrace:
                          bigbytesConfig.sentry.anr.captureStacktrace,
                  }),
              ]
            : []),
    ],
    ignoreErrors: [
        'WarehouseQueryError',
        'FieldReferenceError',
        'NotEnoughResults',
        'CompileError',
        'NotExistsError',
        'NotFoundError',
        'ForbiddenError',
        'TokenError',
    ],
    tracesSampler: (context) => {
        if (
            context.request?.url?.endsWith('/status') ||
            context.request?.url?.endsWith('/health') ||
            context.request?.url?.endsWith('/favicon.ico') ||
            context.request?.url?.endsWith('/robots.txt') ||
            context.request?.url?.endsWith('livez') ||
            context.request?.headers?.['user-agent']?.includes('GoogleHC')
        ) {
            return 0.0;
        }
        if (context.parentSampled) {
            return context.parentSampled;
        }

        return bigbytesConfig.sentry.tracesSampleRate;
    },
    profilesSampleRate: bigbytesConfig.sentry.profilesSampleRate, // x% of samples will be profiled
    beforeBreadcrumb(breadcrumb) {
        if (
            breadcrumb.category === 'http' &&
            breadcrumb?.data?.url &&
            new URL(breadcrumb?.data.url).host ===
                new URL('https://hub.docker.com').host
        ) {
            return null;
        }
        return breadcrumb;
    },
});
