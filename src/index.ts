import { ExpressAdapter } from './adapters/express-adapter';
import { NestAdapter } from './adapters/nest-adapter';
import { NodeAdapter } from './adapters/node-adapter';
import { MonitorConfig, ConfigProvider } from './core/interfaces/config.interface';
import { DefaultLoggerProvider } from './core/logger';
import { Monitor } from './core/monitor';
import { InMemoryStorageProvider } from './storage/in-memory-provider';
import { MSSQLStorageProvider } from './storage/mssql-provider';

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
        serviceName: config.serviceName || 'MangoLogs',
        sampleRate: config.sampleRate || 1,
        ignorePaths: config.ignorePaths || [],
        slowRequestThreshold: config.slowRequestThreshold || 1000,
      }),
    };

    const loggerProvider = new DefaultLoggerProvider();
    const storageProvider =
      config.storageType === 'mssql'
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

// Re-export everything from mango-logs.ts
export * from './mango-logs';
