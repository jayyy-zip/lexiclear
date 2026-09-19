import type { AnalysisResult, DocumentQAResponse, AnalyzeDocumentRequest, AskDocumentRequest } from './schemas';

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
  requestId: string;
}

export interface HealthResponse {
  status: 'ok';
  service: string;
  version: string;
}

export interface ReadyResponse {
  ready: true;
  service: string;
}

export type AnalyzeDocumentApiResponse = AnalysisResult & {
  requestId?: string;
  documentId?: string;
};

export type AskDocumentApiResponse = DocumentQAResponse & {
  requestId?: string;
  documentId?: string;
};

export type { AnalyzeDocumentRequest, AskDocumentRequest };
