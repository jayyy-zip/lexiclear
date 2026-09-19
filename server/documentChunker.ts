import type { DocumentCoverage } from '../src/types/schemas';

export interface DocumentSectionChunk {
  id: string;
  heading?: string;
  page?: number | string;
  text: string;
  startOffset: number;
  endOffset: number;
}

export interface ChunkingResult {
  sections: DocumentSectionChunk[];
  coverage: DocumentCoverage;
  primaryContent: string;
}

const CHUNK_CHAR_LIMIT = 45000;

/**
 * Segments raw document text into logical sections with exact offset tracking.
 */
export function segmentDocumentIntoSections(
  rawText: string,
  pageCount?: number | string
): DocumentSectionChunk[] {
  if (!rawText || !rawText.trim()) return [];

  // Look for section patterns: "1. TITLE", "ARTICLE I", "SECTION 3", or "--- Page X ---"
  const paragraphs = rawText.split(/(?=\n\s*(?:--- Page \d+ ---|\d+[\.\)]\s+[A-Z]|ARTICLE\s+[IVXLCDM\d]+|SECTION\s+\d+|[A-Z\s]{4,}:))/g);

  const sections: DocumentSectionChunk[] = [];
  let currentOffset = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const chunkText = paragraphs[i].trim();
    if (!chunkText) continue;

    const startOffset = rawText.indexOf(chunkText, currentOffset);
    const endOffset = startOffset !== -1 ? startOffset + chunkText.length : currentOffset + chunkText.length;
    currentOffset = endOffset;

    // Detect section heading
    const firstLine = chunkText.split('\n')[0].trim();
    let heading = firstLine.length < 80 ? firstLine : `Section ${sections.length + 1}`;

    // Extract page reference if available
    let page: number | string | undefined = undefined;
    const pageMatch = chunkText.match(/--- Page (\d+) ---/);
    if (pageMatch) {
      page = parseInt(pageMatch[1], 10);
      heading = heading.replace(/--- Page \d+ ---\s*/, '').trim() || `Page ${page}`;
    }

    sections.push({
      id: `sec-${sections.length + 1}`,
      heading: heading || `Section ${sections.length + 1}`,
      page,
      text: chunkText,
      startOffset: startOffset !== -1 ? startOffset : 0,
      endOffset,
    });
  }

  // Fallback if no specific section delimiters were identified
  if (sections.length === 0) {
    sections.push({
      id: 'sec-1',
      heading: 'Document Body',
      page: pageCount,
      text: rawText.trim(),
      startOffset: 0,
      endOffset: rawText.length,
    });
  }

  return sections;
}

/**
 * Prepares content for AI analysis while measuring honest section coverage.
 */
export function prepareDocumentForAnalysis(
  rawText: string,
  pageCount?: number | string
): ChunkingResult {
  const sections = segmentDocumentIntoSections(rawText, pageCount);
  const sectionsTotal = sections.length;

  if (rawText.length <= CHUNK_CHAR_LIMIT) {
    return {
      sections,
      coverage: {
        sectionsAnalyzed: sectionsTotal,
        sectionsTotal,
        coverageComplete: true,
      },
      primaryContent: rawText,
    };
  }

  // Document exceeds single prompt limit: accumulate whole sections up to limit
  let accumulatedLength = 0;
  const includedSections: DocumentSectionChunk[] = [];

  for (const sec of sections) {
    if (accumulatedLength + sec.text.length <= CHUNK_CHAR_LIMIT) {
      includedSections.push(sec);
      accumulatedLength += sec.text.length + 2;
    } else {
      break;
    }
  }

  const sectionsAnalyzed = includedSections.length;
  const coverageComplete = sectionsAnalyzed >= sectionsTotal;

  const primaryContent = includedSections.map(s => s.text).join('\n\n');

  return {
    sections,
    coverage: {
      sectionsAnalyzed,
      sectionsTotal,
      coverageComplete,
    },
    primaryContent,
  };
}
