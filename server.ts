import dotenv from 'dotenv';
import { app } from './server/app';

dotenv.config();

const port = Number(process.env.PORT || 3000);
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

export { app };
export default app;
