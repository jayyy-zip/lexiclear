import type {
  AnalysisResult,
  DocumentQAResponse,
  AnalyzeDocumentRequest,
  AskDocumentRequest,
  AnalyzeChunkRequest,
  AnalyzeChunkResponse,
  FinalizeAnalysisRequest,
} from '../types/schemas';
import type { ApiErrorResponse, HealthResponse, ReadyResponse } from '../types/api';

const DEFAULT_TIMEOUT_MS = 60000;

function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '';
  }
  return 'http://localhost:' + (process.env.PORT || 3000);
}

export class ApiError extends Error {
  public code: string;
  public requestId?: string;

  constructor(message: string, code: string = 'API_ERROR', requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.requestId = requestId;
  }
}

function mapUserFacingError(status: number, code?: string, rawMessage?: string): string {
  if (code === 'MISSING_GEMINI_KEY') {
    return 'AI analysis is temporarily unavailable. Please try again later.';
  }
  if (status === 413 || code === 'DOCUMENT_TOO_LARGE') {
    return 'This document is too large to process in one analysis request. LexiClear will process it in smaller sections.';
  }
  if (status === 429 || code === 'RATE_LIMIT_EXCEEDED') {
    return 'Rate limit exceeded. Please wait a moment before trying again.';
  }
  if (status === 504 || code === 'REQUEST_TIMEOUT') {
    return 'The request timed out. The document may be complex or the service busy. Please try again.';
  }
  if (status >= 500) {
    return "LexiClear's analysis service is temporarily unavailable. Please try again.";
  }
  if (rawMessage && !rawMessage.includes('Internal') && !rawMessage.includes('exception') && !rawMessage.includes('stack')) {
    return rawMessage;
  }
  return 'An error occurred while processing your request. Please try again.';
}

async function requestWithTimeout<T>(
  endpoint: string,
  options: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${getBaseUrl()}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const requestId = response.headers.get('x-request-id') || undefined;

    if (!response.ok) {
      let errPayload: ApiErrorResponse | null = null;
      try {
        errPayload = await response.json();
      } catch {
        // Non-JSON response
      }

      const code = errPayload?.error?.code || `HTTP_${response.status}`;
      const message = mapUserFacingError(
        response.status,
        code,
        errPayload?.error?.message
      );

      throw new ApiError(message, code, requestId || errPayload?.requestId);
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new ApiError(
        'The request timed out after 60 seconds. The document may be complex or the service busy.',
        'REQUEST_TIMEOUT'
      );
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      "LexiClear's analysis service is temporarily unavailable. Please check your connection and try again.",
      'NETWORK_ERROR'
    );
  } finally {
    clearTimeout(timer);
  }
}

export const apiClient = {
  /**
   * Health check endpoint
   */
  async checkHealth(): Promise<HealthResponse> {
    return requestWithTimeout<HealthResponse>('/api/health', {
      method: 'GET',
    }, 10000);
  },

  /**
   * Readiness check endpoint
   */
  async checkReady(): Promise<ReadyResponse> {
    return requestWithTimeout<ReadyResponse>('/api/ready', {
      method: 'GET',
    }, 10000);
  },

  /**
   * Direct document analysis endpoint (for small-to-medium documents)
   */
  async analyzeDocument(params: AnalyzeDocumentRequest): Promise<AnalysisResult & { documentId: string }> {
    try {
      return await requestWithTimeout<AnalysisResult & { documentId: string }>(
        '/api/v1/analyze-document',
        {
          method: 'POST',
          body: JSON.stringify(params),
        }
      );
    } catch (err: any) {
      // Fallback to legacy endpoint if v1 route returns 404
      if (err.code === 'HTTP_404') {
        return await requestWithTimeout<AnalysisResult & { documentId: string }>(
          '/api/analyze-document',
          {
            method: 'POST',
            body: JSON.stringify(params),
          }
        );
      }
      throw err;
    }
  },

  /**
   * Chunk analysis endpoint (for large documents chunked client-side)
   */
  async analyzeChunk(params: AnalyzeChunkRequest): Promise<AnalyzeChunkResponse> {
    return await requestWithTimeout<AnalyzeChunkResponse>(
      '/api/v1/analyze-chunk',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
  },

  /**
   * Finalize document analysis endpoint (merges multi-chunk findings)
   */
  async finalizeAnalysis(params: FinalizeAnalysisRequest): Promise<AnalysisResult & { documentId: string }> {
    return await requestWithTimeout<AnalysisResult & { documentId: string }>(
      '/api/v1/finalize-analysis',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
  },

  /**
   * Grounded document Q&A endpoint
   * Fully supports stateless section-based context
   */
  async askDocument(params: AskDocumentRequest): Promise<DocumentQAResponse & { documentId?: string }> {
    try {
      return await requestWithTimeout<DocumentQAResponse & { documentId?: string }>(
        '/api/v1/ask-document',
        {
          method: 'POST',
          body: JSON.stringify(params),
        }
      );
    } catch (err: any) {
      if (err.code === 'HTTP_404') {
        return await requestWithTimeout<DocumentQAResponse & { documentId?: string }>(
          '/api/ask-document',
          {
            method: 'POST',
            body: JSON.stringify(params),
          }
        );
      }
      throw err;
    }
  },
};
