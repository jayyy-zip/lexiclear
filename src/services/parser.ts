import * as mammoth from 'mammoth';

// Ensure Uint8Array.prototype.toHex exists across all JavaScript runtimes (Node, Safari, Chromium)
if (typeof Uint8Array !== 'undefined' && typeof (Uint8Array.prototype as any).toHex !== 'function') {
  (Uint8Array.prototype as any).toHex = function () {
    return Array.from(this)
      .map(b => (b as number).toString(16).padStart(2, '0'))
      .join('');
  };
}

export interface DocumentSection {
  id: string;
  heading?: string;
  page?: number | 'Page not available';
  pageEstimated?: boolean;
  text: string;
  startOffset: number;
  endOffset: number;
}

export interface ExtractedDocument {
  rawText: string;
  wordCount: number;
  pageCount?: number | string;
  pageCountEstimated?: boolean;
  fileType: 'pdf' | 'docx' | 'txt';
  fileName: string;
  fileSize: number;
  sections?: DocumentSection[];
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt'];

export function validateFile(file: File): ValidationResult {
  if (!file) {
    return { isValid: false, error: 'No file provided. Please select a valid document.' };
  }

  if (file.size === 0) {
    return { isValid: false, error: 'The selected file is empty (0 bytes). Please upload a document with text.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size (${sizeInMb} MB) exceeds the maximum allowed limit of 15 MB.`
    };
  }

  const rawName = file.name || '';
  const nameParts = rawName.split('.');
  let ext = nameParts.length > 1 ? nameParts.pop()?.toLowerCase()?.trim() : '';

  // Safe fallback to MIME type if extension is missing on mobile pickers
  if (!ext && file.type) {
    const mime = file.type.toLowerCase();
    if (mime.includes('pdf')) ext = 'pdf';
    else if (mime.includes('wordprocessingml') || mime.includes('docx') || mime.includes('msword')) ext = 'docx';
    else if (mime.includes('text/plain')) ext = 'txt';
  }

  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      isValid: false,
      error: `Unsupported file format (.${ext || 'unknown'}). LexiClear supports PDF, DOCX, and TXT files.`
    };
  }

  return { isValid: true };
}

/**
 * Normalizes document text while preserving headings, paragraphs, and numbering.
 */
export function normalizeExtractedText(text: string): string {
  if (!text) return '';

  return text
    // Normalize Windows/Mac line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove non-printable control characters except standard whitespace
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Standardize multiple spaces into single space, but keep line breaks
    .replace(/[ \t]+/g, ' ')
    // Remove excessive trailing spaces per line
    .split('\n')
    .map(line => line.trim())
    // Join with single empty line between logical paragraphs
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Safely reads PDF text content across Safari, Chromium, and Firefox.
 * PDF.js 6.x PDFPageProxy.getTextContent() internally uses:
 *   for await (const value of readableStream)
 * which fails on Safari 26.5 when ReadableStream lacks an async iterator.
 * Using streamTextContent().getReader() bypasses Symbol.asyncIterator entirely.
 */
export async function readPdfTextContent(page: any): Promise<{
  items: Array<{ str?: string; [key: string]: any }>;
  styles: Record<string, any>;
  lang?: string;
}> {
  if (typeof page.streamTextContent === 'function') {
    const stream = page.streamTextContent();
    const reader = stream.getReader();

    const textContent: {
      items: any[];
      styles: Record<string, any>;
      lang?: string;
    } = {
      items: [],
      styles: {},
      lang: undefined,
    };

    try {
      while (true) {
        const { value, done } = await reader.read();

        if (done) break;
        if (!value) continue;

        if (value.lang && !textContent.lang) {
          textContent.lang = value.lang;
        }

        if (value.styles) {
          Object.assign(textContent.styles, value.styles);
        }

        if (Array.isArray(value.items)) {
          textContent.items.push(...value.items);
        }
      }
    } finally {
      if (typeof reader.releaseLock === 'function') {
        reader.releaseLock();
      }
    }

    return textContent;
  }

  // Fallback for mock environments or legacy page proxies
  if (typeof page.getTextContent === 'function') {
    return await page.getTextContent();
  }

  return { items: [], styles: {} };
}

/**
 * Classifies PDF extraction errors into clear, friendly user-facing messages.
 * Never exposes raw JavaScript errors such as "undefined is not a function".
 */
export function classifyPdfError(err: any): string {
  const msg = (err?.message || String(err || '')).toLowerCase();
  const name = (err?.name || '').toLowerCase();

  // 1. Password / Encrypted PDF
  if (
    name.includes('password') ||
    msg.includes('password') ||
    msg.includes('encrypted') ||
    msg.includes('secured')
  ) {
    return 'This PDF is password-protected or encrypted. Please remove password protection before uploading.';
  }

  // 2. Corrupted / Invalid PDF file
  if (
    name.includes('invalidpdf') ||
    msg.includes('invalid pdf') ||
    msg.includes('corrupt') ||
    msg.includes('damaged') ||
    msg.includes('xref') ||
    msg.includes('missing endstream') ||
    msg.includes('format error')
  ) {
    return 'Failed to read PDF file. The document appears to be corrupted or not a valid PDF.';
  }

  // 3. Scanned / Image-only PDF
  if (
    msg.includes('scanned image') ||
    msg.includes('without selectable text') ||
    msg.includes('image-only')
  ) {
    return 'This PDF appears to be a scanned image or photo without selectable text. LexiClear requires text-based documents or OCR.';
  }

  // 4. Browser stream / iterator / compatibility failure (Safari readableStream, etc.)
  if (
    msg.includes('undefined is not a function') ||
    msg.includes('readablestream') ||
    msg.includes('iterator') ||
    msg.includes('not a function') ||
    msg.includes('getreader')
  ) {
    return "LexiClear couldn't extract readable text from this PDF due to a browser compatibility issue. Try another PDF or an OCR-readable document.";
  }

  // 5. Clean user-facing fallback
  return "LexiClear couldn't extract readable text from this PDF. Try another PDF or an OCR-readable document.";
}

/**
 * Parses PDF using pdfjs-dist, preserving page boundaries and detecting scanned/empty PDFs.
 */
async function parsePdf(file: File): Promise<{ text: string; pageCount: number; sections: DocumentSection[] }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjs = await import('pdfjs-dist');

    // Configure worker: prefer local bundled worker matching installed pdfjs-dist version 6.3.289
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      if (typeof window !== 'undefined') {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      } else {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version || '6.3.289'}/build/pdf.worker.min.mjs`;
      }
    }

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;
    const sections: DocumentSection[] = [];
    const textParts: string[] = [];
    let cumulativeOffset = 0;
    let totalExtractedLength = 0;

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await readPdfTextContent(page);

      const pageStrings = textContent.items
        .map((item: any) => item.str || '')
        .filter(str => str.trim().length > 0);

      const pageJoined = pageStrings.join(' ').trim();
      totalExtractedLength += pageJoined.length;

      if (pageJoined.length > 0) {
        const pageHeader = `--- Page ${pageNum} ---\n`;
        const fullPageText = pageHeader + pageJoined;
        textParts.push(fullPageText);

        sections.push({
          id: `sec-p${pageNum}`,
          heading: `Page ${pageNum}`,
          page: pageNum,
          pageEstimated: false,
          text: pageJoined,
          startOffset: cumulativeOffset,
          endOffset: cumulativeOffset + fullPageText.length,
        });

        cumulativeOffset += fullPageText.length + 2;
      }
    }

    // Check for image-only or scanned PDF without OCR
    if (totalExtractedLength < 10 && pageCount > 0) {
      throw new Error(
        'This PDF appears to be a scanned image or photo without selectable text. LexiClear requires text-based documents or OCR.'
      );
    }

    const fullText = textParts.join('\n\n');
    return {
      text: fullText,
      pageCount: pageCount > 0 ? pageCount : 1,
      sections,
    };
  } catch (err: any) {
    console.error('PDF parsing error:', err);
    throw new Error(classifyPdfError(err));
  }
}

/**
 * Parses DOCX using Mammoth, preserving section headings without fabricating page counts.
 */
async function parseDocx(file: File): Promise<{ text: string; pageCount: string; sections: DocumentSection[] }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value || '';

    if (result.messages && result.messages.length > 0) {
      const warnings = result.messages.filter(m => m.type === 'warning');
      if (warnings.length > 0) {
        console.warn('DOCX extraction warnings:', warnings);
      }
    }

    // Split paragraphs into sections
    const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
    const sections: DocumentSection[] = [];
    let currentOffset = 0;

    paragraphs.forEach((p, idx) => {
      const firstLine = p.split('\n')[0].trim().slice(0, 60);
      sections.push({
        id: `sec-${idx + 1}`,
        heading: firstLine || `Section ${idx + 1}`,
        page: 'Page not available',
        pageEstimated: false,
        text: p,
        startOffset: currentOffset,
        endOffset: currentOffset + p.length,
      });
      currentOffset += p.length + 2;
    });

    return {
      text,
      pageCount: 'Page not available',
      sections,
    };
  } catch (err: any) {
    console.error('DOCX parsing error:', err);
    throw new Error(`Failed to read DOCX file. The file may be corrupt or encrypted: ${err.message || err}`);
  }
}

/**
 * Parses plain TXT.
 */
async function parseTxt(file: File): Promise<{ text: string; pageCount: string; sections: DocumentSection[] }> {
  try {
    const text = await file.text();
    const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
    const sections: DocumentSection[] = [];
    let currentOffset = 0;

    paragraphs.forEach((p, idx) => {
      const firstLine = p.split('\n')[0].trim().slice(0, 60);
      sections.push({
        id: `sec-${idx + 1}`,
        heading: firstLine || `Paragraph ${idx + 1}`,
        page: 'Page not available',
        pageEstimated: false,
        text: p,
        startOffset: currentOffset,
        endOffset: currentOffset + p.length,
      });
      currentOffset += p.length + 2;
    });

    return {
      text,
      pageCount: 'Page not available',
      sections,
    };
  } catch (err: any) {
    console.error('TXT parsing error:', err);
    throw new Error(`Failed to read TXT file: ${err.message || err}`);
  }
}

/**
 * Extracts, validates, and normalizes document text.
 */
export async function extractDocumentText(file: File): Promise<ExtractedDocument> {
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const rawName = file.name || 'document';
  const nameParts = rawName.split('.');
  let ext = (nameParts.length > 1 ? nameParts.pop() : '')?.toLowerCase()?.trim() as 'pdf' | 'docx' | 'txt';

  if (!ext && file.type) {
    const mime = file.type.toLowerCase();
    if (mime.includes('pdf')) ext = 'pdf';
    else if (mime.includes('wordprocessingml') || mime.includes('docx') || mime.includes('msword')) ext = 'docx';
    else if (mime.includes('text/plain')) ext = 'txt';
  }

  let rawContent = '';
  let pageCount: number | string = 1;
  let pageCountEstimated = false;
  let sections: DocumentSection[] = [];

  if (ext === 'pdf') {
    const result = await parsePdf(file);
    rawContent = result.text;
    pageCount = result.pageCount;
    sections = result.sections;
  } else if (ext === 'docx') {
    const result = await parseDocx(file);
    rawContent = result.text;
    pageCount = result.pageCount;
    sections = result.sections;
  } else if (ext === 'txt') {
    const result = await parseTxt(file);
    rawContent = result.text;
    pageCount = result.pageCount;
    sections = result.sections;
  } else {
    throw new Error(`Unsupported document extension: .${ext}`);
  }

  const normalized = normalizeExtractedText(rawContent);

  if (!normalized || normalized.length < 20) {
    throw new Error(
      'The extracted document text is empty or too short to analyze. Please ensure the document contains readable text and is not an image-only scan.'
    );
  }

  const wordCount = normalized.split(/\s+/).filter(Boolean).length;

  return {
    rawText: normalized,
    wordCount,
    pageCount,
    pageCountEstimated,
    fileType: ext,
    fileName: file.name,
    fileSize: file.size,
    sections,
  };
}
