import type { DocumentCoverage } from '../src/types/schemas';

export {
  type DocumentSectionChunk,
  type ChunkBatch,
  segmentDocumentIntoSections,
  chunkSections,
  findRelevantSections,
} from '../src/utils/chunker';
import { segmentDocumentIntoSections, type DocumentSectionChunk } from '../src/utils/chunker';

export interface ChunkingResult {
  sections: DocumentSectionChunk[];
  coverage: DocumentCoverage;
  primaryContent: string;
}

const CHUNK_CHAR_LIMIT = 45000;


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
