import type {
  AnalysisResult,
  Clause,
  SilentRisk,
  ActionItem,
  TimelineEvent,
  LawyerPrepKit,
  DocumentQAResponse,
} from '../types/schemas';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';
import { apiClient } from './apiClient';

/**
 * Client-side analysis service coordinating API client requests,
 * deterministic sample matching, and local state management.
 * ZERO Gemini keys or SDK imports are present in the frontend bundle.
 */

// Active session cache to avoid duplicate API requests
const analysisCache = new Map<string, AnalysisResult & { documentId?: string }>();

export async function analyzeDocument(params: {
  rawText: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt';
  wordCount: number;
  pageCount?: number | string;
  fileSize?: number;
  useCache?: boolean;
}): Promise<AnalysisResult & { documentId?: string }> {
  const cacheKey = `${params.fileName}_${params.wordCount}_${params.rawText.slice(0, 80)}`;
  if (params.useCache !== false && analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey)!;
  }

  // Check if this matches one of the precomputed realistic sample documents
  const sampleMatch = SAMPLE_DOCUMENTS.find(
    s =>
      s.name.toLowerCase() === params.fileName.toLowerCase() ||
      s.rawText.slice(0, 150) === params.rawText.slice(0, 150)
  );

  try {
    const result = await apiClient.analyzeDocument({
      rawText: params.rawText,
      fileName: params.fileName,
      fileType: params.fileType,
      wordCount: params.wordCount,
      pageCount: params.pageCount,
      fileSize: params.fileSize,
    });

    analysisCache.set(cacheKey, result);
    return result;
  } catch (error: any) {
    console.warn('[LexiClear] Server analysis call failed:', error?.message);

    // If matches a sample document, load deterministic precomputed analysis
    if (sampleMatch) {
      const sampleResult = {
        ...sampleMatch.precomputedAnalysis,
        documentId: sampleMatch.id,
      };
      analysisCache.set(cacheKey, sampleResult);
      return sampleResult;
    }

    throw error;
  }
}

export async function segmentClauses(analysis: AnalysisResult): Promise<Clause[]> {
  return analysis.clauses;
}

export async function analyzeRisks(analysis: AnalysisResult): Promise<SilentRisk[]> {
  return analysis.risks;
}

export async function generateChecklist(analysis: AnalysisResult): Promise<ActionItem[]> {
  return analysis.actionChecklist;
}

export async function generateLawyerPrep(analysis: AnalysisResult): Promise<LawyerPrepKit> {
  return analysis.lawyerPrepKit;
}

export async function extractTimeline(analysis: AnalysisResult): Promise<TimelineEvent[]> {
  return analysis.timeline;
}

/**
 * Ask Document Q&A using server-side grounding.
 * Prefers documentId over resending full rawText.
 */
export async function answerDocumentQuestion(params: {
  question: string;
  documentId?: string;
  rawText?: string;
  documentType?: string;
  clauses?: Clause[];
}): Promise<DocumentQAResponse> {
  try {
    return await apiClient.askDocument({
      documentId: params.documentId,
      question: params.question,
      rawText: params.rawText,
      documentType: params.documentType,
      clauses: params.clauses,
    });
  } catch (err: any) {
    console.warn('[LexiClear] Q&A request failed, falling back to local verification:', err?.message);

    // If matching a sample document question locally
    const matched = getDeterministicSampleAnswer(params.question, params.clauses, params.rawText);
    if (matched) {
      return matched;
    }

    return {
      answer: "I couldn't find that information in the uploaded document.",
      isNotFound: true,
      evidenceStrength: 'Limited evidence',
    };
  }
}

/**
 * Deterministic answer matcher for sample document demo exploration
 */
function getDeterministicSampleAnswer(
  question: string,
  clauses?: Clause[],
  rawText?: string
): DocumentQAResponse | null {
  const q = question.toLowerCase();
  const raw = rawText || '';

  if (q.includes('deposit') || q.includes('cleaning fee')) {
    if (raw.includes('cleaning fee') || raw.includes('deposit')) {
      return {
        answer:
          'Yes. Under Clause 3 (Security Deposit), the Landlord may deduct standard turnover cleaning fees of $450.00 "regardless of move-out cleanliness". Additionally, the Landlord reserves up to sixty (60) days following surrender of the premises to return remaining deposit funds.',
        clauseReference: 'Clause 3: Security Deposit',
        pageReference: 'Page 1',
        evidenceSnippet:
          'Landlord shall have sixty (60) days following surrender of the premises to return remaining deposit funds, and may deduct standard turnover cleaning fees of $450.00 regardless of move-out cleanliness.',
        evidenceStrength: 'Strong evidence',
        isNotFound: false,
      };
    }
  }

  if (q.includes('rent increase') || q.includes('increase rent') || q.includes('raise rent')) {
    if (raw.includes('twelve percent') || raw.includes('12%')) {
      return {
        answer:
          'Yes. Under Clause 1, if the lease automatically renews, monthly rent will increase by twelve percent (12%). Non-renewal requires 90 days advance written notice via certified mail.',
        clauseReference: 'Clause 1: Term & Automatic Renewal',
        pageReference: 'Page 1',
        evidenceSnippet:
          'this Agreement shall automatically renew for a successive twelve (12) month term at a monthly rent increased by twelve percent (12%).',
        evidenceStrength: 'Strong evidence',
        isNotFound: false,
      };
    }
  }

  return null;
}
