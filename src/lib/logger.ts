/**
 * Comprehensive Error Logging System
 * 
 * Uses Winston for structured logging with:
 * - Request ID tracking
 * - User ID context
 * - Timestamp
 * - Stack traces
 * - Environment-aware formatting
 */

import winston from 'winston';
import { randomUUID } from 'crypto';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Format for development (colorized console output)
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Format for production (JSON for log aggregation tools)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports
const transports: winston.transport[] = [
  // Console transport (always enabled)
  new winston.transports.Console({
    format: isDevelopment ? devFormat : prodFormat,
  }),
];

// Add file transports in production
if (isProduction) {
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  levels,
  transports,
});

/**
 * Enhanced logging context interface
 */
interface LogContext {
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  [key: string]: any;
}

/**
 * Logger wrapper with context support
 */
export class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  private formatMessage(message: string, meta?: any): string {
    const contextStr = Object.keys(this.context).length > 0
      ? ` [${Object.entries(this.context)
          .map(([k, v]) => `${k}:${v}`)
          .join(' ')}]`
      : '';
    return `${message}${contextStr}${meta ? ` ${JSON.stringify(meta)}` : ''}`;
  }

  error(message: string, error?: Error | any, meta?: any) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack, ...meta }
      : { error, ...meta };

    logger.error(this.formatMessage(message, errorDetails));
  }

  warn(message: string, meta?: any) {
    logger.warn(this.formatMessage(message, meta));
  }

  info(message: string, meta?: any) {
    logger.info(this.formatMessage(message, meta));
  }

  http(message: string, meta?: any) {
    logger.http(this.formatMessage(message, meta));
  }

  debug(message: string, meta?: any) {
    logger.debug(this.formatMessage(message, meta));
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }
}

/**
 * Create a logger instance for API routes
 */
export function createApiLogger(request: Request): Logger {
  const requestId = randomUUID();
  const url = new URL(request.url);
  
  return new Logger({
    requestId,
    path: url.pathname,
    method: request.method,
  });
}

/**
 * Default logger instance
 */
export const defaultLogger = new Logger();

/**
 * Log API request
 */
export function logRequest(request: Request) {
  const url = new URL(request.url);
  defaultLogger.http(`${request.method} ${url.pathname}${url.search}`);
}

/**
 * Log API response
 */
export function logResponse(
  request: Request,
  statusCode: number,
  duration: number
) {
  const url = new URL(request.url);
  defaultLogger.http(
    `${request.method} ${url.pathname} ${statusCode} ${duration}ms`
  );
}

/**
 * Log database query errors
 */
export function logDatabaseError(
  operation: string,
  error: Error,
  context?: any
) {
  defaultLogger.error(
    `Database ${operation} failed`,
    error,
    context
  );
}

/**
 * Log validation errors
 */
export function logValidationError(
  path: string,
  errors: any[],
  context?: any
) {
  defaultLogger.warn(`Validation failed at ${path}`, {
    errors,
    ...context,
  });
}

/**
 * Log authentication failures
 */
export function logAuthFailure(
  reason: string,
  context?: any
) {
  defaultLogger.warn(`Authentication failed: ${reason}`, context);
}

export default defaultLogger;
