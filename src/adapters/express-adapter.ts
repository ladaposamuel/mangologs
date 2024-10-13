import { Request, Response, NextFunction } from 'express';
import { Monitor, RequestData, ResponseData } from '../core/monitor';

export class ExpressAdapter {
  private monitor: Monitor;

  constructor(monitor: Monitor) {
    this.monitor = monitor;
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();

      // Capture the original methods
      const originalJson = res.json;
      const originalEnd = res.end;
      const originalSend = res.send;

      // Prepare request data
      const requestData: RequestData = {
        method: req.method,
        url: req.url,
        headers: req.headers as Record<string, string>,
        body: req.body
      };

      // Override methods to capture response
      res.json = function(body) {
        const endTime = Date.now();
        const responseData: ResponseData = {
          statusCode: res.statusCode,
          headers: res.getHeaders() as Record<string, string>,
          body: body
        };
        this.monitor.logRequest(requestData, responseData, startTime, endTime);
        return originalJson.apply(this, arguments);
      };

      res.end = function(chunk) {
        const endTime = Date.now();
        const responseData: ResponseData = {
          statusCode: res.statusCode,
          headers: res.getHeaders() as Record<string, string>,
          body: chunk
        };
        this.monitor.logRequest(requestData, responseData, startTime, endTime);
        return originalEnd.apply(this, arguments);
      };

      res.send = function(body) {
        const endTime = Date.now();
        const responseData: ResponseData = {
          statusCode: res.statusCode,
          headers: res.getHeaders() as Record<string, string>,
          body: body
        };
        this.monitor.logRequest(requestData, responseData, startTime, endTime);
        return originalSend.apply(this, arguments);
      };

      next();
    };
  }
}