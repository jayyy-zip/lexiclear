import { app } from '../server/app';

/**
 * Vercel Serverless Function configuration
 */
export const config = {
  maxDuration: 60,
};

export default app;
