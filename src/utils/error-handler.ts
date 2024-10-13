import { Logger } from '../core/interfaces/logger.interface';

export class ApiMonitorError extends Error {
  constructor(
    public message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ApiMonitorError';
  }
}

export function handleError(logger: Logger, error: unknown, context: string): ApiMonitorError {
  let apiMonitorError: ApiMonitorError;

  if (error instanceof ApiMonitorError) {
    apiMonitorError = error;
  } else if (error instanceof Error) {
    apiMonitorError = new ApiMonitorError(error.message, 'UNKNOWN_ERROR', error);
  } else {
    apiMonitorError = new ApiMonitorError('An unknown error occurred', 'UNKNOWN_ERROR');
  }

  const logMessage = `[${context}] ${apiMonitorError.code}: ${apiMonitorError.message}`;
  logger.error(logMessage, { 
    errorCode: apiMonitorError.code,
    stack: apiMonitorError.stack
  });

  return apiMonitorError;
}

export function isApiMonitorError(error: unknown): error is ApiMonitorError {
  return error instanceof ApiMonitorError;
}