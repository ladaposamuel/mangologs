export interface EndpointStats {
  url: string;
  totalRequests: number;
  averageLatency: number;
  errorRate: number;
}

export interface StatusCodeDistribution {
  [statusCode: string]: number;
}

export interface RequestsOverTime {
  timestamp: Date;
  count: number;
}

export interface DashboardData {
  totalRequests: number;
  averageLatency: number;
  errorRate: number;
  topEndpoints: EndpointStats[];
  statusCodeDistribution: StatusCodeDistribution;
  requestsOverTime: RequestsOverTime[];
  slowestEndpoints: EndpointStats[];
}
