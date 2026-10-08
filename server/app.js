import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import adventureRouter from './routes/adventure.js';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '10kb' }));

  app.use('/api/adventure', adventureRouter);

  // Serve the built client when it exists (used by the Docker image and `npm start`).
  const clientDist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'client', 'dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
  }

  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Request body must be valid JSON.', code: 'INVALID_INPUT' });
    }
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error.', code: 'INTERNAL_ERROR' });
  });

  return app;
}