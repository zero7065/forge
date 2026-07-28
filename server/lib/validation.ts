import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(1, 'Password is required').max(128),
});

export const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(10000, 'Message too long (max 10,000 characters)'),
  chamber: z.string().max(50).optional().default('forge'),
  personalityMode: z.string().max(50).optional().default('alchemist'),
  context: z.object({}).passthrough().optional(),
  files: z.array(z.object({}).passthrough()).max(10).optional(),
});

export const inviteSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  role: z.enum(['admin', 'viewer']).optional().default('viewer'),
});

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  description: z.string().max(2000).optional(),
  repoUrl: z.string().url().optional().or(z.literal('')),
});

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    req.body = result.data;
    next();
  };
}
