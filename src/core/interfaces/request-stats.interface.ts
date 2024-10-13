export interface RequestStats {
  totalRequests: number;
  averageLatency: number;
  maxLatency: number;
  minLatency: number;
  requestsPerEndpoint: Record<string, number>;
  statusCodeDistribution: Record<string, number>;
}
