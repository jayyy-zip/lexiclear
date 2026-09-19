import type {
  AnalysisResult,
  DocumentQAResponse,
  AnalyzeDocumentRequest,
  AskDocumentRequest,
} from '../types/schemas';
import type { ApiErrorResponse, HealthResponse } from '../types/api';

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
      const message =
        errPayload?.error?.message ||
        (response.status === 429
          ? 'Rate limit exceeded. Please wait a moment before retrying.'
          : response.status >= 500
          ? 'Server encountered an issue analyzing the document. Please try again.'
          : `Request failed with status ${response.status}`);

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
      err?.message || 'Network error connecting to LexiClear service.',
      'NETWORK_ERROR'
    );
  } finally {
    clearTimeout(timer);
  }
}

export const apiClient = {
  /**
   * Health check
   */
  async checkHealth(): Promise<HealthResponse> {
    return requestWithTimeout<HealthResponse>('/api/health', {
      method: 'GET',
    }, 10000);
  },

  /**
   * Primary document analysis endpoint
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
      // Fallback to legacy endpoint if v1 route fails with 404
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
   * Grounded document Q&A endpoint
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
