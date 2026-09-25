import { z } from 'zod';

export const RiskSeveritySchema = z.enum(['high', 'medium', 'low']);
export type RiskSeverity = z.infer<typeof RiskSeveritySchema>;

export const EvidenceStrengthSchema = z.enum([
  'Strong evidence',
  'Moderate evidence',
  'Limited evidence',
]);
export type EvidenceStrength = z.infer<typeof EvidenceStrengthSchema>;

export const SourceLocationSchema = z.object({
  quote: z.string(),
  startOffset: z.number().optional(),
  endOffset: z.number().optional(),
  sectionId: z.string().optional(),
  page: z.union([z.number(), z.string()]).optional(),
});
export type SourceLocation = z.infer<typeof SourceLocationSchema>;

export const DocumentCoverageSchema = z.object({
  sectionsAnalyzed: z.number(),
  sectionsTotal: z.number(),
  coverageComplete: z.boolean(),
});
export type DocumentCoverage = z.infer<typeof DocumentCoverageSchema>;

export const DocumentSectionRefSchema = z.object({
  id: z.string(),
  heading: z.string().optional(),
  page: z.union([z.number(), z.string()]).optional(),
  text: z.string(),
  startOffset: z.number(),
  endOffset: z.number(),
});
export type DocumentSectionRef = z.infer<typeof DocumentSectionRefSchema>;

export const DocumentMetadataSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  fileType: z.enum(['pdf', 'docx', 'txt']),
  uploadDate: z.string(),
  wordCount: z.number(),
  pageCount: z.union([z.number(), z.string()]).optional(),
  rawText: z.string().optional(),
  coverage: DocumentCoverageSchema.optional(),
  sections: z.array(DocumentSectionRefSchema).optional(),
});
export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;

export const ClauseSchema = z.object({
  id: z.string(),
  title: z.string(),
  text: z.string(),
  page: z.union([z.number(), z.string()]).optional(),
  sectionId: z.string().optional(),
  type: z.string().default('provision'),
  obligations: z.array(z.string()).default([]),
  rights: z.array(z.string()).default([]),
  dates: z.array(z.string()).default([]),
  financialExposure: z.string().default(''),
  riskIndicators: z.array(z.string()).default([]),
  plainEnglish: z.string().optional(),
  whyItMatters: z.string().optional(),
  startOffset: z.number().optional(),
  endOffset: z.number().optional(),
});
export type Clause = z.infer<typeof ClauseSchema>;

export const SilentRiskSchema = z.object({
  id: z.string(),
  clauseId: z.string(),
  severity: RiskSeveritySchema,
  title: z.string(),
  reason: z.string(),
  evidence: z.string(),
  evidenceStrength: EvidenceStrengthSchema,
  userImpact: z.string(),
  questionToConsider: z.string(),
  plainEnglishTranslation: z.string().optional(),
  clauseTitle: z.string().optional(),
  pageReference: z.string().optional(),
  sourceLocation: SourceLocationSchema.optional(),
});
export type SilentRisk = z.infer<typeof SilentRiskSchema>;

export const DimensionScoreSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100),
  weight: z.number(),
  status: z.enum(['Critical', 'Warning', 'Fair', 'Strong']),
  description: z.string(),
  keyFinding: z.string(),
});
export type DimensionScore = z.infer<typeof DimensionScoreSchema>;

export const LegalHealthScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  status: z.enum(['Critical Risk', 'Needs Attention', 'Moderate Health', 'Strong Terms']),
  shortExplanation: z.string(),
  dimensions: z.object({
    fairness: DimensionScoreSchema,
    clarity: DimensionScoreSchema,
    riskExposure: DimensionScoreSchema,
    obligationBalance: DimensionScoreSchema,
    terminationRights: DimensionScoreSchema,
    disputeResolution: DimensionScoreSchema,
  }),
  calculationMethodology: z.string(),
});
export type LegalHealthScore = z.infer<typeof LegalHealthScoreSchema>;

export const ActionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  reason: z.string(),
  clauseReference: z.string(),
  priority: RiskSeveritySchema,
  completed: z.boolean().default(false),
  category: z.enum(['negotiate', 'clarify', 'prepare', 'verify', 'deadline']).optional(),
});
export type ActionItem = z.infer<typeof ActionItemSchema>;

export const TimelineEventSchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  description: z.string(),
  clauseReference: z.string(),
  priority: RiskSeveritySchema,
  isoDate: z.string().optional(),
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const ImportantClauseRefSchema = z.object({
  title: z.string(),
  reference: z.string(),
  summary: z.string(),
  flagReason: z.string(),
});
export type ImportantClauseRef = z.infer<typeof ImportantClauseRefSchema>;

export const LawyerPrepKitSchema = z.object({
  documentSummary: z.string(),
  topConcerns: z.array(z.string()).default([]),
  importantFinancialExposure: z.array(z.string()).default([]),
  importantClauses: z.array(ImportantClauseRefSchema).default([]),
  questionsForLawyer: z.array(z.string()).default([]),
  supportingDocumentsToBring: z.array(z.string()).default([]),
  disclaimer: z.string().default('LexiClear provides informational document analysis, not legal advice.'),
});
export type LawyerPrepKit = z.infer<typeof LawyerPrepKitSchema>;

export const AnalysisResultSchema = z.object({
  metadata: DocumentMetadataSchema,
  documentType: z.string(),
  parties: z.array(z.string()).default([]),
  jurisdiction: z.string().default('Not specified'),
  summary: z.string(),
  importantDates: z.array(z.string()).default([]),
  financialTerms: z.array(z.string()).default([]),
  obligations: z.array(z.string()).default([]),
  terminationTerms: z.array(z.string()).default([]),
  disputeResolution: z.string().default('Governing law and dispute forum as specified in agreement.'),
  clauses: z.array(ClauseSchema).default([]),
  risks: z.array(SilentRiskSchema).default([]),
  healthScore: LegalHealthScoreSchema,
  actionChecklist: z.array(ActionItemSchema).default([]),
  timeline: z.array(TimelineEventSchema).default([]),
  lawyerPrepKit: LawyerPrepKitSchema,
  coverage: DocumentCoverageSchema.optional(),
  sections: z.array(DocumentSectionRefSchema).optional(),
});
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export const DocumentQAResponseSchema = z.object({
  answer: z.string(),
  clauseReference: z.string().optional(),
  pageReference: z.string().optional(),
  evidenceSnippet: z.string().optional(),
  evidenceStrength: EvidenceStrengthSchema.default('Moderate evidence'),
  isNotFound: z.boolean().default(false),
  sourceLocation: SourceLocationSchema.optional(),
});
export type DocumentQAResponse = z.infer<typeof DocumentQAResponseSchema>;

/**
 * Raw AI Extraction Output Schemas (before local normalization)
 */
export const AiDimensionItemSchema = z.object({
  score: z.number().min(0).max(100),
  keyFinding: z.string(),
});

export const AiAnalysisPayloadSchema = z.object({
  documentType: z.string().optional(),
  parties: z.array(z.string()).optional(),
  jurisdiction: z.string().optional(),
  summary: z.string().optional(),
  importantDates: z.array(z.string()).optional(),
  financialTerms: z.array(z.string()).optional(),
  obligations: z.array(z.string()).optional(),
  terminationTerms: z.array(z.string()).optional(),
  disputeResolution: z.string().optional(),
  healthDimensions: z.object({
    fairness: AiDimensionItemSchema.optional(),
    clarity: AiDimensionItemSchema.optional(),
    riskExposure: AiDimensionItemSchema.optional(),
    obligationBalance: AiDimensionItemSchema.optional(),
    terminationRights: AiDimensionItemSchema.optional(),
    disputeResolution: AiDimensionItemSchema.optional(),
  }).optional(),
  clauses: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    text: z.string(),
    page: z.union([z.number(), z.string()]).optional(),
    type: z.string().optional(),
    obligations: z.array(z.string()).optional(),
    rights: z.array(z.string()).optional(),
    dates: z.array(z.string()).optional(),
    financialExposure: z.string().optional(),
    riskIndicators: z.array(z.string()).optional(),
    plainEnglish: z.string().optional(),
    whyItMatters: z.string().optional(),
  })).optional(),
  risks: z.array(z.object({
    id: z.string().optional(),
    clauseId: z.string().optional(),
    severity: z.string().optional(),
    title: z.string(),
    reason: z.string(),
    evidence: z.string(),
    evidenceStrength: z.string().optional(),
    userImpact: z.string(),
    questionToConsider: z.string(),
    plainEnglishTranslation: z.string().optional(),
    clauseTitle: z.string().optional(),
    pageReference: z.string().optional(),
  })).optional(),
  actionChecklist: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    reason: z.string(),
    clauseReference: z.string(),
    priority: z.string().optional(),
    category: z.string().optional(),
  })).optional(),
  timeline: z.array(z.object({
    id: z.string().optional(),
    date: z.string(),
    title: z.string(),
    description: z.string(),
    clauseReference: z.string(),
    priority: z.string().optional(),
    isoDate: z.string().optional(),
  })).optional(),
  lawyerPrepKit: z.object({
    documentSummary: z.string().optional(),
    topConcerns: z.array(z.string()).optional(),
    importantFinancialExposure: z.array(z.string()).optional(),
    importantClauses: z.array(ImportantClauseRefSchema).optional(),
    questionsForLawyer: z.array(z.string()).optional(),
    supportingDocumentsToBring: z.array(z.string()).optional(),
  }).optional(),
});
export type AiAnalysisPayload = z.infer<typeof AiAnalysisPayloadSchema>;

export const AiQAPayloadSchema = z.object({
  answer: z.string(),
  clauseReference: z.string().nullable().optional(),
  pageReference: z.string().nullable().optional(),
  evidenceSnippet: z.string().nullable().optional(),
  evidenceStrength: z.string().nullable().optional(),
  isNotFound: z.boolean().optional(),
});
export type AiQAPayload = z.infer<typeof AiQAPayloadSchema>;

/**
 * API Request Schemas
 */
export const AnalyzeDocumentRequestSchema = z.object({
  rawText: z.string().min(20, 'Document text must be at least 20 characters'),
  fileName: z.string().default('Uploaded_Document'),
  fileType: z.enum(['pdf', 'docx', 'txt']).default('txt'),
  wordCount: z.number().positive().optional(),
  pageCount: z.union([z.number(), z.string()]).optional(),
  fileSize: z.number().optional(),
});
export type AnalyzeDocumentRequest = z.infer<typeof AnalyzeDocumentRequestSchema>;

export const AskDocumentRequestSchema = z.object({
  documentId: z.string().optional(),
  question: z.string().min(1, 'Question must not be empty').max(1000, 'Question too long'),
  relevantSections: z.array(DocumentSectionRefSchema).optional(),
  // Optional rawText / clauses fallback for direct / legacy callers
  rawText: z.string().optional(),
  documentType: z.string().optional(),
  clauses: z.array(z.any()).optional(),
});
export type AskDocumentRequest = z.infer<typeof AskDocumentRequestSchema>;

export const AnalyzeChunkRequestSchema = z.object({
  documentId: z.string(),
  chunkIndex: z.number(),
  totalChunks: z.number(),
  fileName: z.string().default('Document_Chunk'),
  fileType: z.enum(['pdf', 'docx', 'txt']).default('txt'),
  sections: z.array(DocumentSectionRefSchema),
  chunkText: z.string().max(1_500_000, 'Chunk exceeds 1.5MB request limit'),
});
export type AnalyzeChunkRequest = z.infer<typeof AnalyzeChunkRequestSchema>;

export const AnalyzeChunkResponseSchema = z.object({
  chunkIndex: z.number(),
  totalChunks: z.number(),
  clauses: z.array(ClauseSchema),
  risks: z.array(SilentRiskSchema),
  healthDimensions: z.record(z.object({ score: z.number(), keyFinding: z.string() })).optional(),
  summary: z.string().optional(),
  parties: z.array(z.string()).optional(),
  importantDates: z.array(z.string()).optional(),
  financialTerms: z.array(z.string()).optional(),
  obligations: z.array(z.string()).optional(),
  terminationTerms: z.array(z.string()).optional(),
  disputeResolution: z.string().optional(),
  documentType: z.string().optional(),
});
export type AnalyzeChunkResponse = z.infer<typeof AnalyzeChunkResponseSchema>;

export const FinalizeAnalysisRequestSchema = z.object({
  documentId: z.string(),
  fileName: z.string().default('Uploaded_Document'),
  fileType: z.enum(['pdf', 'docx', 'txt']).default('txt'),
  fileSize: z.number().optional(),
  wordCount: z.number().optional(),
  pageCount: z.union([z.number(), z.string()]).optional(),
  sectionsTotal: z.number(),
  sectionsAnalyzed: z.number(),
  chunkSummaries: z.array(z.string()).default([]),
  clauses: z.array(ClauseSchema).default([]),
  risks: z.array(SilentRiskSchema).default([]),
  healthDimensions: z.record(z.object({ score: z.number(), keyFinding: z.string() })).optional(),
  documentType: z.string().optional(),
  parties: z.array(z.string()).optional(),
  jurisdiction: z.string().optional(),
  importantDates: z.array(z.string()).optional(),
  financialTerms: z.array(z.string()).optional(),
  obligations: z.array(z.string()).optional(),
  terminationTerms: z.array(z.string()).optional(),
  disputeResolution: z.string().optional(),
});
export type FinalizeAnalysisRequest = z.infer<typeof FinalizeAnalysisRequestSchema>;

