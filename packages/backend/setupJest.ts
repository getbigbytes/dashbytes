import { enableFetchMocks } from 'jest-fetch-mock';
import {clairdashConfigMock} from "./src/config/clairdashConfig.mock";

enableFetchMocks();

jest.mock('./src/config/clairdashConfig', () => ({
    clairdashConfig: clairdashConfigMock,
}));