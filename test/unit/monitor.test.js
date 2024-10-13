"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const monitor_1 = require("../../src/core/monitor");
const logger_interface_1 = require("../../src/core/interfaces/logger.interface");
describe('Monitor', () => {
    let monitor;
    let mockConfigProvider;
    let mockLoggerProvider;
    let mockStorageProvider;
    let mockLogger;
    beforeEach(() => {
        mockConfigProvider = {
            getConfig: jest.fn().mockReturnValue({
                enabled: true,
                serviceName: 'TestService',
                sampleRate: 1,
                ignorePaths: ['/health'],
                slowRequestThreshold: 1000,
                logLevel: logger_interface_1.LogLevel.DEBUG
            }),
        };
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            log: jest.fn(),
            setLogLevel: jest.fn(),
            getLogLevel: jest.fn(),
        };
        mockLoggerProvider = {
            getLogger: jest.fn().mockReturnValue(mockLogger),
        };
        mockStorageProvider = {
            initialize: jest.fn(),
            store: jest.fn(),
            getStats: jest.fn(),
            getRequestById: jest.fn(),
            searchRequests: jest.fn(),
            deleteRequestsOlderThan: jest.fn(),
            close: jest.fn(),
        };
        monitor = new monitor_1.Monitor(mockConfigProvider, mockLoggerProvider, mockStorageProvider);
    });
    // ... rest of the test cases ...
    it('should retrieve request stats', async () => {
        const startDate = new Date('2023-01-01');
        const endDate = new Date('2023-01-31');
        const mockStats = {
            totalRequests: 100,
            averageLatency: 50,
            maxLatency: 100,
            minLatency: 10,
            requestsPerEndpoint: {},
            statusCodeDistribution: {}
        };
        mockStorageProvider.getStats.mockResolvedValue(mockStats);
        const stats = await monitor.getRequestStats(startDate, endDate);
        expect(mockStorageProvider.getStats).toHaveBeenCalledWith(startDate, endDate);
        expect(stats).toEqual(mockStats);
    });
});
//# sourceMappingURL=monitor.test.js.map