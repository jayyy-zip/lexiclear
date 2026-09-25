import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './api';
import {
  requestIdMiddleware,
  securityHeadersMiddleware,
  structuredLoggingMiddleware,
  requestTimeoutMiddleware,
  errorHandlerMiddleware,
} from './middleware/security';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Safe JSON body parser limit (5mb max; chunked requests stay <= 1.5MB)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Security & observability middleware
app.use(requestIdMiddleware);
app.use(securityHeadersMiddleware);
app.use(structuredLoggingMiddleware);
app.use(requestTimeoutMiddleware(60000));

// API routes mounted at /api and at root for serverless flexibility
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Serve production static assets from dist/ when running as local node server
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });
}

// Centralized error handler
app.use(errorHandlerMiddleware);

export default app;
