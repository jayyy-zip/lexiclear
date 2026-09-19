import { validateFile, normalizeExtractedText } from '../src/services/parser';
import {
  calculateCompositeHealthScore,
  getScoreStatus,
  getDimensionStatus,
  buildLegalHealthScore,
  normalizeEvidenceStrength
} from '../src/services/riskEngine';
import { SAMPLE_DOCUMENTS } from '../src/data/sampleDocuments';
import { generateIcsContent } from '../src/utils/icsExporter';

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

  // Test 1: File Validation - Valid Extensions
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
  // Expected: 70*0.2 + 80*0.15 + 60*0.25 + 65*0.15 + 70*0.15 + 75*0.10
  // = 14 + 12 + 15 + 9.75 + 10.5 + 7.5 = 68.75 -> 69
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

  console.log('\n=============================================');
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
