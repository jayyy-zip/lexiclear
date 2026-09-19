import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './server/api';
import {
  requestIdMiddleware,
  securityHeadersMiddleware,
  structuredLoggingMiddleware,
  requestTimeoutMiddleware,
  errorHandlerMiddleware,
} from './server/middleware/security';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const port = Number(process.env.PORT || 3000);

// Basic middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Security & observability middleware
app.use(requestIdMiddleware);
app.use(securityHeadersMiddleware);
app.use(structuredLoggingMiddleware);
app.use(requestTimeoutMiddleware(60000));

// API routes
app.use('/api', apiRouter);

// Serve production static assets from dist/
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// React SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Centralized error handler
app.use(errorHandlerMiddleware);

const isDirectRun = process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));

if (isDirectRun && process.env.NODE_ENV !== 'test') {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`[LexiClear] Server running on http://0.0.0.0:${port} [env=${process.env.NODE_ENV || 'production'}]`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n[LexiClear] Received ${signal}. Closing server gracefully...`);
    server.close(() => {
      console.log('[LexiClear] Server closed successfully.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
