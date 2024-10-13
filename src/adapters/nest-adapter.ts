import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Monitor, RequestData, ResponseData } from '../core/monitor';

@Injectable()
export class NestAdapter implements NestInterceptor {
  constructor(private monitor: Monitor) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();
    const startTime = Date.now();

    const requestData: RequestData = {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
    };

    return next.handle().pipe(
      tap((data) => {
        const endTime = Date.now();
        const responseData: ResponseData = {
          statusCode: response.statusCode,
          headers: response.getHeaders(),
          body: data,
        };

        this.monitor.logRequest(requestData, responseData, startTime, endTime);
      }),
    );
  }
}
