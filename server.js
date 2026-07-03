import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

const LOG_FILE = path.join(process.cwd(), 'server.log');
function log(msg) {
  const entry = `[${new Date().toISOString()}] ${msg}\n`;
  console.log(msg);
  fs.appendFileSync(LOG_FILE, entry);
}

log('Starting JS server...');

const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('JS Server is running, but frontend is not built.');
  });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

server.listen(PORT, '0.0.0.0', () => {
  log(`JS Server running at http://localhost:${PORT}`);
});
