import { clairdashConfigMock } from '../config/clairdashConfig.mock';
import { ClairdashAnalytics } from './ClairdashAnalytics';

export const analyticsMock = new ClairdashAnalytics({
    clairdashConfig: clairdashConfigMock,
    writeKey: 'notrack',
    dataPlaneUrl: 'notrack',
    options: {
        enable: false,
    },
});
