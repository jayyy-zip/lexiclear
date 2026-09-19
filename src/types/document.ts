export type RiskSeverity = 'high' | 'medium' | 'low';
export type EvidenceStrength = 'Strong evidence' | 'Moderate evidence' | 'Limited evidence';

export interface DocumentMetadata {
  id: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: 'pdf' | 'docx' | 'txt';
  uploadDate: string;
  wordCount: number;
  pageCount?: number;
  rawText: string;
}

export interface Clause {
  id: string;
  title: string;
  text: string;
  page?: number;
  type: string;
  obligations: string[];
  rights: string[];
  dates: string[];
  financialExposure: string;
  riskIndicators: string[];
  plainEnglish?: string;
  whyItMatters?: string;
}

export interface SilentRisk {
  id: string;
  clauseId: string;
  severity: RiskSeverity;
  title: string;
  reason: string;
  evidence: string;
  evidenceStrength: EvidenceStrength;
  userImpact: string;
  questionToConsider: string;
  plainEnglishTranslation?: string;
  clauseTitle?: string;
  pageReference?: string;
}

export interface DimensionScore {
  name: string;
  score: number; // 0-100
  weight: number; // percentage
  status: 'Critical' | 'Warning' | 'Fair' | 'Strong';
  description: string;
  keyFinding: string;
}

export interface LegalHealthScore {
  overallScore: number; // 0-100
  status: 'Critical Risk' | 'Needs Attention' | 'Moderate Health' | 'Strong Terms';
  shortExplanation: string;
  dimensions: {
    fairness: DimensionScore;
    clarity: DimensionScore;
    riskExposure: DimensionScore;
    obligationBalance: DimensionScore;
    terminationRights: DimensionScore;
    disputeResolution: DimensionScore;
  };
  calculationMethodology: string;
}

export interface ActionItem {
  id: string;
  title: string;
  reason: string;
  clauseReference: string;
  priority: RiskSeverity;
  completed: boolean;
  category?: 'negotiate' | 'clarify' | 'prepare' | 'verify' | 'deadline';
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  clauseReference: string;
  priority: RiskSeverity;
  isoDate?: string;
}

export interface ImportantClauseRef {
  title: string;
  reference: string;
  summary: string;
  flagReason: string;
}

export interface LawyerPrepKit {
  documentSummary: string;
  topConcerns: string[];
  importantFinancialExposure: string[];
  importantClauses: ImportantClauseRef[];
  questionsForLawyer: string[];
  supportingDocumentsToBring: string[];
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citation?: string;
  clauseReference?: string;
  pageReference?: string;
  evidenceSnippet?: string;
  evidenceStrength?: EvidenceStrength;
  isNotFound?: boolean;
}

export interface AnalysisResult {
  metadata: DocumentMetadata;
  documentType: string;
  parties: string[];
  jurisdiction: string;
  summary: string;
  importantDates: string[];
  financialTerms: string[];
  obligations: string[];
  terminationTerms: string[];
  disputeResolution: string;
  clauses: Clause[];
  risks: SilentRisk[];
  healthScore: LegalHealthScore;
  actionChecklist: ActionItem[];
  timeline: TimelineEvent[];
  lawyerPrepKit: LawyerPrepKit;
}
