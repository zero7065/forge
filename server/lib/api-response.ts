import { Response } from 'express';

interface ApiError {
  error: string;
  details?: string[];
  code?: string;
}

interface ApiResponse<T> {
  ok: true;
  data?: T;
  message?: string;
}

export function sendError(res: Response, status: number, message: string, details?: string[], code?: string): void {
  const body: ApiError = { error: message };
  if (details && details.length > 0) body.details = details;
  if (code) body.code = code;
  res.status(status).json(body);
}

export function sendSuccess<T>(res: Response, data: T, message?: string): void {
  res.json({ ok: true, data, ...(message && { message }) });
}

export function sendCreated<T>(res: Response, data: T, message?: string): void {
  res.status(201).json({ ok: true, data, ...(message && { message }) });
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}
