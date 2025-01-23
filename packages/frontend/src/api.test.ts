import nock from 'nock';
import { describe, expect, it } from 'vitest';
import { BASE_API_URL, bigbytesApi } from './api';

describe('api', () => {
    it('should handle success response', async () => {
        const scope = nock(BASE_API_URL)
            .matchHeader('Content-Type', 'application/json')
            .matchHeader('Bigbytes-Request-Method', 'WEB_APP')
            .get('/api/v1/test')
            .reply(200, {
                status: 'ok',
                results: 'test',
            });

        const result = await bigbytesApi({
            method: 'GET',
            url: '/test',
            body: null,
            headers: undefined,
        });

        scope.done();

        expect(result).toEqual('test');
        expect(scope.isDone()).toBe(true);
    });

    it('should allow custom headers', async () => {
        const scope = nock(BASE_API_URL)
            .matchHeader('Content-Type', 'application/json')
            .matchHeader('Bigbytes-Request-Method', 'TEST')
            .get('/api/v1/test')
            .reply(200, {
                status: 'ok',
                results: 'another test',
            });

        const result = await bigbytesApi({
            method: 'GET',
            url: '/test',
            body: null,
            headers: {
                'Bigbytes-Request-Method': 'TEST',
            },
        });

        scope.done();

        expect(scope.isDone()).toBe(true);
        expect(result).toEqual('another test');
    });
});
