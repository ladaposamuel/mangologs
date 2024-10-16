"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const monitor_1 = require("../../src/core/monitor");
const logger_1 = require("../../src/core/logger");
const in_memory_provider_1 = require("../../src/storage/in-memory-provider");
describe('Monitor Integration', () => {
    let monitor;
    let configProvider;
    let storageProvider;
    beforeEach(async () => {
        configProvider = {
            getConfig: () => ({
                enabled: true,
                serviceName: 'TestService',
                sampleRate: 1,
                ignorePaths: ['/health'],
                slowRequestThreshold: 1000,
            }),
        };
        storageProvider = new in_memory_provider_1.InMemoryStorageProvider();
        await storageProvider.initialize();
        const loggerProvider = new logger_1.DefaultLoggerProvider();
        monitor = new monitor_1.Monitor(configProvider, loggerProvider, storageProvider);
    });
    it('should log requests and retrieve stats', async () => {
        const startDate = new Date();
        console.log('Test start time:', startDate.toISOString());
        // Log first request
        await monitor.logRequest({ method: 'GET', url: '/test1', headers: {} }, { statusCode: 200, headers: {} }, startDate.getTime(), startDate.getTime() + 100);
        console.log('Logged first request at:', new Date(startDate.getTime() + 100).toISOString());
        // Log second request
        await monitor.logRequest({ method: 'POST', url: '/test2', headers: {} }, { statusCode: 404, headers: {} }, startDate.getTime() + 100, startDate.getTime() + 300);
        console.log('Logged second request at:', new Date(startDate.getTime() + 300).toISOString());
        // Add a small delay to ensure storage operations complete
        await new Promise((resolve) => setTimeout(resolve, 100));
        const endDate = new Date();
        console.log('Test end time:', endDate.toISOString());
        console.log('Fetching stats from', startDate.toISOString(), 'to', endDate.toISOString());
        const stats = await monitor.getRequestStats(startDate, endDate);
        console.log('Retrieved stats:', JSON.stringify(stats, null, 2));
        console.log('Current storage state:', JSON.stringify(await storageProvider.getAllRequests(), null, 2));
        expect(stats.totalRequests).toBe(2);
        expect(stats.requestsPerEndpoint['/test1']).toBe(1);
        expect(stats.requestsPerEndpoint['/test2']).toBe(1);
        expect(stats.statusCodeDistribution['200']).toBe(1);
        expect(stats.statusCodeDistribution['404']).toBe(1);
    });
});
//# sourceMappingURL=monitor.integration.test.js.map