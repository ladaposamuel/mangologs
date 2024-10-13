import { MonitoredRequest } from '../../core/monitor';

export interface RequestStats {
  totalRequests: number;
  averageLatency: number;
  maxLatency: number;
  minLatency: number;
  requestsPerEndpoint: Record<string, number>;
  statusCodeDistribution: Record<string, number>;
}

export interface StorageProvider {
  /**
   * Initialize the storage provider.
   * This method should handle any setup required for the storage solution.
   */
  initialize(): Promise<void>;

  /**
   * Store a monitored request.
   * @param request The monitored request to store
   */
  store(request: MonitoredRequest): Promise<void>;

  /**
   * Retrieve stats for monitored requests within a given time range.
   * @param startDate The start of the time range
   * @param endDate The end of the time range
   */
  getStats(startDate: Date, endDate: Date): Promise<RequestStats>;

  /**
   * Retrieve a specific monitored request by its ID.
   * @param id The ID of the monitored request
   */
  getRequestById(id: string): Promise<MonitoredRequest | null>;

  /**
   * Retrieve monitored requests that match certain criteria.
   * @param criteria An object specifying the search criteria
   * @param limit The maximum number of requests to return
   * @param offset The number of requests to skip (for pagination)
   */
  searchRequests(
    criteria: Partial<MonitoredRequest>,
    limit: number,
    offset: number,
  ): Promise<MonitoredRequest[]>;

  /**
   * Delete monitored requests older than a specified date.
   * @param date Delete all requests older than this date
   */
  deleteRequestsOlderThan(date: Date): Promise<number>;

  /**
   * Close the connection to the storage.
   * This method should handle any cleanup required.
   */
  close(): Promise<void>;
}
