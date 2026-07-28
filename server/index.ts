import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

import { validateEnv } from './lib/env.js';
import { logger, createChildLogger } from './lib/logger.js';
import { securityMiddleware, globalRateLimit, authRateLimit, chatRateLimit, uploadRateLimit } from './lib/security.js';
import { validate, registerSchema, loginSchema, chatSchema } from './lib/validation.js';

import { forgeRoutes } from './api/forge-routes.js';
import { portalRoutes } from './api/portal-routes.js';
import { beyondRoutes } from './api/beyond-routes.js';
import { githubRoutes } from './api/github-routes.js';
import { githubOAuthRouter } from './github/oauth.js';
import { speechRouter } from './speech/whisper.js';
import { collaborationRouter } from './api/collaboration.js';
import { trainingRouter } from './ai/training-export.js';

import { getDatabase } from './lib/database.js';
import { initScheduler } from './scheduler/index.js';
import { initializeKnowledgeBase } from './ai/knowledge-base.js';
import { loadPersonalityModes } from './ai/personality-modes/index.js';
import { bootstrapOwner } from './auth/auth-service.js';
import { initConsolidation } from './scheduler/consolidation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = validateEnv();
const log = createChildLogger('server');

const app: Express = express();

// Security
securityMiddleware(app);
app.use(globalRateLimit);

// Body parsing (reduced from 50mb to 2mb)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// CORS
app.use(cors({
  origin: env.APP_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Static files (with cache control)
app.use('/uploads', express.static(path.join(__dirname, '../../uploads'), {
  maxAge: '1d',
  setHeaders: (res) => { res.setHeader('X-Content-Type-Options', 'nosniff'); }
}));
app.use('/briefings', express.static(path.join(__dirname, '../../briefings'), {
  maxAge: '1h',
}));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    log.info({ method: req.method, path: req.path, status: res.statusCode, duration: `${duration}ms` });
  });
  next();
});

// Health check (with dependency checks)
app.get('/api/health', async (req: Request, res: Response) => {
  const checks: Record<string, string> = {};
  try {
    const db = getDatabase();
    db.prepare('SELECT 1').get();
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }
  const healthy = Object.values(checks).every(v => v === 'ok');
res.status(healthy ? 200 : 503).json({
        status: healthy ? 'healthy' : 'degraded',
        version: '2.1.0',
        name: 'BEYOND',
        timestamp: new Date().toISOString(),
        checks,
      });
});

// API Routes with rate limiting
app.use('/api/auth', authRateLimit);
app.use('/api', forgeRoutes);
app.use('/portal/api', portalRoutes);
app.use('/api/beyond', beyondRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/github/oauth', githubOAuthRouter);
app.use('/api/speech', speechRouter);
app.use('/api/collaboration', collaborationRouter);
app.use('/api/training', trainingRouter);

// Secured file upload
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'text/markdown',
      'application/json', 'text/csv',
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`File type ${file.mimetype} not allowed`));
  }
});

app.post('/api/upload', uploadRateLimit, async (req: Request, res: Response) => {
  try {
    const files = req.files as any[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const uploaded = files.map(f => ({
      originalName: f.originalname,
      filename: f.filename,
      path: f.path,
      size: f.size,
      mimetype: f.mimetype
    }));
    res.json({ files: uploaded });
  } catch (error: any) {
    log.error({ err: error }, 'Upload failed');
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Serve frontend in production
if (env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// 404 handler
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  log.error({ err, method: req.method, path: req.path }, 'Unhandled error');
  res.status(err.status || 500).json({
    error: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// Startup
async function startServer() {
  try {
    getDatabase();
    log.info('Database initialized');

    await bootstrapOwner();
    log.info('Owner account bootstrapped');

    await initializeKnowledgeBase();
    log.info('Knowledge base seeded');

    await loadPersonalityModes();
    log.info('Personality modes loaded');

    await initScheduler();
    initConsolidation();
    log.info('Schedulers initialized');

    const server = app.listen(parseInt(env.PORT), () => {
      log.info(`BEYOND V2.1 running on http://localhost:${env.PORT}`);
      log.info(`Environment: ${env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      log.info(`${signal} received, shutting down gracefully...`);
      server.close(() => {
        log.info('HTTP server closed');
        try {
          const { closeDatabase } = require('./lib/database.js');
          closeDatabase();
          log.info('Database closed');
        } catch {}
        process.exit(0);
      });
      setTimeout(() => {
        log.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => {
      log.error({ reason }, 'Unhandled promise rejection');
    });
    process.on('uncaughtException', (err) => {
      log.fatal({ err }, 'Uncaught exception');
      process.exit(1);
    });

  } catch (error) {
    log.fatal({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

startServer();
