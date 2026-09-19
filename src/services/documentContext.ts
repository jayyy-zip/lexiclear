import { useState, useEffect } from 'react';
import {
  AnalysisResult,
  ActionItem,
  ChatMessage,
  Clause,
  DocumentMetadata,
  LawyerPrepKit,
  LegalHealthScore,
  SilentRisk,
  TimelineEvent
} from '../types/document';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';

export interface DocumentStoreState {
  currentDocument: AnalysisResult | null;
  selectedClause: Clause | null;
  selectedRisk: SilentRisk | null;
  chatHistory: ChatMessage[];
  isAnalyzing: boolean;
  processingStage: string;
  processingPercent: number;
  error: string | null;
}

// Initial state starts with null or can load default sample
let state: DocumentStoreState = {
  currentDocument: null,
  selectedClause: null,
  selectedRisk: null,
  chatHistory: [],
  isAnalyzing: false,
  processingStage: 'Ready',
  processingPercent: 0,
  error: null,
};

type Listener = (state: DocumentStoreState) => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(listener => listener({ ...state }));
}

export const documentContextStore = {
  getState(): DocumentStoreState {
    return { ...state };
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener({ ...state });
    return () => {
      listeners.delete(listener);
    };
  },

  setCurrentDocument(doc: AnalysisResult | null) {
    state.currentDocument = doc;
    state.error = null;
    state.isAnalyzing = false;
    // Pre-populate chat with welcome question suggestions
    if (doc) {
      state.chatHistory = [
        {
          id: 'welcome-msg',
          sender: 'ai',
          text: `I've analyzed "${doc.metadata.fileName}" (${doc.documentType}). I identified ${doc.risks.length} silent risks and computed an overall Legal Health Score of ${doc.healthScore.overallScore}/100. Feel free to ask me anything about obligations, deadlines, or specific clauses!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citation: `${doc.documentType} Analysis`,
          evidenceStrength: 'Strong evidence',
        },
      ];
    } else {
      state.chatHistory = [];
    }
    notify();
  },

  setProcessing(isAnalyzing: boolean, stage: string, percent: number) {
    state.isAnalyzing = isAnalyzing;
    state.processingStage = stage;
    state.processingPercent = percent;
    if (isAnalyzing) {
      state.error = null;
    }
    notify();
  },

  setError(error: string | null) {
    state.error = error;
    state.isAnalyzing = false;
    notify();
  },

  selectClause(clause: Clause | null) {
    state.selectedClause = clause;
    notify();
  },

  selectRisk(risk: SilentRisk | null) {
    state.selectedRisk = risk;
    if (risk && state.currentDocument) {
      const clause = state.currentDocument.clauses.find(c => c.id === risk.clauseId);
      if (clause) {
        state.selectedClause = clause;
      }
    }
    notify();
  },

  toggleActionItem(actionId: string) {
    if (!state.currentDocument) return;
    const updated = state.currentDocument.actionChecklist.map(item =>
      item.id === actionId ? { ...item, completed: !item.completed } : item
    );
    state.currentDocument = {
      ...state.currentDocument,
      actionChecklist: updated,
    };
    notify();
  },

  addChatMessage(message: ChatMessage) {
    state.chatHistory = [...state.chatHistory, message];
    notify();
  },

  loadSample(sampleId: string) {
    const sample = SAMPLE_DOCUMENTS.find(s => s.id === sampleId) || SAMPLE_DOCUMENTS[0];
    this.setCurrentDocument(sample.precomputedAnalysis);
  },

  reset() {
    state = {
      currentDocument: null,
      selectedClause: null,
      selectedRisk: null,
      chatHistory: [],
      isAnalyzing: false,
      processingStage: 'Ready',
      processingPercent: 0,
      error: null,
    };
    notify();
  },
};

/**
 * React hook to consume the centralized document context reactively
 */
export function useDocumentContext() {
  const [storeState, setStoreState] = useState<DocumentStoreState>(documentContextStore.getState());

  useEffect(() => {
    return documentContextStore.subscribe(setStoreState);
  }, []);

  return {
    ...storeState,
    setCurrentDocument: (doc: AnalysisResult | null) => documentContextStore.setCurrentDocument(doc),
    setProcessing: (analyzing: boolean, stage: string, percent: number) =>
      documentContextStore.setProcessing(analyzing, stage, percent),
    setError: (err: string | null) => documentContextStore.setError(err),
    selectClause: (clause: Clause | null) => documentContextStore.selectClause(clause),
    selectRisk: (risk: SilentRisk | null) => documentContextStore.selectRisk(risk),
    toggleActionItem: (id: string) => documentContextStore.toggleActionItem(id),
    addChatMessage: (msg: ChatMessage) => documentContextStore.addChatMessage(msg),
    loadSample: (id: string) => documentContextStore.loadSample(id),
    reset: () => documentContextStore.reset(),
  };
}
