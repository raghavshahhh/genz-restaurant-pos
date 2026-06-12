/**
 * Standardized API Response Helpers
 * 
 * Provides consistent response formats across all API endpoints
 * for better client-side error handling and debugging
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

export enum ErrorCode {
  // Client errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  BAD_REQUEST = 'BAD_REQUEST',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

interface ErrorDetails {
  field?: string;
  issue?: string;
  [key: string]: any;
}

interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: ErrorDetails | any[];
    timestamp: string;
  };
}

interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Creates a standardized error response
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  details?: ErrorDetails | any[],
  statusCode: number = 500
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
        timestamp: new Date().toISOString(),
      },
    },
    { status: statusCode }
  );
}

/**
 * Creates a standardized success response
 */
export function successResponse<T>(
  data: T,
  statusCode: number = 200,
  meta?: SuccessResponse<T>['meta']
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status: statusCode }
  );
}

/**
 * Handles Zod validation errors and returns formatted response
 */
export function validationErrorResponse(error: z.ZodError): NextResponse<ErrorResponse> {
  const formattedErrors = error.issues.map((err: any) => ({
    field: err.path.join('.'),
    issue: err.message,
    code: err.code,
  }));

  return errorResponse(
    ErrorCode.VALIDATION_ERROR,
    'Validation failed',
    formattedErrors,
    400
  );
}

/**
 * Common error responses for frequently used scenarios
 */
export const CommonErrors = {
  notFound: (resource: string = 'Resource') =>
    errorResponse(
      ErrorCode.NOT_FOUND,
      `${resource} not found`,
      undefined,
      404
    ),

  unauthorized: (message: string = 'Unauthorized access') =>
    errorResponse(
      ErrorCode.UNAUTHORIZED,
      message,
      undefined,
      401
    ),

  forbidden: (message: string = 'Access forbidden') =>
    errorResponse(
      ErrorCode.FORBIDDEN,
      message,
      undefined,
      403
    ),

  conflict: (message: string, details?: ErrorDetails) =>
    errorResponse(
      ErrorCode.CONFLICT,
      message,
      details,
      409
    ),

  badRequest: (message: string, details?: ErrorDetails) =>
    errorResponse(
      ErrorCode.BAD_REQUEST,
      message,
      details,
      400
    ),

  internalError: (message: string = 'Internal server error') =>
    errorResponse(
      ErrorCode.INTERNAL_ERROR,
      message,
      undefined,
      500
    ),

  databaseError: (message: string = 'Database operation failed') =>
    errorResponse(
      ErrorCode.DATABASE_ERROR,
      message,
      undefined,
      500
    ),
};

/**
 * Type guards for checking response types
 */
export function isErrorResponse(response: any): response is ErrorResponse {
  return response && response.success === false && response.error !== undefined;
}

export function isSuccessResponse<T>(response: any): response is SuccessResponse<T> {
  return response && response.success === true && response.data !== undefined;
}
