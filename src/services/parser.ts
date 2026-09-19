import * as mammoth from 'mammoth';

export interface ExtractedDocument {
  rawText: string;
  wordCount: number;
  pageCount?: number;
  fileType: 'pdf' | 'docx' | 'txt';
  fileName: string;
  fileSize: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  ''
];

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

  const nameParts = file.name.split('.');
  const ext = nameParts.length > 1 ? nameParts.pop()?.toLowerCase() : '';

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
    // Standardize multiple spaces into single space, but keep indentation/line breaks
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
 * Parses PDF using pdfjs-dist.
 */
async function parsePdf(file: File): Promise<{ text: string; pageCount: number }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjs = await import('pdfjs-dist');
    
    // Configure worker
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '4.10.38'}/pdf.worker.min.mjs`;
    }

    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });

    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;
    const textParts: string[] = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageStrings = textContent.items
        .map((item: any) => item.str || '')
        .filter(str => str.trim().length > 0);

      if (pageStrings.length > 0) {
        textParts.push(`--- Page ${pageNum} ---\n` + pageStrings.join(' '));
      }
    }

    const fullText = textParts.join('\n\n');
    return {
      text: fullText,
      pageCount: pageCount > 0 ? pageCount : 1
    };
  } catch (err: any) {
    console.error('PDF parsing error:', err);
    throw new Error(`Failed to read PDF file. The document may be password-protected or corrupted: ${err.message || err}`);
  }
}

/**
 * Parses DOCX using Mammoth.
 */
async function parseDocx(file: File): Promise<{ text: string; pageCount: number }> {
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

    // Estimate page count (~450 words per page)
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const pageCount = Math.max(1, Math.ceil(words / 450));

    return { text, pageCount };
  } catch (err: any) {
    console.error('DOCX parsing error:', err);
    throw new Error(`Failed to read DOCX file. The file may be corrupt or encrypted: ${err.message || err}`);
  }
}

/**
 * Parses plain TXT.
 */
async function parseTxt(file: File): Promise<{ text: string; pageCount: number }> {
  try {
    const text = await file.text();
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const pageCount = Math.max(1, Math.ceil(words / 450));
    return { text, pageCount };
  } catch (err: any) {
    console.error('TXT parsing error:', err);
    throw new Error(`Failed to read TXT file: ${err.message || err}`);
  }
}

/**
 * Extracts and normalizes document text.
 */
export async function extractDocumentText(file: File): Promise<ExtractedDocument> {
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const nameParts = file.name.split('.');
  const ext = (nameParts.pop() || '').toLowerCase() as 'pdf' | 'docx' | 'txt';

  let rawContent = '';
  let pageCount = 1;

  if (ext === 'pdf') {
    const result = await parsePdf(file);
    rawContent = result.text;
    pageCount = result.pageCount;
  } else if (ext === 'docx') {
    const result = await parseDocx(file);
    rawContent = result.text;
    pageCount = result.pageCount;
  } else if (ext === 'txt') {
    const result = await parseTxt(file);
    rawContent = result.text;
    pageCount = result.pageCount;
  } else {
    throw new Error(`Unsupported document extension: ${ext}`);
  }

  const normalized = normalizeExtractedText(rawContent);

  if (!normalized || normalized.length < 20) {
    throw new Error('The extracted document text is empty or too short to analyze. Please ensure the document contains readable text and is not an image-only scan.');
  }

  const wordCount = normalized.split(/\s+/).filter(Boolean).length;

  return {
    rawText: normalized,
    wordCount,
    pageCount,
    fileType: ext,
    fileName: file.name,
    fileSize: file.size
  };
}
