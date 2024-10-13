import { StorageProvider, RequestStats } from './interfaces/storage-provider.interface';
import { MonitoredRequest } from '../core/monitor';
import * as sql from 'mssql';

export class MSSQLStorageProvider implements StorageProvider {
  private pool: sql.ConnectionPool;

  constructor(config: sql.config) {
    this.pool = new sql.ConnectionPool(config);
  }

  async initialize(): Promise<void> {
    await this.pool.connect();
    await this.createTableIfNotExists();
  }

  private async createTableIfNotExists(): Promise<void> {
    await this.pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MonitoredRequests' and xtype='U')
      CREATE TABLE MonitoredRequests (
        id NVARCHAR(255) PRIMARY KEY,
        method NVARCHAR(10),
        url NVARCHAR(MAX),
        statusCode INT,
        startTime BIGINT,
        endTime BIGINT,
        latency INT,
        serviceName NVARCHAR(255),
        requestHeaders NVARCHAR(MAX),
        responseHeaders NVARCHAR(MAX),
        requestBody NVARCHAR(MAX),
        responseBody NVARCHAR(MAX)
      )
    `);
  }

  async store(request: MonitoredRequest): Promise<void> {
    await this.pool.request()
      .input('id', sql.NVarChar, request.id)
      .input('method', sql.NVarChar, request.request.method)
      .input('url', sql.NVarChar, request.request.url)
      .input('statusCode', sql.Int, request.response.statusCode)
      .input('startTime', sql.BigInt, request.startTime)
      .input('endTime', sql.BigInt, request.endTime)
      .input('latency', sql.Int, request.latency)
      .input('serviceName', sql.NVarChar, request.serviceName)
      .input('requestHeaders', sql.NVarChar, JSON.stringify(request.request.headers))
      .input('responseHeaders', sql.NVarChar, JSON.stringify(request.response.headers))
      .input('requestBody', sql.NVarChar, JSON.stringify(request.request.body))
      .input('responseBody', sql.NVarChar, JSON.stringify(request.response.body))
      .query(`
        INSERT INTO MonitoredRequests (id, method, url, statusCode, startTime, endTime, latency, serviceName, requestHeaders, responseHeaders, requestBody, responseBody)
        VALUES (@id, @method, @url, @statusCode, @startTime, @endTime, @latency, @serviceName, @requestHeaders, @responseHeaders, @requestBody, @responseBody)
      `);
  }

  async getStats(startDate: Date, endDate: Date): Promise<RequestStats> {
    const result = await this.pool.request()
      .input('startDate', sql.BigInt, startDate.getTime())
      .input('endDate', sql.BigInt, endDate.getTime())
      .query(`
        SELECT 
          COUNT(*) as totalRequests,
          AVG(latency) as averageLatency,
          MAX(latency) as maxLatency,
          MIN(latency) as minLatency,
          url,
          statusCode
        FROM MonitoredRequests
        WHERE startTime >= @startDate AND endTime <= @endDate
        GROUP BY url, statusCode
      `);

    const stats: RequestStats = {
      totalRequests: 0,
      averageLatency: 0,
      maxLatency: 0,
      minLatency: Number.MAX_SAFE_INTEGER,
      requestsPerEndpoint: {},
      statusCodeDistribution: {}
    };

    result.recordset.forEach(row => {
      stats.totalRequests += row.totalRequests;
      stats.averageLatency += row.averageLatency * row.totalRequests;
      stats.maxLatency = Math.max(stats.maxLatency, row.maxLatency);
      stats.minLatency = Math.min(stats.minLatency, row.minLatency);
      stats.requestsPerEndpoint[row.url] = (stats.requestsPerEndpoint[row.url] || 0) + row.totalRequests;
      stats.statusCodeDistribution[row.statusCode] = (stats.statusCodeDistribution[row.statusCode] || 0) + row.totalRequests;
    });

    stats.averageLatency /= stats.totalRequests;

    return stats;
  }

  async getRequestById(id: string): Promise<MonitoredRequest | null> {
    const result = await this.pool.request()
      .input('id', sql.NVarChar, id)
      .query('SELECT * FROM MonitoredRequests WHERE id = @id');

    if (result.recordset.length === 0) {
      return null;
    }

    const row = result.recordset[0];
    return this.rowToMonitoredRequest(row);
  }

  async searchRequests(criteria: Partial<MonitoredRequest>, limit: number, offset: number): Promise<MonitoredRequest[]> {
    let query = 'SELECT * FROM MonitoredRequests WHERE 1=1';
    const request = this.pool.request();

    Object.entries(criteria).forEach(([key, value], index) => {
      query += ` AND ${key} = @p${index}`;
      request.input(`p${index}`, value);
    });

    query += ' ORDER BY startTime DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, limit);

    const result = await request.query(query);

    return result.recordset.map(this.rowToMonitoredRequest);
  }

  async deleteRequestsOlderThan(date: Date): Promise<number> {
    const result = await this.pool.request()
      .input('date', sql.BigInt, date.getTime())
      .query('DELETE FROM MonitoredRequests WHERE startTime < @date');

    return result.rowsAffected[0];
  }

  async close(): Promise<void> {
    await this.pool.close();
  }

  private rowToMonitoredRequest(row: any): MonitoredRequest {
    return {
      id: row.id,
      request: {
        method: row.method,
        url: row.url,
        headers: JSON.parse(row.requestHeaders),
        body: JSON.parse(row.requestBody)
      },
      response: {
        statusCode: row.statusCode,
        headers: JSON.parse(row.responseHeaders),
        body: JSON.parse(row.responseBody)
      },
      startTime: row.startTime,
      endTime: row.endTime,
      latency: row.latency,
      serviceName: row.serviceName
    };
  }
}