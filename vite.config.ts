import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import express from 'express';
import { apiRouter } from './server/api';
import {
  requestIdMiddleware,
  securityHeadersMiddleware,
  structuredLoggingMiddleware,
} from './server/middleware/security';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'lexiclear-api-middleware',
        configureServer(server) {
          const app = express();
          app.use(express.json({ limit: '15mb' }));
          app.use(requestIdMiddleware);
          app.use(securityHeadersMiddleware);
          app.use(structuredLoggingMiddleware);
          app.use('/api', apiRouter);
          server.middlewares.use(app);
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
