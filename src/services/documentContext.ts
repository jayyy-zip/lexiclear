import { useState, useEffect } from 'react';
import type {
  AnalysisResult,
  ActionItem,
  ChatMessage,
  Clause,
  SilentRisk,
} from '../types/document';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';

export type DocumentProcessingStatus =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'analyzing'
  | 'validating'
  | 'ready'
  | 'error';

export interface DocumentStoreState {
  status: DocumentProcessingStatus;
  currentDocument: (AnalysisResult & { documentId?: string }) | null;
  selectedClause: Clause | null;
  selectedRisk: SilentRisk | null;
  chatHistory: ChatMessage[];
  isAnalyzing: boolean;
  processingStage: string;
  processingPercent: number;
  error: string | null;
}

let state: DocumentStoreState = {
  status: 'idle',
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

  setStatus(status: DocumentProcessingStatus, stageMessage?: string) {
    state.status = status;
    state.isAnalyzing = status !== 'idle' && status !== 'ready' && status !== 'error';
    if (stageMessage) {
      state.processingStage = stageMessage;
    }
    if (status === 'error') {
      state.isAnalyzing = false;
    }
    notify();
  },

  setCurrentDocument(doc: (AnalysisResult & { documentId?: string }) | null) {
    state.currentDocument = doc;
    state.error = null;
    state.status = doc ? 'ready' : 'idle';
    state.isAnalyzing = false;
    state.processingStage = 'Ready';

    // Pre-populate chat with welcome prompt
    if (doc) {
      state.chatHistory = [
        {
          id: 'welcome-msg',
          sender: 'ai',
          text: `I've analyzed "${doc.metadata.fileName}" (${doc.documentType}). I identified ${doc.risks.length} silent risks and computed an informational Legal Health Score of ${doc.healthScore.overallScore}/100. Feel free to ask me anything about obligations, deadlines, or specific clauses!`,
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
      state.status = 'analyzing';
      state.error = null;
    } else {
      state.status = state.currentDocument ? 'ready' : 'idle';
    }
    notify();
  },

  setError(error: string | null) {
    state.error = error;
    state.status = error ? 'error' : state.currentDocument ? 'ready' : 'idle';
    state.isAnalyzing = false;
    notify();
  },

  clearError() {
    state.error = null;
    state.status = state.currentDocument ? 'ready' : 'idle';
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
    this.setCurrentDocument({
      ...sample.precomputedAnalysis,
      documentId: sample.id,
    });
  },

  reset() {
    state = {
      status: 'idle',
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
    setStatus: (status: DocumentProcessingStatus, msg?: string) =>
      documentContextStore.setStatus(status, msg),
    setCurrentDocument: (doc: (AnalysisResult & { documentId?: string }) | null) =>
      documentContextStore.setCurrentDocument(doc),
    setProcessing: (analyzing: boolean, stage: string, percent: number) =>
      documentContextStore.setProcessing(analyzing, stage, percent),
    setError: (err: string | null) => documentContextStore.setError(err),
    clearError: () => documentContextStore.clearError(),
    selectClause: (clause: Clause | null) => documentContextStore.selectClause(clause),
    selectRisk: (risk: SilentRisk | null) => documentContextStore.selectRisk(risk),
    toggleActionItem: (id: string) => documentContextStore.toggleActionItem(id),
    addChatMessage: (msg: ChatMessage) => documentContextStore.addChatMessage(msg),
    loadSample: (id: string) => documentContextStore.loadSample(id),
    reset: () => documentContextStore.reset(),
  };
}
