import { Router, type Request, type Response, type NextFunction } from 'express';
import { analyzeDocumentServer, answerDocumentQuestionServer } from './geminiService';
import { AnalyzeDocumentRequestSchema, AskDocumentRequestSchema } from '../src/types/schemas';
import type { ApiErrorResponse, HealthResponse, ReadyResponse } from '../src/types/api';
import { createRateLimiter } from './middleware/security';

export const apiRouter = Router();

// Configurable Rate Limiters
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
const maxAnalyze = Number(process.env.RATE_LIMIT_MAX_ANALYZE || 20);
const maxQa = Number(process.env.RATE_LIMIT_MAX_QA || 60);

const analyzeLimiter = createRateLimiter({
  windowMs,
  maxRequests: maxAnalyze,
  endpointName: 'analyze-document',
});

const qaLimiter = createRateLimiter({
  windowMs,
  maxRequests: maxQa,
  endpointName: 'ask-document',
});

/**
 * Service health check.
 * Strictly does NOT expose secret status or keys.
 */
apiRouter.get('/health', (_req: Request, res: Response): void => {
  const response: HealthResponse = {
    status: 'ok',
    service: 'lexiclear-api',
    version: '1.0.0',
  };
  res.json(response);
});

/**
 * Service readiness probe.
 */
apiRouter.get('/ready', (_req: Request, res: Response): void => {
  const response: ReadyResponse = {
    ready: true,
    service: 'lexiclear-api',
  };
  res.json(response);
});

/**
 * Analyze Document handler (v1 and legacy alias)
 */
async function handleAnalyzeDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parseResult = AnalyzeDocumentRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || 'Invalid document analysis request payload.';
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'INVALID_DOCUMENT',
          message: issue,
        },
        requestId: req.id || 'unknown',
      };
      res.status(400).json(errResponse);
      return;
    }

    const { rawText, fileName, fileType, wordCount, pageCount, fileSize } = parseResult.data;

    // DoS / Payload size sanity guard
    if (rawText.length > 10_000_000) {
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'DOCUMENT_TOO_LARGE',
          message: 'Document text exceeds the maximum character threshold of 10,000,000 characters.',
        },
        requestId: req.id || 'unknown',
      };
      res.status(413).json(errResponse);
      return;
    }

    const result = await analyzeDocumentServer({
      rawText,
      fileName,
      fileType,
      wordCount,
      pageCount,
      fileSize,
    });

    res.json(result);
  } catch (err: any) {
    console.error('API analyze error [reqId=%s]:', req.id, err?.message);
    const errResponse: ApiErrorResponse = {
      error: {
        code: 'ANALYSIS_FAILED',
        message: 'The uploaded document could not be analyzed safely. Please try again.',
      },
      requestId: req.id || 'unknown',
    };
    res.status(500).json(errResponse);
  }
}

/**
 * Ask Document handler (v1 and legacy alias)
 */
async function handleAskDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parseResult = AskDocumentRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || 'Invalid Q&A request payload.';
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'INVALID_QUESTION',
          message: issue,
        },
        requestId: req.id || 'unknown',
      };
      res.status(400).json(errResponse);
      return;
    }

    const { documentId, question, rawText, documentType, clauses } = parseResult.data;

    // Guard: Must provide either a valid documentId or rawText
    if (!documentId && (!rawText || !rawText.trim())) {
      const errResponse: ApiErrorResponse = {
        error: {
          code: 'MISSING_DOCUMENT_CONTEXT',
          message: 'Either a valid documentId or document context is required to answer questions.',
        },
        requestId: req.id || 'unknown',
      };
      res.status(400).json(errResponse);
      return;
    }

    const result = await answerDocumentQuestionServer({
      documentId,
      question,
      rawText,
      documentType,
      clauses,
    });

    res.json(result);
  } catch (err: any) {
    console.error('API ask error [reqId=%s]:', req.id, err?.message);
    const errResponse: ApiErrorResponse = {
      error: {
        code: 'QA_PROCESSING_FAILED',
        message: 'Failed to process question grounded in document context.',
      },
      requestId: req.id || 'unknown',
    };
    res.status(500).json(errResponse);
  }
}

// Primary v1 routes
apiRouter.post('/v1/analyze-document', analyzeLimiter, handleAnalyzeDocument);
apiRouter.post('/v1/ask-document', qaLimiter, handleAskDocument);

// Backward-compatible legacy aliases
apiRouter.post('/analyze-document', analyzeLimiter, handleAnalyzeDocument);
apiRouter.post('/ask-document', qaLimiter, handleAskDocument);
