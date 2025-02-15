import { type HealthState, type BigbytesUser } from '@bigbytes/common';
import * as Sentry from '@sentry/react';
import { useEffect, useState } from 'react';

const useSentry = (
    sentryConfig: HealthState['sentry'] | undefined,
    user: BigbytesUser | undefined,
) => {
    const [isSentryLoaded, setIsSentryLoaded] = useState(false);

    useEffect(() => {
        if (sentryConfig && !isSentryLoaded && sentryConfig.frontend.dsn) {
            Sentry.init({
                dsn: sentryConfig.frontend.dsn,
                release: sentryConfig.release,
                environment: sentryConfig.environment,
                integrations: [
                    Sentry.browserTracingIntegration(),
                    Sentry.replayIntegration(),
                ],
                tracesSampler(samplingContext) {
                    if (samplingContext.parentSampled !== undefined) {
                        return samplingContext.parentSampled;
                    }

                    return sentryConfig.tracesSampleRate;
                },
                replaysOnErrorSampleRate: 1.0,
            });
            setIsSentryLoaded(true);
        }
        if (user) {
            Sentry.setUser({
                id: user.userUuid,
                email: user.email,
                username: user.email,
            });
            Sentry.setTag('organization', user.organizationUuid);
        }
    }, [isSentryLoaded, setIsSentryLoaded, sentryConfig, user]);
};

export default useSentry;
