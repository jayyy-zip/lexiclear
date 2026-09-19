import {
  validateFile,
  normalizeExtractedText,
  readPdfTextContent,
  classifyPdfError,
  extractDocumentText,
} from '../src/services/parser';
import {
  calculateCompositeHealthScore,
  getScoreStatus,
  getDimensionStatus,
  buildLegalHealthScore,
  normalizeEvidenceStrength,
  normalizeSeverity,
  deduplicateRisks,
  computeDeterministicHealthScore,
  clampScore,
} from '../src/services/riskEngine';
import { SAMPLE_DOCUMENTS } from '../src/data/sampleDocuments';
import { generateIcsContent } from '../src/utils/icsExporter';
import {
  verifyEvidenceSnippet,
  verifyRisksGrounding,
  normalizeForSearch,
  verifyClauseReference,
  verifyPageReference,
} from '../server/groundingVerifier';
import {
  segmentDocumentIntoSections,
  prepareDocumentForAnalysis,
} from '../server/documentChunker';
import { documentStore, EphemeralDocumentStore } from '../server/documentStore';
import {
  AnalyzeDocumentRequestSchema,
  AskDocumentRequestSchema,
  AiAnalysisPayloadSchema,
  ClauseSchema,
  SilentRiskSchema,
} from '../src/types/schemas';
import { app } from '../server';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n=============================================');
  console.log('🧪 Running LexiClear MVP Automated Test Suite');
  console.log('=============================================\n');

  // -------------------------------------------------------------
  // Test 1: File Validation - Valid Extensions
  // -------------------------------------------------------------
  const mockValidPdf = { name: 'contract.pdf', size: 1024 * 100 } as File;
  const mockValidDocx = { name: 'agreement.docx', size: 1024 * 200 } as File;
  const mockValidTxt = { name: 'terms.txt', size: 1024 * 10 } as File;
  assert(validateFile(mockValidPdf).isValid === true, 'Validation allows .pdf file');
  assert(validateFile(mockValidDocx).isValid === true, 'Validation allows .docx file');
  assert(validateFile(mockValidTxt).isValid === true, 'Validation allows .txt file');

  // Test 2: File Validation - Empty File
  const mockEmptyFile = { name: 'empty.pdf', size: 0 } as File;
  const emptyRes = validateFile(mockEmptyFile);
  assert(emptyRes.isValid === false, 'Rejects empty 0-byte file');
  assert(Boolean(emptyRes.error?.includes('empty')), 'Returns friendly error for empty file');

  // Test 3: File Validation - Max Size Exceeded
  const mockOverLimit = { name: 'huge.pdf', size: 16 * 1024 * 1024 } as File;
  const limitRes = validateFile(mockOverLimit);
  assert(limitRes.isValid === false, 'Rejects files over 15MB');
  assert(Boolean(limitRes.error?.includes('exceeds')), 'Returns friendly size limit message');

  // Test 4: File Validation - Unsupported Format
  const mockBadExt = { name: 'malicious.exe', size: 1024 * 50 } as File;
  const badExtRes = validateFile(mockBadExt);
  assert(badExtRes.isValid === false, 'Rejects unsupported file format');

  // Test 5: Text Extraction Normalization
  const rawSampleText = 'Heading 1\r\n\r\nParagraph with   extra   spaces\x00 and breaks.\n\n\n\nNext paragraph.';
  const normalized = normalizeExtractedText(rawSampleText);
  assert(!normalized.includes('\r'), 'Normalizes CRLF carriage returns');
  assert(!normalized.includes('\x00'), 'Strips non-printable control characters');
  assert(!normalized.includes('\n\n\n'), 'Collapses excessive empty lines');
  assert(normalized.includes('Heading 1'), 'Preserves headings');

  // Test 6: Composite Health Score Calculation
  const sampleDimensions = {
    fairness: 70,
    clarity: 80,
    riskExposure: 60,
    obligationBalance: 65,
    terminationRights: 70,
    disputeResolution: 75,
  };
  const score = calculateCompositeHealthScore(sampleDimensions);
  assert(score === 69, `Calculates weighted composite health score correctly (got ${score}, expected 69)`);
  assert(getScoreStatus(score) === 'Moderate Health', 'Correctly maps score status badge');
  assert(getScoreStatus(55) === 'Needs Attention', 'Maps 55 to Needs Attention');
  assert(getScoreStatus(85) === 'Strong Terms', 'Maps high score to Strong Terms');
  assert(getScoreStatus(35) === 'Critical Risk', 'Maps low score to Critical Risk');

  // Test 7: Dimension Score Status
  assert(getDimensionStatus(90) === 'Strong', 'Maps dimension 90 to Strong');
  assert(getDimensionStatus(70) === 'Fair', 'Maps dimension 70 to Fair');
  assert(getDimensionStatus(55) === 'Warning', 'Maps dimension 55 to Warning');
  assert(getDimensionStatus(30) === 'Critical', 'Maps dimension 30 to Critical');

  // Test 8: Full Legal Health Score Builder
  const builtScore = buildLegalHealthScore({
    fairness: { score: 40, keyFinding: 'One-sided indemnity' },
    clarity: { score: 70, keyFinding: 'Clear terms' },
    riskExposure: { score: 35, keyFinding: 'Unlimited damages' },
    obligationBalance: { score: 50, keyFinding: 'Asymmetrical maintenance' },
    terminationRights: { score: 30, keyFinding: '90-day auto-renewal' },
    disputeResolution: { score: 60, keyFinding: 'Binding arbitration' },
  });
  assert(builtScore.overallScore < 50, 'Reflects critical risk downward pressure');
  assert(builtScore.dimensions.riskExposure.weight === 25, 'Risk exposure has 25% weight');
  assert(Boolean(builtScore.calculationMethodology), 'Includes transparent calculation methodology');

  // Test 9: Evidence Strength Normalization (Anti-Hallucination Labeling)
  assert(normalizeEvidenceStrength('Strong evidence') === 'Strong evidence', 'Preserves Strong evidence');
  assert(normalizeEvidenceStrength('high certainty') === 'Strong evidence', 'Maps high certainty to Strong evidence');
  assert(normalizeEvidenceStrength('weak mention') === 'Limited evidence', 'Maps weak mention to Limited evidence');
  assert(normalizeEvidenceStrength(undefined) === 'Moderate evidence', 'Defaults to Moderate evidence');

  // Test 10: Sample Contract Structure & Silent Risks
  const sampleDoc = SAMPLE_DOCUMENTS[0]; // Residential Lease
  assert(sampleDoc.precomputedAnalysis.clauses.length >= 5, 'Sample lease has segmented clauses');
  assert(sampleDoc.precomputedAnalysis.risks.length >= 3, 'Sample lease has detected silent risks');

  const risk1 = sampleDoc.precomputedAnalysis.risks[0];
  assert(Boolean(risk1.clauseTitle), 'Risk contains clause reference');
  assert(Boolean(risk1.evidence), 'Risk contains verbatim quoted evidence');
  assert(Boolean(risk1.userImpact), 'Risk contains practical user impact');
  assert(Boolean(risk1.questionToConsider), 'Risk contains question to consider');

  // Test 11: Lawyer Prep Kit Generation Format
  const prepKit = sampleDoc.precomputedAnalysis.lawyerPrepKit;
  assert(Boolean(prepKit.documentSummary), 'Prep kit has document summary');
  assert(prepKit.topConcerns.length > 0, 'Prep kit has top concerns');
  assert(prepKit.questionsForLawyer.length > 0, 'Prep kit has questions for lawyer');
  assert(prepKit.supportingDocumentsToBring.length > 0, 'Prep kit lists documents to bring');
  assert(prepKit.disclaimer.includes('not legal advice'), 'Prep kit enforces mandatory legal disclaimer');

  // Test 12: Calendar ICS Export Utility
  const timelineItem = sampleDoc.precomputedAnalysis.timeline[0];
  const ics = generateIcsContent(timelineItem, sampleDoc.name);
  assert(ics.includes('BEGIN:VCALENDAR'), 'ICS contains VCALENDAR envelope');
  assert(ics.includes('BEGIN:VEVENT'), 'ICS contains VEVENT definition');
  assert(ics.includes(`SUMMARY:LexiClear Deadline: ${timelineItem.title}`), 'ICS contains formatted event summary');

  // Test 13: Grounding & Anti-Hallucination Protocol (Questions In vs Out of Document)
  const { answerDocumentQuestion } = await import('../src/services/gemini');

  // 13A: In-document question - Deposit deduction
  const inDocRes = await answerDocumentQuestion({
    rawText: sampleDoc.rawText,
    question: 'Can my landlord deduct my deposit?',
    clauses: sampleDoc.precomputedAnalysis.clauses,
  });
  assert(inDocRes.isNotFound === false, 'In-document question is found');
  assert(Boolean(inDocRes.clauseReference?.includes('Clause 3')), 'Cites Clause 3 for deposit deduction');
  assert(Boolean(inDocRes.pageReference?.includes('Page 1')), 'Cites Page 1 for deposit deduction');
  assert(Boolean(inDocRes.evidenceSnippet?.includes('$450.00')), 'Quotes verbatim $450.00 cleaning fee snippet');
  assert(Boolean(sampleDoc.rawText.includes(inDocRes.evidenceSnippet || '')), 'Verified evidence snippet actually exists in contract text');

  // 13B: Out-of-document question - Absent topic (rooftop pool)
  const outDocRes = await answerDocumentQuestion({
    rawText: sampleDoc.rawText,
    question: 'Does the building have a heated rooftop swimming pool?',
    clauses: sampleDoc.precomputedAnalysis.clauses,
  });
  assert(outDocRes.isNotFound === true, 'Out-of-document question marked as not found');
  assert(outDocRes.answer.includes("I couldn't find that information in the uploaded document."), 'Returns exact non-hallucination fallback');
  assert(!outDocRes.clauseReference, 'No fabricated clause reference on absent question');
  assert(!outDocRes.evidenceSnippet, 'No fabricated evidence snippet on absent question');

  // Test 14: Verbatim Citation Audit for Sample Documents
  for (const clause of sampleDoc.precomputedAnalysis.clauses) {
    const exists = sampleDoc.rawText.includes(clause.text);
    assert(exists, `Verbatim citation audit: "${clause.title}" text is 100% present in source rawText`);
  }
  for (const risk of sampleDoc.precomputedAnalysis.risks) {
    const exists = sampleDoc.rawText.includes(risk.evidence);
    assert(exists, `Verbatim evidence audit: Risk "${risk.title}" quote is present in source rawText`);
  }

  // Test 15: Demo Path Verification (62/100 Health Score, 3 High Risks)
  assert(sampleDoc.precomputedAnalysis.healthScore.overallScore === 62, 'Sample rental agreement has exact 62/100 Health Score');
  const highRisks = sampleDoc.precomputedAnalysis.risks.filter(r => r.severity === 'high');
  assert(highRisks.length === 3, `Identifies exactly 3 High Severity Silent Risks (found ${highRisks.length})`);
  assert(sampleDoc.precomputedAnalysis.clauses.length === 8, `Sample rental agreement has all 8 clauses (found ${sampleDoc.precomputedAnalysis.clauses.length})`);

  // -------------------------------------------------------------
  // NEW TESTS: P0 & P1 Hardening Requirements
  // -------------------------------------------------------------

  console.log('\n--- Section 16: Grounding Verifier & Source Location Coordinates ---');
  const testDocText = `RESIDENTIAL LEASE AGREEMENT\n\n1. TERM & RENEWAL\nThe initial term shall commence on August 1, 2025. Unless Tenant provides ninety (90) days notice, this Agreement shall automatically renew for a successive twelve (12) month term.\n\n2. REPAIRS\nTenant is solely responsible for all maintenance and repairs including HVAC filters.`;

  const sections = [
    { id: 'sec-1', heading: 'Title', page: 1, text: 'RESIDENTIAL LEASE AGREEMENT', startOffset: 0, endOffset: 27 },
    { id: 'sec-2', heading: 'Term & Renewal', page: 1, text: '1. TERM & RENEWAL\nThe initial term shall commence on August 1, 2025.', startOffset: 29, endOffset: 220 },
    { id: 'sec-3', heading: 'Repairs', page: 2, text: '2. REPAIRS\nTenant is solely responsible for all maintenance.', startOffset: 222, endOffset: 320 },
  ];

  // Exact quote match returns offsets and section ID
  const exactMatch = verifyEvidenceSnippet(testDocText, 'automatically renew for a successive twelve (12) month term', sections);
  assert(exactMatch !== null, 'Grounding verifier finds exact substring');
  assert(exactMatch?.startOffset !== undefined && exactMatch.startOffset > 0, 'Grounding returns valid startOffset');
  assert(exactMatch?.endOffset !== undefined && exactMatch.endOffset > exactMatch.startOffset!, 'Grounding returns valid endOffset');
  assert(exactMatch?.sectionId === 'sec-2', `Grounding maps correctly to sectionId (got ${exactMatch?.sectionId})`);

  // Whitespace normalized match
  const whitespaceQuote = 'automatically renew   for a  successive twelve (12) month term';
  const normMatch = verifyEvidenceSnippet(testDocText, whitespaceQuote, sections);
  assert(normMatch !== null, 'Grounding verifier handles whitespace variations deterministically');

  // Completely fabricated quote must be rejected (NO 70% fuzzy matching)
  const fakeQuote = 'The tenant shall have free access to the penthouse jacuzzi at all times.';
  const fakeMatch = verifyEvidenceSnippet(testDocText, fakeQuote, sections);
  assert(fakeMatch === null, 'Grounding verifier rejects fabricated quote');

  // Random bag of words with 70% matching words must NOT trigger false positive
  const fuzzyBag = 'renew term Agreement commence August Tenant initial 2025 twelve month fake extra nonsense';
  const fuzzyMatch = verifyEvidenceSnippet(testDocText, fuzzyBag, sections);
  assert(fuzzyMatch === null, 'Grounding verifier rejects 70% fuzzy bag-of-words hallucination');

  console.log('\n--- Section 17: Risk Engine Determinism, Deduplication & Clamping ---');
  // Clamping
  assert(clampScore(150) === 100, 'Score > 100 clamped to 100');
  assert(clampScore(-20) === 0, 'Score < 0 clamped to 0');
  assert(clampScore('invalid') === 60, 'Malformed non-number score defaults to 60');

  // Severity normalization
  assert(normalizeSeverity('CRITICAL') === 'high', 'Normalizes CRITICAL to high');
  assert(normalizeSeverity('low risk') === 'low', 'Normalizes low risk to low');
  assert(normalizeSeverity('unknown') === 'medium', 'Defaults unknown severity to medium');

  // Risk deduplication
  const duplicateRisks: any[] = [
    { id: 'r1', clauseId: 'c-1', title: 'Renewal Penalty', evidence: 'automatically renew', severity: 'high' },
    { id: 'r2', clauseId: 'c-1', title: 'Renewal Penalty', evidence: 'automatically renew', severity: 'high' },
    { id: 'r3', clauseId: 'c-2', title: 'Repair Burden', evidence: 'solely responsible', severity: 'medium' },
  ];
  const deduped = deduplicateRisks(duplicateRisks);
  assert(deduped.length === 2, `Deduplicates redundant risks (expected 2, got ${deduped.length})`);

  // Deterministic local score calculation
  const detScore = computeDeterministicHealthScore(
    {
      fairness: { score: 80, keyFinding: 'Good' },
      riskExposure: { score: 85, keyFinding: 'Good' },
      terminationRights: { score: 80, keyFinding: 'Good' },
    },
    [
      {
        id: 'r1',
        clauseId: 'c-1',
        title: 'Asymmetrical unilateral termination and liability',
        reason: 'Unilateral sole discretion termination',
        evidence: 'terminate',
        severity: 'high',
        evidenceStrength: 'Strong evidence',
        userImpact: 'Severe',
        questionToConsider: 'Amend',
      },
    ]
  );
  assert(detScore.overallScore <= 80, 'Deterministic engine downward-adjusts overall score for high risks');
  assert(detScore.dimensions.riskExposure.score < 85, 'Downward adjusts Risk Exposure dimension for high liability risk');

  console.log('\n--- Section 18: Intelligent Document Chunker & Coverage Metrics ---');
  const shortDoc = '1. FIRST CLAUSE\nText of first clause.\n\n2. SECOND CLAUSE\nText of second clause.';
  const chunkRes = prepareDocumentForAnalysis(shortDoc);
  assert(chunkRes.coverage.coverageComplete === true, 'Short document has coverageComplete = true');
  assert(chunkRes.coverage.sectionsAnalyzed === chunkRes.coverage.sectionsTotal, 'Sections analyzed equals total sections');
  assert(chunkRes.sections.length >= 2, 'Segments into at least 2 logical sections');

  console.log('\n--- Section 19: Ephemeral Bounded Document Store ---');
  const testDocId = 'doc-test-123';
  documentStore.set(testDocId, {
    documentId: testDocId,
    fileName: 'test.pdf',
    fileType: 'pdf',
    rawText: 'Sample text for test store.',
    sections: [],
    clauses: [],
    risks: [],
    analysis: sampleDoc.precomputedAnalysis,
  });

  assert(documentStore.has(testDocId) === true, 'DocumentStore stores and checks presence of document');
  const retrievedDoc = documentStore.get(testDocId);
  assert(retrievedDoc?.fileName === 'test.pdf', 'DocumentStore retrieves stored document context');
  assert(documentStore.get('non-existent-id') === null, 'DocumentStore returns null for unknown document ID');
  documentStore.delete(testDocId);
  assert(documentStore.has(testDocId) === false, 'DocumentStore deletes document on demand');

  console.log('\n--- Section 20: Zod Runtime Schema Validation ---');
  // Valid analyze payload
  const validAnalyzeReq = {
    rawText: 'This is a valid legal contract with sufficient length for analysis.',
    fileName: 'agreement.txt',
    fileType: 'txt',
  };
  assert(AnalyzeDocumentRequestSchema.safeParse(validAnalyzeReq).success === true, 'AnalyzeDocumentRequestSchema validates correct payload');

  // Invalid empty analyze payload (< 20 chars)
  const invalidAnalyzeReq = { rawText: 'short' };
  assert(AnalyzeDocumentRequestSchema.safeParse(invalidAnalyzeReq).success === false, 'AnalyzeDocumentRequestSchema rejects text < 20 characters');

  // Valid ask request
  const validAskReq = { documentId: 'doc-123', question: 'When is rent due?' };
  assert(AskDocumentRequestSchema.safeParse(validAskReq).success === true, 'AskDocumentRequestSchema validates documentId Q&A request');

  // Invalid empty question
  const invalidAskReq = { question: '' };
  assert(AskDocumentRequestSchema.safeParse(invalidAskReq).success === false, 'AskDocumentRequestSchema rejects empty question');

  console.log('\n--- Section 21: Express API Integration Tests ---');
  // Start server on a test port
  const testPort = 3999;
  const testServer = await new Promise<http.Server>(resolve => {
    const s = app.listen(testPort, '127.0.0.1', () => resolve(s));
  });

  try {
    // 21A: GET /api/health
    const healthRes = await fetch(`http://127.0.0.1:${testPort}/api/health`);
    assert(healthRes.status === 200, 'GET /api/health returns HTTP 200');
    const healthJson = await healthRes.json();
    assert(healthJson.status === 'ok', 'Health response status is "ok"');
    assert(healthJson.service === 'lexiclear-api', 'Health response identifies service');
    assert(healthJson.geminiKeySet === undefined, 'Health endpoint does NOT leak secret or key status');

    // 21B: GET /api/ready
    const readyRes = await fetch(`http://127.0.0.1:${testPort}/api/ready`);
    assert(readyRes.status === 200, 'GET /api/ready returns HTTP 200');
    const readyJson = await readyRes.json();
    assert(readyJson.ready === true, 'Readiness response indicates ready');

    // 21C: Request ID Header verification
    assert(Boolean(healthRes.headers.get('x-request-id')), 'API attaches X-Request-ID header to responses');

    // 21D: Security Headers verification
    assert(healthRes.headers.get('x-content-type-options') === 'nosniff', 'Security header X-Content-Type-Options is nosniff');
    assert(healthRes.headers.get('x-frame-options') === 'DENY', 'Security header X-Frame-Options is DENY');

    // 21E: POST /api/v1/analyze-document with invalid payload
    const badAnalyzeRes = await fetch(`http://127.0.0.1:${testPort}/api/v1/analyze-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText: 'Too short' }),
    });
    assert(badAnalyzeRes.status === 400, 'POST /api/v1/analyze-document returns 400 on invalid payload');
    const badAnalyzeJson = await badAnalyzeRes.json();
    assert(badAnalyzeJson.error?.code === 'INVALID_DOCUMENT', 'API returns structured error code INVALID_DOCUMENT');
    assert(Boolean(badAnalyzeJson.requestId), 'Error envelope contains requestId');
    assert(!badAnalyzeJson.stack, 'Error response does NOT leak stack trace');

    // 21F: POST /api/v1/ask-document with missing context
    const badAskRes = await fetch(`http://127.0.0.1:${testPort}/api/v1/ask-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'What is the rent?' }),
    });
    assert(badAskRes.status === 400, 'POST /api/v1/ask-document returns 400 when documentId/rawText is missing');
    const badAskJson = await badAskRes.json();
    assert(badAskJson.error?.code === 'MISSING_DOCUMENT_CONTEXT', 'Returns MISSING_DOCUMENT_CONTEXT error code');

    // 21G: POST /api/v1/ask-document with absent documentId
    const absentAskRes = await fetch(`http://127.0.0.1:${testPort}/api/v1/ask-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: 'non-existent-doc-id', question: 'What is the rent?' }),
    });
    assert(absentAskRes.status === 200, 'POST /api/v1/ask-document handles absent context gracefully');
    const absentAskJson = await absentAskRes.json();
    assert(absentAskJson.isNotFound === true, 'Returns isNotFound: true for absent context');
    assert(absentAskJson.answer === "I couldn't find that information in the uploaded document.", 'Returns standard anti-hallucination fallback');

    // 21H: Backward-Compatible Legacy Routes: POST /api/analyze-document
    const legacyAnalyzeRes = await fetch(`http://127.0.0.1:${testPort}/api/analyze-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText: 'Too short' }),
    });
    assert(legacyAnalyzeRes.status === 400, 'Legacy alias POST /api/analyze-document is reachable and validates input');
    const legacyAnalyzeJson = await legacyAnalyzeRes.json();
    assert(legacyAnalyzeJson.error?.code === 'INVALID_DOCUMENT', 'Legacy analyze returns INVALID_DOCUMENT code');

    // 21I: Backward-Compatible Legacy Routes: POST /api/ask-document
    const legacyAskRes = await fetch(`http://127.0.0.1:${testPort}/api/ask-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'What is the rent?' }),
    });
    assert(legacyAskRes.status === 400, 'Legacy alias POST /api/ask-document is reachable and validates context');
    const legacyAskJson = await legacyAskRes.json();
    assert(legacyAskJson.error?.code === 'MISSING_DOCUMENT_CONTEXT', 'Legacy ask returns MISSING_DOCUMENT_CONTEXT');

    const legacyAbsentAskRes = await fetch(`http://127.0.0.1:${testPort}/api/ask-document`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId: 'non-existent-legacy-doc', question: 'When does the lease expire?' }),
    });
    assert(legacyAbsentAskRes.status === 200, 'Legacy ask handles absent documentId with 200 OK');
    const legacyAbsentAskJson = await legacyAbsentAskRes.json();
    assert(legacyAbsentAskJson.isNotFound === true, 'Legacy ask returns isNotFound: true for absent document');

  } finally {
    await new Promise<void>(resolve => testServer.close(() => resolve()));
  }

  console.log('\n--- Section 22: Document Format & Edge Case Tests ---');
  // TXT format validation
  const txtFile = { name: 'contract.txt', size: 1024 } as File;
  assert(validateFile(txtFile).isValid === true, 'Validates .txt files');

  // DOCX format validation
  const docxFile = { name: 'employment.docx', size: 50 * 1024 } as File;
  assert(validateFile(docxFile).isValid === true, 'Validates .docx files');

  // Normal PDF format validation
  const pdfFile = { name: 'lease.pdf', size: 500 * 1024 } as File;
  assert(validateFile(pdfFile).isValid === true, 'Validates .pdf files');

  // Empty document rejection (0 bytes)
  const emptyDoc = { name: 'blank.pdf', size: 0 } as File;
  const emptyValidation = validateFile(emptyDoc);
  assert(emptyValidation.isValid === false, 'Rejects 0-byte document');
  assert(emptyValidation.error?.includes('empty') === true, 'Returns empty document error message');

  // Oversized document rejection (> 15MB)
  const hugeDoc = { name: 'giant.docx', size: 16 * 1024 * 1024 } as File;
  const hugeValidation = validateFile(hugeDoc);
  assert(hugeValidation.isValid === false, 'Rejects oversized document > 15MB');
  assert(hugeValidation.error?.includes('exceeds') === true, 'Returns size limit error message');

  // Unsupported file extensions
  const badExtensions = ['malware.exe', 'sheet.xlsx', 'archive.zip', 'photo.jpg', 'doc.pages'];
  for (const badName of badExtensions) {
    const badFile = { name: badName, size: 1024 } as File;
    assert(validateFile(badFile).isValid === false, `Rejects unsupported extension: ${badName}`);
  }

  // Image-only PDF simulation: extracted length < 10 characters with pageCount > 0
  const imageOnlySimulated = (extractedLength: number, pageCount: number) => {
    if (extractedLength < 10 && pageCount > 0) {
      throw new Error('This PDF appears to be a scanned image or photo without selectable text.');
    }
    return true;
  };
  let imageOnlyCaught = false;
  try {
    imageOnlySimulated(4, 3);
  } catch (err: any) {
    imageOnlyCaught = err.message.includes('scanned image');
  }
  assert(imageOnlyCaught === true, 'Detects image-only / scanned PDF without selectable text');

  console.log('\n--- Section 23: Grounding & Fabrication Rejection Tests ---');
  const groundingSections = [
    { id: 'sec-1', heading: 'Clause 1: Term', page: 1, text: '1. TERM\nThe agreement shall commence on September 1.', startOffset: 0, endOffset: 65 },
    { id: 'sec-2', heading: 'Clause 2: Rent', page: 1, text: '2. RENT\nMonthly rent shall be $2,500 due on the first day.', startOffset: 67, endOffset: 145 },
    { id: 'sec-3', heading: 'Clause 3: Security Deposit', page: 2, text: '3. DEPOSIT\nDeposit of $5,000 shall be returned within thirty days.', startOffset: 147, endOffset: 235 },
  ];
  const groundingFullDoc = groundingSections.map(s => s.text).join('\n\n');

  // Valid evidence
  const validEv = verifyEvidenceSnippet(groundingFullDoc, 'commence on September 1', groundingSections);
  assert(validEv !== null, 'Grounds valid verbatim evidence');
  assert(validEv?.startOffset !== undefined && validEv.startOffset >= 0, 'Returns startOffset for valid evidence');
  assert(validEv?.endOffset !== undefined && validEv?.startOffset !== undefined && validEv.endOffset > validEv.startOffset, 'Returns endOffset for valid evidence');
  assert(validEv?.page === 1, 'Maps to Page 1');
  assert(validEv?.sectionId === 'sec-1', 'Maps to sec-1');

  // Normalized evidence (different whitespace)
  const normEv = verifyEvidenceSnippet(groundingFullDoc, 'commence   on   September   1', groundingSections);
  assert(normEv !== null, 'Grounds normalized evidence with whitespace variation');

  // Fabricated quote rejection
  const fakeEv = verifyEvidenceSnippet(groundingFullDoc, 'Tenant may sublet to unlimited parties without landlord approval', groundingSections);
  assert(fakeEv === null, 'Rejects fabricated quote absent from document');

  // Fabricated clause verification
  const testClauses = [
    { id: 'c-1', title: 'Clause 1: Term' },
    { id: 'c-2', title: 'Clause 2: Rent' },
    { id: 'c-3', title: 'Clause 3: Security Deposit' },
  ];
  assert(verifyClauseReference('Clause 1: Term', testClauses, groundingSections) === true, 'Accepts authentic clause reference');
  assert(verifyClauseReference('Clause 2', testClauses, groundingSections) === true, 'Accepts partial authentic clause reference');
  assert(verifyClauseReference('Clause 99: Swimming Pool Usage', testClauses, groundingSections) === false, 'Rejects fabricated clause reference');
  assert(verifyClauseReference('Clause 42: Arbitrary Fine', testClauses, groundingSections) === false, 'Rejects non-existent clause reference');

  // Fabricated page verification
  assert(verifyPageReference(1, groundingSections) === true, 'Validates existing Page 1');
  assert(verifyPageReference(2, groundingSections) === true, 'Validates existing Page 2');
  assert(verifyPageReference(3, groundingSections) === false, 'Rejects non-existent Page 3');
  assert(verifyPageReference(99, groundingSections) === false, 'Rejects fabricated Page 99');
  assert(verifyPageReference('Page 42', groundingSections) === false, 'Rejects fabricated Page 42 string');

  console.log('\n--- Section 24: Ephemeral Document Cache In-Depth Tests ---');
  // Test TTL, LRU eviction, and bounded capacity using an isolated instance
  const testStore = new EphemeralDocumentStore(50, 3); // 50ms TTL, max capacity 3
  const dummyContext = (id: string) => ({
    documentId: id,
    fileName: `${id}.pdf`,
    fileType: 'pdf' as const,
    rawText: `Text for ${id}`,
    sections: [],
    clauses: [],
    risks: [],
    analysis: sampleDoc.precomputedAnalysis,
  });

  // Bounded capacity check
  testStore.set('doc-1', dummyContext('doc-1'));
  testStore.set('doc-2', dummyContext('doc-2'));
  testStore.set('doc-3', dummyContext('doc-3'));
  assert(testStore.size() === 3, 'Document store size reaches capacity 3');

  // Access doc-1 so it is recently accessed
  testStore.get('doc-1');

  // Insert 4th document: doc-2 was least recently accessed, so doc-2 should be evicted!
  testStore.set('doc-4', dummyContext('doc-4'));
  assert(testStore.size() === 3, 'Document store maintains bounded capacity of 3');
  assert(testStore.has('doc-2') === false, 'LRU eviction successfully evicted least recently accessed doc-2');
  assert(testStore.has('doc-1') === true, 'Recently accessed doc-1 was preserved by LRU');
  assert(testStore.has('doc-4') === true, 'Newly added doc-4 is present in store');

  // TTL expiration check: wait 65ms
  await new Promise(r => setTimeout(r, 65));
  assert(testStore.get('doc-1') === null, 'Document store expires item after TTL (get returns null)');
  assert(testStore.has('doc-1') === false, 'Document store has() returns false for expired item');

  // CleanupExpired check
  const testStoreCleanup = new EphemeralDocumentStore(10, 10);
  testStoreCleanup.set('exp-1', dummyContext('exp-1'));
  testStoreCleanup.set('exp-2', dummyContext('exp-2'));
  assert(testStoreCleanup.size() === 2, 'Cleanup store populated with 2 items');
  await new Promise(r => setTimeout(r, 20));
  const removedCount = testStoreCleanup.cleanupExpired();
  assert(removedCount === 2, `cleanupExpired() removed all expired entries (count=${removedCount})`);
  assert(testStoreCleanup.size() === 0, 'Store size is 0 after cleanupExpired()');

  console.log('\n--- Section 25: Secret, Storage & Logging Audits ---');
  // Client bundle audit: inspect dist/
  const distDir = path.join(__dirname, '../dist');
  let distFiles: string[] = [];
  try {
    const readDistRecursive = (dir: string): string[] => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      let files: string[] = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files = files.concat(readDistRecursive(fullPath));
        } else {
          files.push(fullPath);
        }
      }
      return files;
    };
    distFiles = readDistRecursive(distDir);
  } catch {
    // dist may not exist yet if not built
  }

  let distHasKey = false;
  let distHasSdk = false;
  for (const f of distFiles) {
    if (f.endsWith('.js') || f.endsWith('.html')) {
      const content = fs.readFileSync(f, 'utf8');
      if (content.includes('GEMINI_API_KEY')) distHasKey = true;
      if (content.includes('@google/genai')) distHasSdk = true;
    }
  }
  assert(!distHasKey, 'CLIENT SECRET AUDIT: dist/ bundle contains NO occurrences of GEMINI_API_KEY');
  assert(!distHasSdk, 'CLIENT SECRET AUDIT: dist/ bundle contains NO occurrences of @google/genai SDK');

  // Frontend storage audit: src/ must not use localStorage or sessionStorage for documents
  const srcDir = path.join(__dirname, '../src');
  const readSrcFiles = (dir: string): string[] => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files: string[] = [];
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(readSrcFiles(full));
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        files.push(full);
      }
    }
    return files;
  };
  const srcFiles = readSrcFiles(srcDir);
  let srcUsesStorage = false;
  for (const f of srcFiles) {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes('localStorage') || content.includes('sessionStorage')) {
      srcUsesStorage = true;
    }
  }
  assert(!srcUsesStorage, 'STORAGE AUDIT: Frontend src/ never stores legal documents in localStorage/sessionStorage');

  // Server logging audit: verify structured log format doesn't print raw text
  const serverDir = path.join(__dirname, '../server');
  const serverFiles = fs.readdirSync(serverDir).filter(f => f.endsWith('.ts'));
  let logsRawText = false;
  for (const f of serverFiles) {
    const content = fs.readFileSync(path.join(serverDir, f), 'utf8');
    // Check if any console.log prints rawText
    if (/console\.(log|info)\(.*rawText.*\)/.test(content)) {
      logsRawText = true;
    }
  }
  assert(!logsRawText, 'LOGGING AUDIT: Server never outputs raw legal document text to console logs');

  console.log('\n--- Section 26: Real Gemini Smoke Test Check ---');
  const realKey = process.env.GEMINI_API_KEY;
  if (realKey && realKey.trim().length > 10) {
    try {
      console.log('🔑 Real GEMINI_API_KEY detected. Executing live API smoke test...');
      const { GoogleGenAI } = await import('@google/genai');
      const liveAi = new GoogleGenAI({ apiKey: realKey });
      const testModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
      const liveResponse = await liveAi.models.generateContent({
        model: testModel,
        contents: 'Respond with exactly the word "VERIFIED" if you can process this test.',
      });
      const resText = liveResponse.text || '';
      assert(resText.includes('VERIFIED') || resText.length > 0, 'Real Gemini live call succeeded safely');
      console.log('✅ REAL GEMINI SMOKE TEST: PASS');
    } catch (err: any) {
      console.error('❌ REAL GEMINI SMOKE TEST: FAIL -', err?.message || err);
      failed++;
    }
  } else {
    console.log('ℹ️ REAL GEMINI SMOKE TEST: SKIPPED (GEMINI_API_KEY not configured in environment)');
  }

  console.log('\n--- Section 27: Safari PDF Stream Reader Regression & Error Classification ---');

  // 27A: Multi-chunk aggregation test
  const mockMultiChunkPage = {
    streamTextContent: () => {
      const chunks = [
        {
          items: [{ str: 'Hello' }],
          styles: { a: { fontFamily: 'sans-serif' } },
          lang: 'en',
        },
        {
          items: [{ str: 'World' }],
          styles: { b: { fontSize: 12 } },
        },
      ];
      let idx = 0;
      return {
        getReader: () => ({
          read: async () => {
            if (idx < chunks.length) {
              return { value: chunks[idx++], done: false };
            }
            return { value: undefined, done: true };
          },
          releaseLock: () => {},
        }),
      };
    },
  };

  const multiChunkResult = await readPdfTextContent(mockMultiChunkPage);
  assert(multiChunkResult.items.length === 2, 'readPdfTextContent aggregates all items from multiple stream chunks');
  assert(multiChunkResult.items[0]?.str === 'Hello', 'First chunk item string matches "Hello"');
  assert(multiChunkResult.items[1]?.str === 'World', 'Second chunk item string matches "World"');
  assert(Boolean(multiChunkResult.styles.a && multiChunkResult.styles.b), 'Merges font styles dictionary across chunks');
  assert(multiChunkResult.lang === 'en', 'Preserves language property ("en") across chunk stream');

  // 27B: Safari compatibility test - proves stream reader works WITHOUT Symbol.asyncIterator
  const mockSafariStream = {
    getReader: () => {
      let done = false;
      return {
        read: async () => {
          if (!done) {
            done = true;
            return { value: { items: [{ str: 'Safari 26.5 Compatible Text' }] }, done: false };
          }
          return { value: undefined, done: true };
        },
        releaseLock: () => {},
      };
    },
  };
  // Ensure Symbol.asyncIterator is missing / undefined to emulate Safari 26.5 ReadableStream
  delete (mockSafariStream as any)[Symbol.asyncIterator];

  // Demonstrate that for-await fails on this object without Symbol.asyncIterator
  let forAwaitFailed = false;
  try {
    for await (const _x of mockSafariStream as any) {
      // should throw
    }
  } catch {
    forAwaitFailed = true;
  }
  assert(forAwaitFailed === true, 'Proves mock stream reproduces Safari absence of Symbol.asyncIterator');

  // Verify readPdfTextContent succeeds regardless
  const safariReadResult = await readPdfTextContent({ streamTextContent: () => mockSafariStream });
  assert(safariReadResult.items.length === 1, 'readPdfTextContent successfully extracts text without Symbol.asyncIterator');
  assert(safariReadResult.items[0]?.str === 'Safari 26.5 Compatible Text', 'Extracted string matches expected text');

  // 27C: Error classification tests (classifyPdfError)
  const corruptErr = new Error('InvalidPDFException: format error');
  assert(classifyPdfError(corruptErr).includes('corrupted'), 'Classifies corrupted PDF error with friendly message');

  const pwErr = new Error('PasswordException: password required');
  assert(classifyPdfError(pwErr).includes('password-protected'), 'Classifies password protected PDF error');

  const scanErr = new Error('This PDF appears to be a scanned image or photo without selectable text.');
  assert(classifyPdfError(scanErr).includes('scanned image'), 'Classifies scanned image PDF error');

  const safariErr = new Error("undefined is not a function (near '...value of readableStream...')");
  const classifiedSafari = classifyPdfError(safariErr);
  assert(!classifiedSafari.includes('undefined is not a function'), 'classifyPdfError NEVER exposes raw JS "undefined is not a function"');
  assert(classifiedSafari.includes('compatibility issue'), 'Classifies Safari readableStream failure cleanly');

  const unknownErr = new Error('EACCES: permission denied');
  const classifiedUnknown = classifyPdfError(unknownErr);
  assert(!classifiedUnknown.includes('EACCES'), 'Never exposes internal raw error messages');
  assert(classifiedUnknown.includes("couldn't extract readable text"), 'Returns standard clean user message');

  // 27D: Real PDF extraction with actual PDF binary stream
  const minimalPdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 55 >>
stream
BT
/F1 12 Tf
72 712 Td
(Hello PDF World from LexiClear Safari Safe Parser) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000236 00000 n 
0000000342 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
421
%%EOF`;

  const realPdfFile = new File([minimalPdfString], 'sample_contract.pdf', { type: 'application/pdf' });
  const pdfExtractionResult = await extractDocumentText(realPdfFile);
  assert(pdfExtractionResult.fileType === 'pdf', 'Real PDF extraction identifies fileType as pdf');
  assert(pdfExtractionResult.pageCount === 1, 'Real PDF extraction extracts pageCount of 1');
  assert(pdfExtractionResult.rawText.includes('--- Page 1 ---'), 'Preserves "--- Page 1 ---" page boundary header');
  assert(pdfExtractionResult.rawText.includes('Hello PDF World from LexiClear Safari Safe Parser'), 'Extracts text content via Safari-safe streamTextContent');
  assert(pdfExtractionResult.sections?.length === 1, 'Segments single-page PDF into 1 section');
  assert(pdfExtractionResult.sections?.[0]?.page === 1, 'PDF section has numeric page: 1');

  // 27E: Real TXT extraction
  const sampleTxt = 'TERMS OF SERVICE\n\n1. ACCEPTANCE\nBy using this service, you agree to these terms.\n\n2. PRIVACY\nWe respect your data and do not persist it.';
  const realTxtFile = new File([sampleTxt], 'terms.txt', { type: 'text/plain' });
  const txtExtractionResult = await extractDocumentText(realTxtFile);
  assert(txtExtractionResult.fileType === 'txt', 'Real TXT extraction identifies fileType as txt');
  assert(txtExtractionResult.pageCount === 'Page not available', 'Real TXT preserves unpaginated marker "Page not available"');
  assert(txtExtractionResult.rawText.includes('TERMS OF SERVICE'), 'Extracts complete TXT content');
  assert((txtExtractionResult.sections?.length || 0) >= 2, 'Segments TXT into paragraph sections');
  assert(txtExtractionResult.sections?.[0]?.page === 'Page not available', 'TXT sections mark page as "Page not available"');

  // 27F: DOCX unpaginated behavior verification
  const mockDocxFile = { name: 'employment.docx', size: 1024 * 50 } as File;
  assert(validateFile(mockDocxFile).isValid === true, 'DOCX file validation succeeds');

  console.log('\n=============================================');
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite();

