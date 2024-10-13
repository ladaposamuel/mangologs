import { Monitor } from '../../src/core/monitor';
import { ConfigProvider, MonitorConfig } from '../../src/core/interfaces/config.interface';
import { LoggerProvider, Logger, LogLevel } from '../../src/core/interfaces/logger.interface';
import { StorageProvider } from '../../src/storage/interfaces/storage-provider.interface';
import { RequestStats } from '../../src/core/interfaces/request-stats.interface';

describe('Monitor', () => {
  let monitor: Monitor;
  let mockConfigProvider: jest.Mocked<ConfigProvider>;
  let mockLoggerProvider: jest.Mocked<LoggerProvider>;
  let mockStorageProvider: jest.Mocked<StorageProvider>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockConfigProvider = {
      getConfig: jest.fn().mockReturnValue({
        enabled: true,
        serviceName: 'TestService',
        sampleRate: 1,
        ignorePaths: ['/health'],
        slowRequestThreshold: 1000,
        logLevel: LogLevel.DEBUG
      } as MonitorConfig),
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

    monitor = new Monitor(mockConfigProvider, mockLoggerProvider, mockStorageProvider);
  });

  // ... rest of the test cases ...

  it('should retrieve request stats', async () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-01-31');
    const mockStats: RequestStats = {
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