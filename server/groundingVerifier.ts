import type { SourceLocation, EvidenceStrength, SilentRisk } from '../src/types/schemas';

export interface DocumentSectionRef {
  id: string;
  heading?: string;
  page?: number | string;
  text: string;
  startOffset: number;
  endOffset: number;
}

/**
 * Normalizes quotes, whitespace, and punctuation for deterministic alignment.
 */
export function normalizeForSearch(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Finds exact or normalized substring coordinates within source document text.
 * Strictly avoids loose fuzzy matching (e.g. 70% bag of words) to prevent hallucinated citations.
 */
export function verifyEvidenceSnippet(
  rawText: string,
  candidateQuote: string | null | undefined,
  sections?: DocumentSectionRef[]
): SourceLocation | null {
  if (!candidateQuote || typeof candidateQuote !== 'string') {
    return null;
  }

  const cleanQuote = candidateQuote.trim();
  if (cleanQuote.length < 5) {
    return null;
  }

  // 1. Direct exact substring match
  const directIndex = rawText.indexOf(cleanQuote);
  if (directIndex !== -1) {
    const startOffset = directIndex;
    const endOffset = directIndex + cleanQuote.length;
    const sec = findSectionForOffset(startOffset, sections);
    return {
      quote: cleanQuote,
      startOffset,
      endOffset,
      sectionId: sec?.id,
      page: sec?.page,
    };
  }

  // 2. Direct case-insensitive match
  const lowerDoc = rawText.toLowerCase();
  const lowerQuote = cleanQuote.toLowerCase();
  const caseIndex = lowerDoc.indexOf(lowerQuote);
  if (caseIndex !== -1) {
    const startOffset = caseIndex;
    const endOffset = caseIndex + cleanQuote.length;
    const actualText = rawText.slice(startOffset, endOffset);
    const sec = findSectionForOffset(startOffset, sections);
    return {
      quote: actualText,
      startOffset,
      endOffset,
      sectionId: sec?.id,
      page: sec?.page,
    };
  }

  // 3. Normalized whitespace match
  const normalizedDoc = normalizeForSearch(rawText);
  const normalizedQuote = normalizeForSearch(cleanQuote);

  const normIndex = normalizedDoc.indexOf(normalizedQuote);
  if (normIndex !== -1) {
    // Map approximate location back into original text
    const approxRatio = rawText.length / (normalizedDoc.length || 1);
    const approxStart = Math.min(rawText.length - cleanQuote.length, Math.floor(normIndex * approxRatio));
    // Find closest exact sentence/word boundary around approxStart
    const searchWindow = rawText.slice(Math.max(0, approxStart - 500), Math.min(rawText.length, approxStart + cleanQuote.length + 500));
    const localNorm = normalizeForSearch(searchWindow);
    const localNormIndex = localNorm.indexOf(normalizedQuote);

    let finalStart = approxStart;
    if (localNormIndex !== -1) {
      finalStart = Math.max(0, approxStart - 500) + localNormIndex;
    }
    const finalEnd = Math.min(rawText.length, finalStart + cleanQuote.length);
    const sec = findSectionForOffset(finalStart, sections);

    return {
      quote: cleanQuote,
      startOffset: finalStart,
      endOffset: finalEnd,
      sectionId: sec?.id,
      page: sec?.page,
    };
  }

  // 4. If not found via exact or normalized substring, reject the candidate quote
  return null;
}

function findSectionForOffset(
  offset: number,
  sections?: DocumentSectionRef[]
): DocumentSectionRef | undefined {
  if (!sections || sections.length === 0) return undefined;
  return sections.find(s => offset >= s.startOffset && offset <= s.endOffset) || sections[0];
}

/**
 * Validates and attaches strict source coordinates to risks.
 * If evidence cannot be grounded, marks evidence strength as Limited evidence.
 */
export function verifyRisksGrounding(
  rawText: string,
  risks: SilentRisk[],
  sections?: DocumentSectionRef[]
): SilentRisk[] {
  return risks.map(risk => {
    const verifiedLocation = verifyEvidenceSnippet(rawText, risk.evidence, sections);
    if (verifiedLocation) {
      return {
        ...risk,
        evidence: verifiedLocation.quote,
        sourceLocation: verifiedLocation,
        evidenceStrength: risk.evidenceStrength || 'Strong evidence',
        pageReference: verifiedLocation.page ? `Page ${verifiedLocation.page}` : risk.pageReference,
      };
    }

    // Snippet not grounded: lower evidence strength and omit sourceLocation
    return {
      ...risk,
      sourceLocation: undefined,
      evidenceStrength: 'Limited evidence',
    };
  });
}

/**
 * Verifies whether a candidate clause reference exists in the document clauses or sections.
 * Returns true only if a matching clause title or section heading is found.
 */
export function verifyClauseReference(
  candidateClause: string | undefined,
  clauses?: Array<{ id?: string; title?: string }>,
  sections?: DocumentSectionRef[]
): boolean {
  if (!candidateClause || typeof candidateClause !== 'string') return false;
  const clean = candidateClause.toLowerCase().trim();
  if (!clean) return false;

  if (clauses && clauses.length > 0) {
    const matchedClause = clauses.some(c => {
      const titleLower = (c.title || '').toLowerCase();
      const idLower = (c.id || '').toLowerCase();
      return (
        (titleLower && (clean.includes(titleLower) || titleLower.includes(clean))) ||
        (idLower && clean.includes(idLower))
      );
    });
    if (matchedClause) return true;
  }

  if (sections && sections.length > 0) {
    const matchedSection = sections.some(s => {
      const headingLower = (s.heading || '').toLowerCase();
      return headingLower && (clean.includes(headingLower) || headingLower.includes(clean));
    });
    if (matchedSection) return true;
  }

  return false;
}

/**
 * Verifies whether a candidate page reference exists within the document's sections/page boundaries.
 * Returns true only if the page number exists in the document sections.
 */
export function verifyPageReference(
  candidatePage: number | string | undefined,
  sections?: DocumentSectionRef[]
): boolean {
  if (candidatePage === undefined || candidatePage === null) return false;
  if (!sections || sections.length === 0) return false;

  let pageNum: number | undefined;
  if (typeof candidatePage === 'number') {
    pageNum = candidatePage;
  } else if (typeof candidatePage === 'string') {
    const match = candidatePage.match(/\d+/);
    if (match) {
      pageNum = parseInt(match[0], 10);
    }
  }

  if (pageNum === undefined || isNaN(pageNum)) return false;

  return sections.some(s => {
    if (typeof s.page === 'number') {
      return s.page === pageNum;
    }
    if (typeof s.page === 'string') {
      const match = s.page.match(/\d+/);
      return match ? parseInt(match[0], 10) === pageNum : false;
    }
    return false;
  });
}

