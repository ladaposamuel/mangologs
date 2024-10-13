export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
  }
  
  export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    context?: string;
    metadata?: Record<string, any>;
  }
  
  export interface Logger {
    debug(message: string, context?: string, metadata?: Record<string, any>): void;
    info(message: string, context?: string, metadata?: Record<string, any>): void;
    warn(message: string, context?: string, metadata?: Record<string, any>): void;
    error(message: string, context?: string, metadata?: Record<string, any>): void;
    log(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>): void;
    setLogLevel(level: LogLevel): void;
    getLogLevel(): LogLevel;
  }
  
  export interface LoggerProvider {
    getLogger(context?: string): Logger;
  }