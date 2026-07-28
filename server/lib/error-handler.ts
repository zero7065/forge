import { Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, code?: string) {
    super(message, 400, code);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized', code?: string) {
    super(message, 401, code);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden', code?: string) {
    super(message, 403, code);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Not found', code?: string) {
    super(message, 404, code);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, code?: string) {
    super(message, 409, code);
    this.name = 'ConflictError';
  }
}

export function errorHandler(error: any, res: Response): void {
  if (error instanceof ApiError) {
    res.status(error.status).json({ error: error.message, code: error.code });
    return;
  }

  if (error instanceof JsonWebTokenError) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  if (error instanceof TokenExpiredError) {
    res.status(401).json({ error: 'Token expired' });
    return;
  }

  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
}

export function notFoundHandler(req: any, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}

export function validateRequest(body: any, schema: any): void {
  const { error } = schema.validate(body);
  if (error) {
    throw new ValidationError(error.details.map((d: any) => d.message).join(', '), 'VALIDATION_ERROR');
  }
}

export function requireAuthToken(req: any): string {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided', 'NO_TOKEN');
  }
  return authHeader.split(' ')[1];
}

export function checkPermission(user: any, requiredRole: string): boolean {
  if (!user) return false;
  if (user.role === 'owner') return true;
  if (requiredRole === 'admin' && user.role === 'admin') return true;
  if (requiredRole === 'viewer' && ['admin', 'viewer'].includes(user.role)) return true;
  return false;
}

export function fromError(error: any): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error.name === 'ValidationError' || error.name === 'ZodError') {
    return new ValidationError(error.message, 'VALIDATION_ERROR');
  }

  if (error.name === 'UnauthorizedError' || error.message.includes('Invalid credentials')) {
    return new UnauthorizedError(error.message, 'UNAUTHORIZED');
  }

  if (error.name === 'ForbiddenError') {
    return new ForbiddenError(error.message, 'FORBIDDEN');
  }

  if (error.name === 'NotFoundError') {
    return new NotFoundError(error.message, 'NOT_FOUND');
  }

  if (error.name === 'ConflictError') {
    return new ConflictError(error.message, 'CONFLICT');
  }

  return new ApiError(error.message || 'Internal server error', 500, 'INTERNAL_ERROR');
}