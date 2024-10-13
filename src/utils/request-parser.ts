import { IncomingMessage } from 'http';

import { Request as ExpressRequest } from 'express';

import { RequestData } from '../core/monitor';

interface ParsedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: any;
}

export function parseRequest(req: IncomingMessage | ExpressRequest): ParsedRequest {
  const isExpressRequest = 'body' in req;

  const method = req.method || 'GET';
  const url = isExpressRequest ? req.originalUrl || req.url : req.url || '';
  const headers = req.headers as Record<string, string>;

  let query: Record<string, string> = {};
  let body: any = undefined;

  if (isExpressRequest) {
    const expressReq = req;
    query = expressReq.query as Record<string, string>;
    body = expressReq.body;
  } else {
    const urlParts = (req.url || '').split('?');
    if (urlParts.length > 1) {
      query = parseQueryString(urlParts[1]);
    }
    // For raw Node.js requests, body parsing would typically be handled separately
  }

  return { method, url, headers, query, body };
}

function parseQueryString(queryString: string): Record<string, string> {
  const query: Record<string, string> = {};
  const pairs = queryString.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    query[decodeURIComponent(key)] = decodeURIComponent(value || '');
  }
  return query;
}

export function convertToRequestData(parsedRequest: ParsedRequest): RequestData {
  return {
    method: parsedRequest.method,
    url: parsedRequest.url,
    headers: parsedRequest.headers,
    query: parsedRequest.query,
    body: parsedRequest.body,
  };
}

export function maskSensitiveData(data: any, sensitiveKeys: string[]): any {
  const maskedData: any = Array.isArray(data) ? [] : {};

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item, sensitiveKeys));
  }

  if (typeof data === 'object' && data !== null) {
    Object.keys(data).forEach((key) => {
      if (sensitiveKeys.includes(key)) {
        maskedData[key] = '******';
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        maskedData[key] = maskSensitiveData(data[key], sensitiveKeys);
      } else {
        maskedData[key] = data[key];
      }
    });
  } else {
    return data;
  }

  return maskedData;
}
