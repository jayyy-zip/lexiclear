import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  const plugins: any[] = [
    react(),
    tailwindcss(),
  ];

  if (command === 'serve') {
    plugins.push({
      name: 'lexiclear-api-middleware',
      async configureServer(server: any) {
        const express = (await import('express')).default;
        const { apiRouter } = await import('./server/api');
        const {
          requestIdMiddleware,
          securityHeadersMiddleware,
          structuredLoggingMiddleware,
        } = await import('./server/middleware/security');

        const app = express();
        app.use(express.json({ limit: '5mb' }));
        app.use(requestIdMiddleware);
        app.use(securityHeadersMiddleware);
        app.use(structuredLoggingMiddleware);
        app.use('/api', apiRouter);
        server.middlewares.use(app);
      },
    });
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
