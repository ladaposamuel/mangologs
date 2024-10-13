import { StorageProvider } from '../storage/interfaces/storage-provider.interface';

import { ConfigProvider, MonitorConfig } from './interfaces/config.interface';
import { Logger, LoggerProvider, LogLevel } from './interfaces/logger.interface';
import { RequestStats } from './interfaces/request-stats.interface';

export interface RequestData {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  query?: Record<string, string>;
}

export interface ResponseData {
  statusCode: number;
  headers: Record<string, string>;
  body?: unknown;
}

export interface MonitoredRequest {
  id: string;
  request: RequestData;
  response: ResponseData;
  startTime: number;
  endTime: number;
  latency: number;
  serviceName: string;
}

export class Monitor {
  private logger: Logger;
  private config: MonitorConfig;
  private storageProvider: StorageProvider;

  constructor(
    configProvider: ConfigProvider,
    loggerProvider: LoggerProvider,
    storageProvider: StorageProvider,
  ) {
    this.config = configProvider.getConfig();
    this.logger = loggerProvider.getLogger('APIMonitor');
    this.storageProvider = storageProvider;

    this.logger.setLogLevel(this.config.logLevel as LogLevel);
    this.logger.info('API Monitor initialized', undefined, { config: this.config });
  }

  private shouldSampleRequest(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  private shouldIgnoreRequest(url: string): boolean {
    return this.config.ignorePaths.some((path) => url.startsWith(path));
  }

  private generateRequestId(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }

  async logRequest(
    req: RequestData,
    res: ResponseData,
    startTime: number,
    endTime: number,
  ): Promise<void> {
    if (!this.config.enabled) {
      return;
    }
    if (this.shouldIgnoreRequest(req.url)) {
      return;
    }
    if (!this.shouldSampleRequest()) {
      return;
    }

    const latency = endTime - startTime;
    const requestId = this.generateRequestId();

    const monitoredRequest: MonitoredRequest = {
      id: requestId,
      request: req,
      response: res,
      startTime,
      endTime,
      latency,
      serviceName: this.config.serviceName,
    };

    try {
      await this.storageProvider.store(monitoredRequest);
      this.logger.info(`Logged request to ${req.url}`, undefined, {
        requestId,
        method: req.method,
        statusCode: res.statusCode,
        latency,
      });

      if (latency > this.config.slowRequestThreshold) {
        this.logger.warn(`Slow request detected`, undefined, {
          requestId,
          method: req.method,
          url: req.url,
          latency,
        });
        if (this.config.alertsEnabled && this.config.alertWebhook) {
          // TODO: Implement alert mechanism
          this.sendAlert(monitoredRequest);
        }
      }
    } catch (error) {
      this.logger.error('Failed to store monitored request', undefined, { error, requestId });
    }
  }

  async getRequestStats(startDate: Date, endDate: Date): Promise<RequestStats> {
    this.logger.debug('Fetching request stats', 'Monitor', { startDate, endDate });
    const stats = await this.storageProvider.getStats(startDate, endDate);
    this.logger.debug('Retrieved request stats', 'Monitor', { stats });
    return stats;
  }
  private sendAlert(request: MonitoredRequest): void {
    // TODO: Implement alert sending mechanism
    this.logger.info('Sending alert for slow request', undefined, { requestId: request.id });
  }
}
