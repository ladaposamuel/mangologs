import { Monitor, MonitoredRequest, RequestData, ResponseData } from './core/monitor';
import { DefaultLogger, DefaultLoggerProvider } from './core/logger';
import { MonitorConfig, ConfigProvider } from './core/interfaces/config.interface';
import { Logger, LoggerProvider, LogLevel, LogEntry } from './core/interfaces/logger.interface';
import { StorageProvider, RequestStats } from './storage/interfaces/storage-provider.interface';
import { ExpressAdapter } from './adapters/express-adapter';
import { NodeAdapter } from './adapters/node-adapter';
import { NestAdapter } from './adapters/nest-adapter';
import { InMemoryStorageProvider } from './storage/in-memory-provider';
import { MSSQLStorageProvider } from './storage/mssql-provider';
import { handleError, ApiMonitorError, isApiMonitorError } from './utils/error-handler';
import { parseRequest, convertToRequestData, maskSensitiveData } from './utils/request-parser';

export interface MangoLogsConfig extends MonitorConfig {
  apiKey: string;
  debug?: boolean;
  tags?: string[];
  serviceVersion?: string;
  redactHeaders?: string[];
  redactRequestBody?: string[];
  redactResponseBody?: string[];
}

export class MangoLogs {
  private monitor: Monitor;

  constructor(config: MangoLogsConfig) {
    const configProvider: ConfigProvider = {
      getConfig: () => ({
        ...config,
        enabled: true,
        serviceName: config.serviceName || "MangoLogs",
        sampleRate: config.sampleRate || 1,
        ignorePaths: config.ignorePaths || [],
        slowRequestThreshold: config.slowRequestThreshold || 1000,
      }),
    };

    const loggerProvider = new DefaultLoggerProvider();
    const storageProvider =
      config.storageType === "mssql"
        ? new MSSQLStorageProvider(config.mssqlConfig!)
        : new InMemoryStorageProvider();

    this.monitor = new Monitor(configProvider, loggerProvider, storageProvider);
  }

  get nestInterceptor() {
    return new NestAdapter(this.monitor);
  }

  get expressMiddleware() {
    return new ExpressAdapter(this.monitor).middleware();
  }

  get nodeMiddleware() {
    return new NodeAdapter(this.monitor).wrapServer;
  }

  static NewClient(config: MangoLogsConfig): MangoLogs {
    return new MangoLogs(config);
  }
}

// Core
export { Monitor, MonitoredRequest, RequestData, ResponseData };
export { DefaultLogger, DefaultLoggerProvider };

// Interfaces
export { MonitorConfig, ConfigProvider };
export { Logger, LoggerProvider, LogLevel, LogEntry };
export { StorageProvider, RequestStats };

// Dashboard
// Note: This will be implemented later
// export { DashboardService } from './dashboard/dashboard-service';


// Adapters
export { ExpressAdapter };
export { NodeAdapter };
export { NestAdapter };

// Storage Providers
export { InMemoryStorageProvider };
export { MSSQLStorageProvider };

// Utility functions
export { handleError, ApiMonitorError, isApiMonitorError };
export { parseRequest, convertToRequestData, maskSensitiveData };

/**
 * Creates and initializes a new Monitor instance.
 * @param config The configuration for MangoLogs
 * @returns A new MangoLogs instance
 */
export function createMangoLogs(config: MangoLogsConfig): MangoLogs {
  return MangoLogs.NewClient(config);
}

// Maintain backwards compatibility
export const createMonitor = createMangoLogs;