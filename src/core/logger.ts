import { LoggerProvider,Logger, LogLevel, LogEntry } from './interfaces/logger.interface';

export { LogLevel, LogEntry };

export class DefaultLogger implements Logger {
  private logLevel: LogLevel;
  private context?: string;

  constructor(context?: string, logLevel: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.logLevel = logLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return Object.values(LogLevel).indexOf(level) >= Object.values(LogLevel).indexOf(this.logLevel);
  }

  private createLogEntry(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      context: context || this.context,
      metadata
    };
  }

  private logMessage(entry: LogEntry): void {
    console.log(JSON.stringify(entry));
  }

  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.logMessage(this.createLogEntry(LogLevel.DEBUG, message, context, metadata));
    }
  }

  info(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.logMessage(this.createLogEntry(LogLevel.INFO, message, context, metadata));
    }
  }

  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.logMessage(this.createLogEntry(LogLevel.WARN, message, context, metadata));
    }
  }

  error(message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.logMessage(this.createLogEntry(LogLevel.ERROR, message, context, metadata));
    }
  }

  log(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(level)) {
      this.logMessage(this.createLogEntry(level, message, context, metadata));
    }
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  getLogLevel(): LogLevel {
    return this.logLevel;
  }
}

export class DefaultLoggerProvider implements LoggerProvider {
  getLogger(context?: string): Logger {
    return new DefaultLogger(context);
  }
}