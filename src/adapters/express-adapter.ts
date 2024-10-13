import { Request, Response, NextFunction } from 'express';

import { Monitor, RequestData, ResponseData } from '../core/monitor';

export class ExpressAdapter {
  private monitor: Monitor;

  constructor(monitor: Monitor) {
    this.monitor = monitor;
  }

  middleware(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = Date.now();

      // Capture the original methods
      const originalJson = res.json.bind(res);
      const originalEnd = res.end.bind(res);
      const originalSend = res.send.bind(res);

      // Prepare request data
      const requestData: RequestData = {
        method: req.method,
        url: req.url,
        headers: req.headers as Record<string, string>,
        body: req.body,
      };

      // Helper function to log request
      const logRequest = async (body: unknown): Promise<void> => {
        const endTime = Date.now();
        const responseData: ResponseData = {
          statusCode: res.statusCode,
          headers: res.getHeaders() as Record<string, string>,
          body,
        };
        try {
          await this.monitor.logRequest(requestData, responseData, startTime, endTime);
        } catch (error) {
          console.error('Error logging request:', error);
        }
      };

      // Override methods to capture response
      res.json = function (body: unknown): Response {
        void logRequest(body);
        return originalJson(body);
      };

      res.end = function (chunk: unknown): Response {
        void logRequest(chunk);
        return originalEnd(chunk);
      };

      res.send = function (body: unknown): Response {
        void logRequest(body);
        return originalSend(body);
      };

      next();
    };
  }
}
