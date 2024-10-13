import { MonitoredRequest } from '../core/monitor';
import { StorageProvider } from '../storage/interfaces/storage-provider.interface';

import {
  DashboardData,
  EndpointStats,
  StatusCodeDistribution,
  RequestsOverTime,
} from './dashboard-data.interface';

export class DashboardService {
  constructor(private readonly storageProvider: StorageProvider) {}

  async getDashboardData(startDate: Date, endDate: Date): Promise<DashboardData> {
    const requests = await this.storageProvider.getRequests(startDate, endDate);

    return {
      totalRequests: requests.length,
      averageLatency: this.calculateAverageLatency(requests),
      errorRate: this.calculateErrorRate(requests),
      topEndpoints: this.getTopEndpoints(requests, 5),
      statusCodeDistribution: this.getStatusCodeDistribution(requests),
      requestsOverTime: this.getRequestsOverTime(requests),
      slowestEndpoints: this.getSlowestEndpoints(requests, 5),
    };
  }

  private calculateAverageLatency(requests: MonitoredRequest[]): number {
    const totalLatency = requests.reduce((sum, req) => sum + req.latency, 0);
    return requests.length > 0 ? totalLatency / requests.length : 0;
  }

  private calculateErrorRate(requests: MonitoredRequest[]): number {
    const errorCount = requests.filter((req) => req.response.statusCode >= 400).length;
    return requests.length > 0 ? (errorCount / requests.length) * 100 : 0;
  }

  private getTopEndpoints(requests: MonitoredRequest[], limit: number): EndpointStats[] {
    const endpointMap = new Map<string, EndpointStats>();

    requests.forEach((req) => {
      const url = req.request.url;
      const stats = endpointMap.get(url) || {
        url,
        totalRequests: 0,
        averageLatency: 0,
        errorRate: 0,
      };
      stats.totalRequests++;
      stats.averageLatency =
        (stats.averageLatency * (stats.totalRequests - 1) + req.latency) / stats.totalRequests;
      if (req.response.statusCode >= 400) {
        stats.errorRate = (stats.errorRate * (stats.totalRequests - 1) + 100) / stats.totalRequests;
      }
      endpointMap.set(url, stats);
    });

    return Array.from(endpointMap.values())
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, limit);
  }

  private getStatusCodeDistribution(requests: MonitoredRequest[]): StatusCodeDistribution {
    return requests.reduce((acc, req) => {
      const statusCode = req.response.statusCode.toString();
      acc[statusCode] = (acc[statusCode] || 0) + 1;
      return acc;
    }, {} as StatusCodeDistribution);
  }

  private getRequestsOverTime(requests: MonitoredRequest[]): RequestsOverTime[] {
    const timeMap = new Map<number, number>();
    const interval = 3600000; // 1 hour in milliseconds

    requests.forEach((req) => {
      const timestamp = Math.floor(req.startTime / interval) * interval;
      timeMap.set(timestamp, (timeMap.get(timestamp) || 0) + 1);
    });

    return Array.from(timeMap.entries())
      .map(([timestamp, count]) => ({ timestamp: new Date(timestamp), count }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private getSlowestEndpoints(requests: MonitoredRequest[], limit: number): EndpointStats[] {
    const endpointMap = new Map<string, EndpointStats>();

    requests.forEach((req) => {
      const url = req.request.url;
      const stats = endpointMap.get(url) || {
        url,
        totalRequests: 0,
        averageLatency: 0,
        errorRate: 0,
      };
      stats.totalRequests++;
      stats.averageLatency =
        (stats.averageLatency * (stats.totalRequests - 1) + req.latency) / stats.totalRequests;
      endpointMap.set(url, stats);
    });

    return Array.from(endpointMap.values())
      .sort((a, b) => b.averageLatency - a.averageLatency)
      .slice(0, limit);
  }
}
