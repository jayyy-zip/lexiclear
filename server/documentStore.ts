import type { AnalysisResult, Clause, SilentRisk } from '../src/types/schemas';

export interface StoredDocumentContext {
  documentId: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt';
  rawText: string;
  sections: Array<{
    id: string;
    heading?: string;
    page?: number | string;
    text: string;
    startOffset: number;
    endOffset: number;
  }>;
  clauses: Clause[];
  risks: SilentRisk[];
  analysis: AnalysisResult;
  createdAt: number;
  lastAccessedAt: number;
  accessSequence: number;
}

const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_STORED_DOCUMENTS = 300;

export class EphemeralDocumentStore {
  private store = new Map<string, StoredDocumentContext>();
  private ttlMs: number;
  private maxCapacity: number;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private accessCounter = 0;

  constructor(ttlMs: number = DEFAULT_TTL_MS, maxCapacity: number = MAX_STORED_DOCUMENTS) {
    this.ttlMs = ttlMs;
    this.maxCapacity = maxCapacity;

    // Run background cleanup periodically every 15 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanupExpired();
      }, 15 * 60 * 1000);
      // Unref timer so it doesn't prevent Node process exit
      if (this.cleanupInterval?.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  public set(documentId: string, context: Omit<StoredDocumentContext, 'createdAt' | 'lastAccessedAt' | 'accessSequence'>): void {
    const now = Date.now();
    // Capacity check: if at capacity, evict least recently accessed document (lowest accessSequence)
    if (this.store.size >= this.maxCapacity && !this.store.has(documentId)) {
      let oldestId: string | null = null;
      let minSeq = Infinity;
      for (const [id, item] of this.store.entries()) {
        if (item.accessSequence < minSeq) {
          minSeq = item.accessSequence;
          oldestId = id;
        }
      }
      if (oldestId) {
        this.store.delete(oldestId);
      }
    }

    const seq = ++this.accessCounter;
    this.store.set(documentId, {
      ...context,
      createdAt: now,
      lastAccessedAt: now,
      accessSequence: seq,
    });
  }

  public get(documentId: string): StoredDocumentContext | null {
    const item = this.store.get(documentId);
    if (!item) return null;

    const now = Date.now();
    if (now - item.createdAt > this.ttlMs) {
      this.store.delete(documentId);
      return null;
    }

    item.lastAccessedAt = now;
    item.accessSequence = ++this.accessCounter;
    return item;
  }

  public has(documentId: string): boolean {
    return this.get(documentId) !== null;
  }

  public delete(documentId: string): boolean {
    return this.store.delete(documentId);
  }

  public size(): number {
    return this.store.size;
  }

  public cleanupExpired(): number {
    const now = Date.now();
    let removed = 0;
    for (const [id, item] of this.store.entries()) {
      if (now - item.createdAt > this.ttlMs) {
        this.store.delete(id);
        removed++;
      }
    }
    return removed;
  }

  public clear(): void {
    this.store.clear();
  }
}

export const documentStore = new EphemeralDocumentStore();
