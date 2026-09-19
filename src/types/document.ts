export type {
  RiskSeverity,
  EvidenceStrength,
  SourceLocation,
  DocumentCoverage,
  DocumentMetadata,
  Clause,
  SilentRisk,
  DimensionScore,
  LegalHealthScore,
  ActionItem,
  TimelineEvent,
  ImportantClauseRef,
  LawyerPrepKit,
  AnalysisResult,
  DocumentQAResponse,
} from './schemas';

import type { EvidenceStrength, SourceLocation } from './schemas';

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
  sourceLocation?: SourceLocation;
}
