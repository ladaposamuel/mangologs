import { MonitoredRequest } from '../core/monitor';

import { StorageProvider, RequestStats } from './interfaces/storage-provider.interface';

export class InMemoryStorageProvider implements StorageProvider {
  private requests: MonitoredRequest[] = [];

  async initialize(): Promise<void> {
    // No initialization needed for in-memory storage
  }

  async store(request: MonitoredRequest): Promise<void> {
    this.requests.push(request);
  }

  async getStats(startDate: Date, endDate: Date): Promise<RequestStats> {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    const filteredRequests = this.requests.filter(
      (req) =>
        (req.startTime >= startTime && req.startTime <= endTime) ||
        (req.endTime >= startTime && req.endTime <= endTime) ||
        (req.startTime <= startTime && req.endTime >= endTime),
    );

    const totalRequests = filteredRequests.length;
    const latencies = filteredRequests.map((req) => req.latency);
    const averageLatency =
      latencies.reduce((sum, latency) => sum + latency, 0) / totalRequests || 0;

    const requestsPerEndpoint: Record<string, number> = {};
    const statusCodeDistribution: Record<string, number> = {};

    filteredRequests.forEach((req) => {
      requestsPerEndpoint[req.request.url] = (requestsPerEndpoint[req.request.url] || 0) + 1;
      const statusCode = req.response.statusCode.toString();
      statusCodeDistribution[statusCode] = (statusCodeDistribution[statusCode] || 0) + 1;
    });

    return {
      totalRequests,
      averageLatency,
      maxLatency: Math.max(...latencies, 0),
      minLatency: Math.min(...latencies, 0),
      requestsPerEndpoint,
      statusCodeDistribution,
    };
  }

  async getRequestById(id: string): Promise<MonitoredRequest | null> {
    return this.requests.find((req) => req.id === id) || null;
  }

  async getAllRequests(): Promise<MonitoredRequest[]> {
    return this.requests;
  }

  async searchRequests(
    criteria: Partial<MonitoredRequest>,
    limit: number,
    offset: number,
  ): Promise<MonitoredRequest[]> {
    return this.requests
      .filter((req) =>
        Object.entries(criteria).every(
          ([key, value]) => req[key as keyof MonitoredRequest] === value,
        ),
      )
      .slice(offset, offset + limit);
  }

  async deleteRequestsOlderThan(date: Date): Promise<number> {
    const initialCount = this.requests.length;
    this.requests = this.requests.filter((req) => req.startTime >= date.getTime());
    return initialCount - this.requests.length;
  }

  async close(): Promise<void> {
    // No cleanup needed for in-memory storage
  }
}
