import { enableFetchMocks } from 'jest-fetch-mock';
import {bigbytesConfigMock} from "./src/config/bigbytesConfig.mock";

enableFetchMocks();

jest.mock('./src/config/bigbytesConfig', () => ({
    bigbytesConfig: bigbytesConfigMock,
}));