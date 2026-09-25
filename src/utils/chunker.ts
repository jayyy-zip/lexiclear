export interface DocumentSectionChunk {
  id: string;
  heading?: string;
  page?: number | string;
  text: string;
  startOffset: number;
  endOffset: number;
}

export interface ChunkBatch {
  chunkIndex: number;
  totalChunks: number;
  sections: DocumentSectionChunk[];
  chunkText: string;
  startOffset: number;
  endOffset: number;
}

const DEFAULT_CHUNK_CHAR_LIMIT = 40000;

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
 * Partitions document sections into safe, bounded batches suitable for serverless analysis requests.
 * Each chunk stays well below Vercel's payload limit (conservative <= 40k chars / ~40KB JSON).
 */
export function chunkSections(
  sections: DocumentSectionChunk[],
  maxCharsPerChunk = DEFAULT_CHUNK_CHAR_LIMIT
): ChunkBatch[] {
  if (!sections || sections.length === 0) return [];

  const batches: Array<{ sections: DocumentSectionChunk[]; text: string }> = [];
  let currentBatch: DocumentSectionChunk[] = [];
  let currentBatchChars = 0;

  for (const section of sections) {
    const sectionLen = section.text.length;

    if (currentBatch.length > 0 && currentBatchChars + sectionLen > maxCharsPerChunk) {
      batches.push({
        sections: currentBatch,
        text: currentBatch.map(s => (s.heading ? `[${s.heading}]\n` : '') + s.text).join('\n\n'),
      });
      currentBatch = [section];
      currentBatchChars = sectionLen;
    } else {
      currentBatch.push(section);
      currentBatchChars += sectionLen;
    }
  }

  if (currentBatch.length > 0) {
    batches.push({
      sections: currentBatch,
      text: currentBatch.map(s => (s.heading ? `[${s.heading}]\n` : '') + s.text).join('\n\n'),
    });
  }

  const totalChunks = batches.length;
  return batches.map((b, idx) => ({
    chunkIndex: idx,
    totalChunks,
    sections: b.sections,
    chunkText: b.text,
    startOffset: b.sections[0]?.startOffset ?? 0,
    endOffset: b.sections[b.sections.length - 1]?.endOffset ?? 0,
  }));
}

/**
 * Ranks and selects sections most relevant to a specific user question.
 * Enables stateless, lightweight Q&A without sending full documents to Vercel functions.
 */
export function findRelevantSections(
  question: string,
  sections: DocumentSectionChunk[],
  maxChars = 25000
): DocumentSectionChunk[] {
  if (!sections || sections.length === 0) return [];

  const stopWords = new Set([
    'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
    'does', 'doing', 'have', 'having', 'with', 'about', 'against', 'between',
    'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from',
    'under', 'again', 'further', 'then', 'once', 'here', 'there', 'all', 'any',
    'both', 'each', 'more', 'most', 'other', 'some', 'such', 'only', 'own',
    'same', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now',
    'this', 'that', 'these', 'those', 'the', 'and', 'for', 'are', 'was',
    'tell', 'explain', 'show', 'give', 'detail', 'details'
  ]);

  const tokens = question
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !stopWords.has(t));

  const scored = sections.map(sec => {
    let score = 0;
    const headingLower = (sec.heading || '').toLowerCase();
    const textLower = sec.text.toLowerCase();

    for (const token of tokens) {
      if (headingLower.includes(token)) score += 6;
      const count = textLower.split(token).length - 1;
      score += Math.min(count, 4);
    }
    return { section: sec, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const topMatches = scored.filter(s => s.score > 0).map(s => s.section);
  const candidates = topMatches.length > 0 ? topMatches : sections.slice(0, 3);

  const result: DocumentSectionChunk[] = [];
  let totalChars = 0;

  for (const s of candidates) {
    if (totalChars + s.text.length <= maxChars || result.length === 0) {
      result.push(s);
      totalChars += s.text.length;
    } else {
      break;
    }
  }

  return result;
}
