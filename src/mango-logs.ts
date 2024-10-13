import { ExpressAdapter } from './adapters/express-adapter';
import { NestAdapter } from './adapters/nest-adapter';
import { NodeAdapter } from './adapters/node-adapter';
import { MonitorConfig, ConfigProvider } from './core/interfaces/config.interface';
import { Logger, LoggerProvider, LogLevel, LogEntry } from './core/interfaces/logger.interface';
import { DefaultLogger, DefaultLoggerProvider } from './core/logger';
import { Monitor, MonitoredRequest, RequestData, ResponseData } from './core/monitor';
import { DashboardService } from './dashboard/dashboard-service';
import { InMemoryStorageProvider } from './storage/in-memory-provider';
import { StorageProvider, RequestStats } from './storage/interfaces/storage-provider.interface';
import { MSSQLStorageProvider } from './storage/mssql-provider';
import { handleError, ApiMonitorError, isApiMonitorError } from './utils/error-handler';
import { parseRequest, convertToRequestData, maskSensitiveData } from './utils/request-parser';

// Core
export { Monitor, MonitoredRequest, RequestData, ResponseData };
export { DefaultLogger, DefaultLoggerProvider };

// Interfaces
export { MonitorConfig, ConfigProvider };
export { Logger, LoggerProvider, LogLevel, LogEntry };
export { StorageProvider, RequestStats };

// Dashboard
export { DashboardService };

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
