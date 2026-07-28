import { Response } from 'express';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';

interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
  value?: any;
}

interface ApiErrorResponse {
  error: string;
  message: string;
  details?: ValidationErrorDetail[];
  code?: string;
  status: number;
  timestamp: string;
  path?: string;
}

export class AppError extends Error {
  status: number;
  code: string;
  details?: ValidationErrorDetail[];

  constructor(message: string, status: number = 500, code: string = 'INTERNAL_ERROR', details?: ValidationErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: ValidationErrorDetail[]) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', code: string = 'AUTH_FAILED') {
    super(message, 401, code);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Authorization failed', code: string = 'FORBIDDEN') {
    super(message, 403, code);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    super(message, 404, code);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict occurred', code: string = 'CONFLICT') {
    super(message, 409, code);
    this.name = 'ConflictError';
  }
}

export function formatZodError(error: ZodError, path: string = ''): ValidationErrorDetail[] {
  return error.errors.map(err => ({
    field: path ? `${path}.${err.path.join('.')}` : err.path.join('.'),
    message: err.message,
    code: 'VALIDATION_ERROR',
    value: err.value
  }));
}

export function createErrorResponse(error: any, path: string = ''): ApiErrorResponse {
  const timestamp = new Date().toISOString();
  const status = error.status || 500;
  const code = error.code || 'INTERNAL_ERROR';
  const message = error.message || 'Internal server error';

  let details: ValidationErrorDetail[] | undefined;

  if (error instanceof ZodError) {
    details = formatZodError(error, path);
  } else if (error.details) {
    details = error.details;
  }

  return {
    error: 'error',
    message,
    ...(details && { details }),
    code,
    status,
    timestamp,
    ...(path && { path })
  };
}

export function errorHelper(err: any, res: Response, path: string = ''): Response {
  const errorResponse = createErrorResponse(err, path);

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'error',
      message: 'Invalid authentication token',
      code: 'INVALID_TOKEN',
      status: 401,
      timestamp: new Date().toISOString(),
      path
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'error',
      message: 'Authentication token expired',
      code: 'TOKEN_EXPIRED',
      status: 401,
      timestamp: new Date().toISOString(),
      path
    });
  }

  console.error('Error encountered:', {
    error: err.message,
    stack: err.stack,
    path,
    timestamp: new Date().toISOString(),
    code: errorResponse.code,
    status: errorResponse.status
  });

  return res.status(errorResponse.status).json(errorResponse);
}

export function successHelper<T>(data: T, res: Response, message?: string, status: number = 200): Response {
  const response = {
    error: 'success',
    message: message || 'Operation successful',
    data,
    status,
    timestamp: new Date().toISOString()
  };

  return res.status(status).json(response);
}

export function createdHelper<T>(data: T, res: Response, message?: string): Response {
  return successHelper(data, res, message || 'Resource created successfully', 201);
}

export function noContentHelper(res: Response): Response {
  return res.status(204).send();
}

export function handleApiError(err: any, path: string = ''): AppError {
  if (err instanceof AppError) {
    return err;
  }

  if (err.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid or expired authentication token', 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return new AuthenticationError('Authentication token expired', 'TOKEN_EXPIRED');
  }

  if (err.name === 'ValidationError' || err instanceof ZodError) {
    return new ValidationError(err.message || 'Validation error', err.details ? formatZodError(err, path) : undefined);
  }

  if (err.status >= 400 && err.status < 500) {
    return new AppError(err.message || 'Client error', err.status || 500, err.code || 'CLIENT_ERROR');
  }

  return new AppError(err.message || 'Internal server error', 500, 'INTERNAL_ERROR');
}