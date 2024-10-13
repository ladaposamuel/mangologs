import { IncomingMessage, ServerResponse, Server, createServer } from 'http';

import { Monitor, RequestData, ResponseData } from '../core/monitor';

export class NodeAdapter {
  constructor(private monitor: Monitor) {}

  wrapServer(requestListener: (req: IncomingMessage, res: ServerResponse) => void): Server {
    return createServer((req: IncomingMessage, res: ServerResponse) => {
      const startTime = Date.now();

      // Capture the original methods
      const originalEnd = res.end.bind(res);
      const originalWrite = res.write.bind(res);

      let responseBody = '';

      // Override methods to capture response
      res.write = function (chunk) {
        responseBody += chunk.toString();
        return originalWrite.apply(this, arguments as any);
      };

      res.end = (chunk) => {
        if (chunk) {
          responseBody += chunk.toString();
        }
        const endTime = Date.now();

        const requestData: RequestData = {
          method: req.method || 'UNKNOWN',
          url: req.url || '/',
          headers: req.headers as Record<string, string>,
        };

        const responseData: ResponseData = {
          statusCode: res.statusCode,
          headers: res.getHeaders() as Record<string, string>,
          body: responseBody,
        };

        void this.monitor.logRequest(requestData, responseData, startTime, endTime);
        return originalEnd.apply(res, arguments as any);
      };

      requestListener(req, res);
    });
  }
}
