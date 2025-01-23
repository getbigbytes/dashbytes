import { bigbytesConfigMock } from '../config/bigbytesConfig.mock';
import { BigbytesAnalytics } from './BigbytesAnalytics';

export const analyticsMock = new BigbytesAnalytics({
    bigbytesConfig: bigbytesConfigMock,
    writeKey: 'notrack',
    dataPlaneUrl: 'notrack',
    options: {
        enable: false,
    },
});
