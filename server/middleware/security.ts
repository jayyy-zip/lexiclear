import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import type { ApiErrorResponse } from '../../src/types/api';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      startTime?: number;
    }
  }
}

/**
 * Attaches a unique request ID to each incoming request.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const reqId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.id = reqId;
  req.startTime = Date.now();
  res.setHeader('X-Request-ID', reqId);
  next();
}

/**
 * Injects hardened HTTP security headers.
 */
export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
}

/**
 * Structured privacy-conscious server logger.
 * STRICTLY NEVER logs raw document text, prompts, AI answers, or keys.
 */
export function structuredLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const contentLength = req.headers['content-length'] || '0';
    const logData = {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs,
      contentLengthBytes: contentLength,
      ip: req.ip || req.socket.remoteAddress,
    };

    // Compact single-line structured log
    console.log(
      `[LOG] ${logData.method} ${logData.path} status=${logData.status} duration=${logData.durationMs}ms reqId=${logData.requestId}`
    );
  });

  next();
}

/**
 * Lightweight in-memory IP rate limiter for API endpoints.
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export function createRateLimiter(options: { windowMs: number; maxRequests: number; endpointName: string }) {
  const ipMap = new Map<string, RateLimitRecord>();

  // Periodically sweep dead entries every 5 minutes
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [ip, rec] of ipMap.entries()) {
      if (now > rec.resetTime) {
        ipMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
  if (cleanup?.unref) cleanup.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const now = Date.now();
    const record = ipMap.get(ip);

    if (!record || now > record.resetTime) {
      ipMap.set(ip, { count: 1, resetTime: now + options.windowMs });
      next();
      return;
    }

    record.count++;
    if (record.count > options.maxRequests) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);

      const errPayload: ApiErrorResponse = {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests to ${options.endpointName}. Please wait ${retryAfterSec} seconds.`,
        },
        requestId: req.id || 'unknown',
      };
      res.status(429).json(errPayload);
      return;
    }

    next();
  };
}

/**
 * Request timeout middleware.
 */
export function requestTimeoutMiddleware(timeoutMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        const timeoutResponse: ApiErrorResponse = {
          error: {
            code: 'REQUEST_TIMEOUT',
            message: 'The analysis request exceeded the maximum allowed time of 60 seconds.',
          },
          requestId: req.id || 'unknown',
        };
        res.status(504).json(timeoutResponse);
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));
    next();
  };
}

/**
 * Standard centralized error response handler.
 */
export function errorHandlerMiddleware(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const reqId = req.id || 'unknown';
  const statusCode = typeof err.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;

  // Safe error classification
  let errorCode = err.code || (statusCode === 400 ? 'INVALID_REQUEST' : 'INTERNAL_SERVER_ERROR');
  let errorMessage = err.message || 'An unexpected error occurred while processing your request.';

  // Never expose raw stack traces or internal filesystem errors on 500s
  if (statusCode === 500) {
    errorMessage = 'An internal server error occurred while processing the request.';
  }

  const response: ApiErrorResponse = {
    error: {
      code: errorCode,
      message: errorMessage,
    },
    requestId: reqId,
  };

  res.status(statusCode).json(response);
}
