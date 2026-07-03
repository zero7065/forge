import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';

import { forgeRoutes } from './api/forge-routes.js';
import { portalRoutes } from './api/portal-routes.js';
import { primordexRoutes } from './api/primordex-routes.js';
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

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
app.use('/briefings', express.static(path.join(__dirname, '../../briefings')));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', version: '2.0.0', name: 'PRIMORDEX', timestamp: new Date().toISOString() });
});

app.use('/api', forgeRoutes);
app.use('/portal/api', portalRoutes);
app.use('/api/primordex', primordexRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/github/oauth', githubOAuthRouter);
app.use('/api/speech', speechRouter);
app.use('/api/collaboration', collaborationRouter);
app.use('/api/training', trainingRouter);

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 50 * 1024 * 1024 }
});

app.post('/api/upload', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as any[];
    const uploaded = files.map(f => ({
      originalName: f.originalname,
      filename: f.filename,
      path: f.path,
      size: f.size,
      mimetype: f.mimetype
    }));
    res.json({ files: uploaded });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

async function startServer() {
  try {
    getDatabase();
    console.log('Database initialized');

    await bootstrapOwner();
    console.log('Owner account bootstrapped');

    await initializeKnowledgeBase();
    console.log('Knowledge base seeded');

    await loadPersonalityModes();
    console.log('Personality modes loaded');

    await initScheduler();
    initConsolidation();
    console.log('Schedulers initialized');

    app.listen(PORT, () => {
      console.log(`PRIMORDEX V2 running on http://localhost:${PORT}`);
      console.log(`API: http://localhost:${PORT}/api`);
      console.log(`GitHub: http://localhost:${PORT}/api/github`);
      console.log(`Speech: http://localhost:${PORT}/api/speech`);
      console.log(`Collaboration: http://localhost:${PORT}/api/collaboration`);
      console.log(`Training: http://localhost:${PORT}/api/training`);
    });
  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
}

startServer();
