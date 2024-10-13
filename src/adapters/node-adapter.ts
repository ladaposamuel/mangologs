import { IncomingMessage, ServerResponse, Server, createServer } from 'http';
import { Monitor, RequestData, ResponseData } from '../core/monitor';

export class NodeAdapter {
  private monitor: Monitor;

  constructor(monitor: Monitor) {
    this.monitor = monitor;
  }

  wrapServer(requestListener: (req: IncomingMessage, res: ServerResponse) => void): Server {
    return createServer((req: IncomingMessage, res: ServerResponse) => {
      const startTime = Date.now();

      // Capture the original methods
      const originalEnd = res.end;
      const originalWrite = res.write;

      let responseBody = '';

      // Override methods to capture response
      res.write = function(chunk) {
        responseBody += chunk.toString();
        return originalWrite.apply(this, arguments);
      };

      res.end = function(chunk) {
        if (chunk) {
          responseBody += chunk.toString();
        }
        const endTime = Date.now();

        const requestData: RequestData = {
          method: req.method || 'UNKNOWN',
          url: req.url || '/',
          headers: req.headers as Record<string, string>
        };

        const responseData: ResponseData = {
          statusCode: res.statusCode,
          headers: res.getHeaders() as Record<string, string>,
          body: responseBody
        };

        this.monitor.logRequest(requestData, responseData, startTime, endTime);
        return originalEnd.apply(this, arguments);
      };

      requestListener(req, res);
    });
  }
}