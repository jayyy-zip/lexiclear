import { GoogleGenAI } from '@google/genai';
import {
  AiAnalysisPayloadSchema,
  AiQAPayloadSchema,
  type AnalysisResult,
  type DocumentQAResponse,
  type SilentRisk,
  type Clause,
  type AnalyzeChunkResponse,
  type FinalizeAnalysisRequest,
  type DocumentSectionRef,
  type DocumentCoverage,
} from '../src/types/schemas';
import { buildAnalysisPrompt } from './prompts/analysisPrompt';
import { buildQAPrompt } from './prompts/qaPrompt';
import { prepareDocumentForAnalysis } from './documentChunker';
import { verifyEvidenceSnippet, verifyRisksGrounding, verifyClauseReference, verifyPageReference } from './groundingVerifier';
import { computeDeterministicHealthScore, deduplicateRisks, normalizeEvidenceStrength, normalizeSeverity } from '../src/services/riskEngine';
import { documentStore } from './documentStore';

let aiClient: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined in process.env. Server AI calls will fail or require mock.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
    });
  }
  return aiClient;
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-3.8-flash';
}

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Server-side document analysis pipeline.
 */
export async function analyzeDocumentServer(params: {
  rawText: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt';
  wordCount?: number;
  pageCount?: number | string;
  fileSize?: number;
}): Promise<AnalysisResult & { documentId: string }> {
  const documentId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const wordCount = params.wordCount || params.rawText.split(/\s+/).filter(Boolean).length;
  const fileSize = params.fileSize || Buffer.byteLength(params.rawText, 'utf8');

  // 1. Intelligent chunking & section segmentation
  const chunkResult = prepareDocumentForAnalysis(params.rawText, params.pageCount);
  const { sections, coverage, primaryContent } = chunkResult;

  // 2. Build delimited system prompt
  const prompt = buildAnalysisPrompt(primaryContent, {
    fileName: params.fileName,
    fileType: params.fileType,
  });

  // 3. Invoke Gemini
  const ai = getAiClient();
  const modelName = getGeminiModel();

  let parsedJson: any = {};
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const rawTextResponse = response.text || '{}';
    const cleaned = cleanJsonString(rawTextResponse);
    parsedJson = JSON.parse(cleaned);
  } catch (err: any) {
    console.error('Gemini API call or JSON parse error:', err?.message || err);
    throw new Error('AI analysis service was unable to process the document content safely.');
  }

  // 4. Validate with Zod
  const validationResult = AiAnalysisPayloadSchema.safeParse(parsedJson);
  const validatedPayload = validationResult.success ? validationResult.data : parsedJson;

  // 5. Transform clauses
  const clauses: Clause[] = (validatedPayload.clauses || []).map((c: any, idx: number) => ({
    id: c.id || `c-${idx + 1}`,
    title: c.title || `Clause ${idx + 1}`,
    text: c.text || '',
    page: c.page || undefined,
    type: c.type || 'provision',
    obligations: Array.isArray(c.obligations) ? c.obligations : [],
    rights: Array.isArray(c.rights) ? c.rights : [],
    dates: Array.isArray(c.dates) ? c.dates : [],
    financialExposure: c.financialExposure || 'Standard',
    riskIndicators: Array.isArray(c.riskIndicators) ? c.riskIndicators : [],
    plainEnglish: c.plainEnglish,
    whyItMatters: c.whyItMatters,
  }));

  // 6. Transform and verify risks grounding
  const rawRisks: SilentRisk[] = (validatedPayload.risks || []).map((r: any, idx: number) => ({
    id: r.id || `risk-${idx + 1}`,
    clauseId: r.clauseId || (clauses[0]?.id || 'c-1'),
    severity: normalizeSeverity(r.severity),
    title: r.title || `Risk ${idx + 1}`,
    reason: r.reason || '',
    evidence: r.evidence || '',
    evidenceStrength: normalizeEvidenceStrength(r.evidenceStrength),
    userImpact: r.userImpact || '',
    questionToConsider: r.questionToConsider || '',
    plainEnglishTranslation: r.plainEnglishTranslation,
    clauseTitle: r.clauseTitle,
    pageReference: r.pageReference,
  }));

  // Deduplicate and verify strict grounding against source sections
  const deduplicated = deduplicateRisks(rawRisks);
  const groundedRisks = verifyRisksGrounding(params.rawText, deduplicated, sections);

  // 7. Calculate deterministic legal health score locally
  const healthScore = computeDeterministicHealthScore(
    validatedPayload.healthDimensions,
    groundedRisks,
    validatedPayload.summary
  );

  // 8. Build complete result
  const analysisResult: AnalysisResult & { documentId: string } = {
    documentId,
    metadata: {
      id: documentId,
      fileName: params.fileName,
      fileSize,
      fileType: params.fileType,
      uploadDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      wordCount,
      pageCount: params.pageCount,
      coverage,
    },
    documentType: validatedPayload.documentType || 'Legal Document',
    parties: validatedPayload.parties || ['Parties as designated in agreement'],
    jurisdiction: validatedPayload.jurisdiction || 'Jurisdiction not specified',
    summary: validatedPayload.summary || 'Summary generated by LexiClear co-pilot.',
    importantDates: validatedPayload.importantDates || [],
    financialTerms: validatedPayload.financialTerms || [],
    obligations: validatedPayload.obligations || [],
    terminationTerms: validatedPayload.terminationTerms || [],
    disputeResolution: validatedPayload.disputeResolution || 'Governing law as specified in agreement.',
    clauses,
    risks: groundedRisks,
    healthScore,
    actionChecklist: (validatedPayload.actionChecklist || []).map((a: any, idx: number) => ({
      id: a.id || `act-${idx + 1}`,
      title: a.title || 'Review clause with counsel',
      reason: a.reason || '',
      clauseReference: a.clauseReference || 'Key Terms',
      priority: normalizeSeverity(a.priority),
      completed: false,
      category: a.category || 'negotiate',
    })),
    timeline: (validatedPayload.timeline || []).map((t: any, idx: number) => ({
      id: t.id || `time-${idx + 1}`,
      date: t.date || 'Specified Date',
      title: t.title || 'Event',
      description: t.description || '',
      clauseReference: t.clauseReference || 'Agreement',
      priority: normalizeSeverity(t.priority),
      isoDate: t.isoDate,
    })),
    lawyerPrepKit: {
      documentSummary: validatedPayload.lawyerPrepKit?.documentSummary || validatedPayload.summary || '',
      topConcerns: validatedPayload.lawyerPrepKit?.topConcerns || groundedRisks.map(r => r.title),
      importantFinancialExposure: validatedPayload.lawyerPrepKit?.importantFinancialExposure || validatedPayload.financialTerms || [],
      importantClauses: validatedPayload.lawyerPrepKit?.importantClauses || clauses.slice(0, 3).map(c => ({
        title: c.title,
        reference: c.page ? `Page ${c.page}` : c.title,
        summary: c.plainEnglish || c.title,
        flagReason: 'Core operating section',
      })),
      questionsForLawyer: validatedPayload.lawyerPrepKit?.questionsForLawyer || [
        'Are any of the highlighted risk provisions subject to local statutory caps or protections?',
        'What specific amendments should we propose for mutual reciprocity?',
      ],
      supportingDocumentsToBring: validatedPayload.lawyerPrepKit?.supportingDocumentsToBring || [
        'Original executed or draft contract',
        'Relevant email communications and fee schedules',
      ],
      disclaimer: 'LexiClear provides informational document analysis, not legal advice.',
    },
    coverage,
  };

  // 9. Store in ephemeral in-memory document store for fast documentId Q&A
  documentStore.set(documentId, {
    documentId,
    fileName: params.fileName,
    fileType: params.fileType,
    rawText: params.rawText,
    sections,
    clauses,
    risks: groundedRisks,
    analysis: analysisResult,
  });

  return analysisResult;
}

/**
 * Server-side chunk analysis pipeline for large documents.
 * Kept well under Vercel payload limits (target <= 1.5MB request).
 */
export async function analyzeChunkServer(params: {
  documentId: string;
  chunkIndex: number;
  totalChunks: number;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt';
  sections: DocumentSectionRef[];
  chunkText: string;
}): Promise<AnalyzeChunkResponse> {
  const prompt = buildAnalysisPrompt(params.chunkText, {
    fileName: `${params.fileName} (Part ${params.chunkIndex + 1} of ${params.totalChunks})`,
    fileType: params.fileType,
  });

  const ai = getAiClient();
  const modelName = getGeminiModel();

  let parsedJson: any = {};
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const rawTextResponse = response.text || '{}';
    parsedJson = JSON.parse(cleanJsonString(rawTextResponse));
  } catch (err: any) {
    console.error(`Gemini chunk ${params.chunkIndex} error:`, err?.message || err);
    throw new Error('AI analysis service was unable to process this document section safely.');
  }

  const validationResult = AiAnalysisPayloadSchema.safeParse(parsedJson);
  const validatedPayload = validationResult.success ? validationResult.data : parsedJson;

  const clauses: Clause[] = (validatedPayload.clauses || []).map((c: any, idx: number) => ({
    id: c.id || `c-p${params.chunkIndex + 1}-${idx + 1}`,
    title: c.title || `Clause ${idx + 1}`,
    text: c.text || '',
    page: c.page || undefined,
    type: c.type || 'provision',
    obligations: Array.isArray(c.obligations) ? c.obligations : [],
    rights: Array.isArray(c.rights) ? c.rights : [],
    dates: Array.isArray(c.dates) ? c.dates : [],
    financialExposure: c.financialExposure || 'Standard',
    riskIndicators: Array.isArray(c.riskIndicators) ? c.riskIndicators : [],
    plainEnglish: c.plainEnglish,
    whyItMatters: c.whyItMatters,
  }));

  const rawRisks: SilentRisk[] = (validatedPayload.risks || []).map((r: any, idx: number) => ({
    id: r.id || `risk-p${params.chunkIndex + 1}-${idx + 1}`,
    clauseId: r.clauseId || (clauses[0]?.id || `c-p${params.chunkIndex + 1}-1`),
    severity: normalizeSeverity(r.severity),
    title: r.title || `Risk ${idx + 1}`,
    reason: r.reason || '',
    evidence: r.evidence || '',
    evidenceStrength: normalizeEvidenceStrength(r.evidenceStrength),
    userImpact: r.userImpact || '',
    questionToConsider: r.questionToConsider || '',
    plainEnglishTranslation: r.plainEnglishTranslation,
    clauseTitle: r.clauseTitle,
    pageReference: r.pageReference,
  }));

  const groundedRisks = verifyRisksGrounding(params.chunkText, deduplicateRisks(rawRisks), params.sections);

  return {
    chunkIndex: params.chunkIndex,
    totalChunks: params.totalChunks,
    clauses,
    risks: groundedRisks,
    healthDimensions: validatedPayload.healthDimensions,
    summary: validatedPayload.summary,
    parties: validatedPayload.parties,
    importantDates: validatedPayload.importantDates,
    financialTerms: validatedPayload.financialTerms,
    obligations: validatedPayload.obligations,
    terminationTerms: validatedPayload.terminationTerms,
    disputeResolution: validatedPayload.disputeResolution,
    documentType: validatedPayload.documentType,
  };
}

/**
 * Server-side analysis finalization.
 * Merges multi-chunk findings, runs deterministic risk engine scoring, and assembles outputs.
 */
export async function finalizeAnalysisServer(params: FinalizeAnalysisRequest): Promise<AnalysisResult & { documentId: string }> {
  const documentId = params.documentId || `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const wordCount = params.wordCount || 0;
  const fileSize = params.fileSize || 0;

  // Deduplicate clauses by title or text
  const seenClauseTitles = new Set<string>();
  const deduplicatedClauses: Clause[] = [];
  for (const c of params.clauses) {
    const key = (c.title || c.text.slice(0, 50)).toLowerCase().trim();
    if (!seenClauseTitles.has(key)) {
      seenClauseTitles.add(key);
      deduplicatedClauses.push(c);
    }
  }

  // Deduplicate risks
  const deduplicatedRisks = deduplicateRisks(params.risks);

  // Compute deterministic health score
  const combinedSummary = params.chunkSummaries.filter(Boolean).join(' ') || 'Comprehensive document analysis.';
  const healthScore = computeDeterministicHealthScore(
    params.healthDimensions,
    deduplicatedRisks,
    combinedSummary
  );

  const coverage: DocumentCoverage = {
    sectionsAnalyzed: params.sectionsAnalyzed,
    sectionsTotal: params.sectionsTotal,
    coverageComplete: params.sectionsAnalyzed >= params.sectionsTotal,
  };

  const analysisResult: AnalysisResult & { documentId: string } = {
    documentId,
    metadata: {
      id: documentId,
      fileName: params.fileName,
      fileSize,
      fileType: params.fileType,
      uploadDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      wordCount,
      pageCount: params.pageCount,
      coverage,
    },
    documentType: params.documentType || 'Legal Document',
    parties: params.parties || ['Parties as designated in agreement'],
    jurisdiction: params.jurisdiction || 'Jurisdiction not specified',
    summary: combinedSummary,
    importantDates: params.importantDates || [],
    financialTerms: params.financialTerms || [],
    obligations: params.obligations || [],
    terminationTerms: params.terminationTerms || [],
    disputeResolution: params.disputeResolution || 'Governing law as specified in agreement.',
    clauses: deduplicatedClauses,
    risks: deduplicatedRisks,
    healthScore,
    actionChecklist: deduplicatedRisks.map((r, idx) => ({
      id: `act-${idx + 1}`,
      title: `Review: ${r.title}`,
      reason: r.reason || 'Identified potential risk requiring review.',
      clauseReference: r.clauseTitle || 'Agreement Terms',
      priority: r.severity,
      completed: false,
      category: 'negotiate' as const,
    })),
    timeline: (params.importantDates || []).map((d, idx) => ({
      id: `time-${idx + 1}`,
      date: d,
      title: `Key Date / Milestone ${idx + 1}`,
      description: d,
      clauseReference: 'Agreement Schedule',
      priority: 'medium' as const,
    })),
    lawyerPrepKit: {
      documentSummary: combinedSummary,
      topConcerns: deduplicatedRisks.slice(0, 5).map(r => r.title),
      importantFinancialExposure: params.financialTerms || [],
      importantClauses: deduplicatedClauses.slice(0, 3).map(c => ({
        title: c.title,
        reference: c.page ? `Page ${c.page}` : c.title,
        summary: c.plainEnglish || c.title,
        flagReason: 'Core operating section',
      })),
      questionsForLawyer: [
        'Are any of the highlighted risk provisions subject to local statutory caps or protections?',
        'What specific amendments should we propose for mutual reciprocity?',
      ],
      supportingDocumentsToBring: [
        'Original executed or draft contract',
        'Relevant email communications and fee schedules',
      ],
      disclaimer: 'LexiClear provides informational document analysis, not legal advice.',
    },
    coverage,
  };

  // Best-effort cache in documentStore
  documentStore.set(documentId, {
    documentId,
    fileName: params.fileName,
    fileType: params.fileType,
    rawText: '',
    sections: [],
    clauses: deduplicatedClauses,
    risks: deduplicatedRisks,
    analysis: analysisResult,
  });

  return analysisResult;
}

/**
 * Server-side grounded Q&A.
 * Stateless fallback: works whether documentId is cached on this server instance or not.
 */
export async function answerDocumentQuestionServer(params: {
  documentId?: string;
  question: string;
  relevantSections?: DocumentSectionRef[];
  rawText?: string;
  documentType?: string;
  clauses?: any[];
}): Promise<DocumentQAResponse & { documentId?: string }> {
  let docText = '';
  let sections: any[] | undefined = undefined;

  // 1. If relevantSections supplied, build context directly from them (stateless fallback)
  if (params.relevantSections && params.relevantSections.length > 0) {
    docText = params.relevantSections
      .map(s => (s.heading ? `[${s.heading}]\n` : '') + s.text)
      .join('\n\n');
    sections = params.relevantSections;
  }

  // 2. Check server documentStore cache (best-effort optimization)
  if (params.documentId) {
    const stored = documentStore.get(params.documentId);
    if (stored) {
      if (!docText) {
        docText = stored.rawText;
        sections = stored.sections;
      } else if (!sections || sections.length === 0) {
        sections = stored.sections;
      }
    }
  }

  // 3. Fallback to rawText if provided
  if (!docText && params.rawText) {
    docText = params.rawText;
  }

  // 4. Absence guard: if no text context found
  if (!docText || !docText.trim()) {
    return {
      documentId: params.documentId,
      answer: "I couldn't find that information in the uploaded document.",
      isNotFound: true,
      evidenceStrength: 'Limited evidence',
    };
  }

  // 5. If running in environment without GEMINI_API_KEY (e.g. automated test suites, offline demo), provide deterministic extraction
  if (!process.env.GEMINI_API_KEY) {
    const queryLower = params.question.toLowerCase();
    const sentences = docText.split(/(?<=[.!?\n])\s+/).filter(s => s.trim().length > 10);
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);
    const matchedSentence = sentences.find(s => {
      const sLower = s.toLowerCase();
      return queryWords.some(w => sLower.includes(w));
    });

    if (matchedSentence) {
      const verifiedLoc = verifyEvidenceSnippet(docText, matchedSentence.trim(), sections);
      return {
        documentId: params.documentId,
        answer: matchedSentence.trim(),
        clauseReference: sections?.[0]?.heading,
        pageReference: verifiedLoc?.page ? `Page ${verifiedLoc.page}` : undefined,
        evidenceSnippet: verifiedLoc?.quote || matchedSentence.trim(),
        evidenceStrength: 'Strong evidence',
        isNotFound: false,
        sourceLocation: verifiedLoc || undefined,
      };
    }

    return {
      documentId: params.documentId,
      answer: "I couldn't find that information in the uploaded document.",
      isNotFound: true,
      evidenceStrength: 'Limited evidence',
    };
  }

  const prompt = buildQAPrompt(docText.slice(0, 45000), params.question, params.documentType);
  const ai = getAiClient();
  const modelName = getGeminiModel();

  let parsedJson: any = {};
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const rawResponse = response.text || '{}';
    parsedJson = JSON.parse(cleanJsonString(rawResponse));
  } catch (err: any) {
    console.error('Gemini Q&A call error:', err?.message || err);
    throw new Error('AI assistant was unable to process your question.');
  }

  const validationResult = AiQAPayloadSchema.safeParse(parsedJson);
  const validated = validationResult.success ? validationResult.data : parsedJson;

  const rawAnswer = (validated.answer || '').trim();
  const answerLower = rawAnswer.toLowerCase();

  // Strict check: if answer indicates absence of information
  const isAbsent =
    Boolean(validated.isNotFound) ||
    answerLower.includes("couldn't find") ||
    answerLower.includes('could not find') ||
    answerLower.includes('not mentioned') ||
    answerLower.includes('not found') ||
    answerLower.includes('does not mention') ||
    answerLower.includes('does not contain') ||
    answerLower.includes('no information') ||
    answerLower.includes('no mention');

  if (isAbsent) {
    return {
      answer: "I couldn't find that information in the uploaded document.",
      clauseReference: undefined,
      pageReference: undefined,
      evidenceSnippet: undefined,
      evidenceStrength: 'Limited evidence',
      isNotFound: true,
    };
  }

  // Strict evidence verification with source coordinates
  let verifiedLocation = verifyEvidenceSnippet(docText, validated.evidenceSnippet, sections);

  // Reject fabricated clause references that don't match document clauses or sections
  const isClauseValid = verifyClauseReference(validated.clauseReference, params.clauses, sections);
  const groundedClause = isClauseValid ? String(validated.clauseReference) : undefined;

  // Derive page reference strictly from verified location or document sections
  let groundedPage: string | undefined = undefined;
  if (verifiedLocation?.page) {
    groundedPage = `Page ${verifiedLocation.page}`;
  } else if (verifiedLocation && validated.pageReference && verifyPageReference(validated.pageReference, sections)) {
    groundedPage = String(validated.pageReference);
  }

  return {
    documentId: params.documentId,
    answer: rawAnswer,
    clauseReference: groundedClause,
    pageReference: groundedPage,
    evidenceSnippet: verifiedLocation?.quote,
    evidenceStrength: verifiedLocation ? normalizeEvidenceStrength(validated.evidenceStrength) : 'Limited evidence',
    isNotFound: false,
    sourceLocation: verifiedLocation || undefined,
  };
}
