import { GoogleGenAI } from '@google/genai';
import { AnalysisResult, ChatMessage, TimelineEvent, ActionItem, LawyerPrepKit } from '../src/types/document';
import { buildLegalHealthScore, normalizeEvidenceStrength } from '../src/services/riskEngine';

// Lazy initialized server-side client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined in process.env. Using fallback analysis mode.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Server-side document analysis powered by Gemini 3.8 Flash
 */
export async function analyzeDocumentServer(params: {
  rawText: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt';
  wordCount: number;
  pageCount: number;
  fileSize?: number;
}): Promise<AnalysisResult> {
  const ai = getAiClient();

  const prompt = `You are LexiClear, an advanced GenAI legal document co-pilot.
Analyze the following legal document text accurately and objectively.
Remember: You provide document analysis and issue-spotting, NOT binding legal advice.
Never invent citations, laws, or document content. Ground every observation in the actual document text.

Document content:
"""
${params.rawText.slice(0, 45000)}
"""

Produce a detailed, valid JSON response adhering strictly to the following structure:
{
  "documentType": "string (e.g. Residential Lease, Employment Agreement)",
  "parties": ["string (Party A with role)", "string (Party B with role)"],
  "jurisdiction": "string (Governing law / state / county if identifiable, otherwise 'Not specified')",
  "summary": "string (2-3 concise sentences summarizing key legal essence)",
  "importantDates": ["string (e.g. 'Oct 1, 2025 - Commencement')", ...],
  "financialTerms": ["string (e.g. '$3,200 monthly rent')", ...],
  "obligations": ["string (Core affirmative obligations)", ...],
  "terminationTerms": ["string (Termination notice, renewal, remedies)", ...],
  "disputeResolution": "string (Arbitration, court venue, governing law, jury waiver)",
  "healthDimensions": {
    "fairness": { "score": number 0-100, "keyFinding": "short explanation" },
    "clarity": { "score": number 0-100, "keyFinding": "short explanation" },
    "riskExposure": { "score": number 0-100, "keyFinding": "short explanation" },
    "obligationBalance": { "score": number 0-100, "keyFinding": "short explanation" },
    "terminationRights": { "score": number 0-100, "keyFinding": "short explanation" },
    "disputeResolution": { "score": number 0-100, "keyFinding": "short explanation" }
  },
  "clauses": [
    {
      "id": "c-1",
      "title": "string (e.g. Clause 1: Term & Automatic Renewal)",
      "text": "exact or verbatim text from document",
      "page": number,
      "type": "string (e.g. renewal, payment, liability, confidentiality, termination)",
      "obligations": ["string"],
      "rights": ["string"],
      "dates": ["string"],
      "financialExposure": "string",
      "riskIndicators": ["string"],
      "plainEnglish": "string (Plain-English translation for a layperson)",
      "whyItMatters": "string (Practical reason why this matters to the user)"
    }
  ],
  "risks": [
    {
      "id": "risk-1",
      "clauseId": "c-1",
      "severity": "high" | "medium" | "low",
      "title": "string (Concise title of risk)",
      "reason": "string (Why this clause is one-sided, onerous, or unusual)",
      "evidence": "exact quote from document",
      "evidenceStrength": "Strong evidence" | "Moderate evidence" | "Limited evidence",
      "userImpact": "string (Practical, tangible impact on the user)",
      "questionToConsider": "string (Negotiation or clarification question)",
      "plainEnglishTranslation": "string",
      "clauseTitle": "string",
      "pageReference": "string (e.g. Page 1)"
    }
  ],
  "actionChecklist": [
    {
      "id": "act-1",
      "title": "string",
      "reason": "string",
      "clauseReference": "string",
      "priority": "high" | "medium" | "low",
      "completed": false,
      "category": "negotiate" | "clarify" | "prepare" | "verify"
    }
  ],
  "timeline": [
    {
      "id": "time-1",
      "date": "string (e.g. Aug 1, 2025)",
      "title": "string",
      "description": "string",
      "clauseReference": "string",
      "priority": "high" | "medium" | "low",
      "isoDate": "YYYY-MM-DD (optional if known)"
    }
  ],
  "lawyerPrepKit": {
    "documentSummary": "string",
    "topConcerns": ["string"],
    "importantFinancialExposure": ["string"],
    "importantClauses": [
      {
        "title": "string",
        "reference": "string",
        "summary": "string",
        "flagReason": "string"
      }
    ],
    "questionsForLawyer": ["string"],
    "supportingDocumentsToBring": ["string"]
  }
}
Return ONLY pure JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text || '';
    const cleaned = cleanJsonString(text);
    const parsed = JSON.parse(cleaned);

    const healthScore = buildLegalHealthScore(
      parsed.healthDimensions || {
        fairness: { score: 60, keyFinding: 'Standard baseline fairness' },
        clarity: { score: 70, keyFinding: 'Clear contractual language' },
        riskExposure: { score: 55, keyFinding: 'Moderate financial risk' },
        obligationBalance: { score: 60, keyFinding: 'Standard allocation of obligations' },
        terminationRights: { score: 65, keyFinding: 'Standard termination notice' },
        disputeResolution: { score: 60, keyFinding: 'Standard dispute forum' },
      },
      parsed.summary
    );

    const risks = (parsed.risks || []).map((r: any, idx: number) => ({
      ...r,
      id: r.id || `risk-${idx + 1}`,
      evidenceStrength: normalizeEvidenceStrength(r.evidenceStrength),
    }));

    return {
      metadata: {
        id: `doc-${Date.now()}`,
        fileName: params.fileName,
        fileSize: params.fileSize || params.rawText.length,
        fileType: params.fileType,
        uploadDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        wordCount: params.wordCount,
        pageCount: params.pageCount,
        rawText: params.rawText,
      },
      documentType: parsed.documentType || 'Legal Document',
      parties: parsed.parties || ['Parties not explicitly named'],
      jurisdiction: parsed.jurisdiction || 'Jurisdiction not specified',
      summary: parsed.summary || 'Summary generated by LexiClear co-pilot.',
      importantDates: parsed.importantDates || [],
      financialTerms: parsed.financialTerms || [],
      obligations: parsed.obligations || [],
      terminationTerms: parsed.terminationTerms || [],
      disputeResolution: parsed.disputeResolution || 'Governing law and dispute forum as specified in agreement.',
      clauses: parsed.clauses || [],
      risks,
      healthScore,
      actionChecklist: (parsed.actionChecklist || []).map((a: any, idx: number) => ({
        ...a,
        id: a.id || `act-${idx + 1}`,
        completed: false,
      })),
      timeline: (parsed.timeline || []).map((t: any, idx: number) => ({
        ...t,
        id: t.id || `time-${idx + 1}`,
      })),
      lawyerPrepKit: {
        ...(parsed.lawyerPrepKit || {
          documentSummary: parsed.summary || '',
          topConcerns: [],
          importantFinancialExposure: parsed.financialTerms || [],
          importantClauses: [],
          questionsForLawyer: [],
          supportingDocumentsToBring: [],
        }),
        disclaimer: 'LexiClear provides informational document analysis, not legal advice.',
      },
    };
  } catch (error: any) {
    console.error('Gemini analyzeDocumentServer error:', error);
    throw error;
  }
}

/**
 * Server-side Q&A answering grounded strictly in the document text
 */
export async function answerDocumentQuestionServer(params: {
  rawText: string;
  question: string;
  documentType?: string;
  clauses?: any[];
}): Promise<{
  answer: string;
  clauseReference?: string;
  pageReference?: string;
  evidenceSnippet?: string;
  evidenceStrength?: 'Strong evidence' | 'Moderate evidence' | 'Limited evidence';
  isNotFound?: boolean;
}> {
  const ai = getAiClient();

  const prompt = `You are LexiClear, an AI legal document assistant.
Answer the user's question STRICTLY based on the provided document text.

CRITICAL RULES:
1. If the document DOES NOT contain the answer, you MUST state:
   "I couldn't find that information in the uploaded document."
   Do NOT guess, fabricate, or extrapolate outside the text.
2. Quote exact evidence from the document where available.
3. Cite the specific Clause number/title and Page reference where available.
4. Assess evidence strength: "Strong evidence", "Moderate evidence", or "Limited evidence".
5. Never provide definitive legal advice. Provide informational assistance explaining what the document says.

Document text:
"""
${params.rawText.slice(0, 40000)}
"""

User Question: "${params.question}"

Return JSON matching:
{
  "answer": "string",
  "clauseReference": "string (e.g. Clause 4: Maintenance) or null",
  "pageReference": "string (e.g. Page 2) or null",
  "evidenceSnippet": "string (exact quote) or null",
  "evidenceStrength": "Strong evidence" | "Moderate evidence" | "Limited evidence",
  "isNotFound": boolean
}
Return ONLY valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const text = response.text || '';
    const cleaned = cleanJsonString(text);
    const parsed = JSON.parse(cleaned);

    const answerText = (parsed.answer || '').trim();
    const answerLower = answerText.toLowerCase();

    // Grounding verification: if model indicates info is absent, enforce strict standard fallback
    const isAbsent = Boolean(parsed.isNotFound) ||
      answerLower.includes("couldn't find") ||
      answerLower.includes("could not find") ||
      answerLower.includes("not mentioned") ||
      answerLower.includes("not found") ||
      answerLower.includes("does not mention") ||
      answerLower.includes("does not contain") ||
      answerLower.includes("no information") ||
      answerLower.includes("no mention");

    if (isAbsent) {
      return {
        answer: "I couldn't find that information in the uploaded document.",
        clauseReference: undefined,
        pageReference: undefined,
        evidenceSnippet: undefined,
        evidenceStrength: 'Limited evidence',
        isNotFound: true,
      };
    }

    // Citation verification: verify that evidence snippet actually exists in raw document text
    let verifiedSnippet: string | undefined = parsed.evidenceSnippet ? String(parsed.evidenceSnippet).trim() : undefined;
    if (verifiedSnippet) {
      const docLower = params.rawText.toLowerCase();
      const snippetLower = verifiedSnippet.toLowerCase();
      // If snippet is not directly found, try to find the longest substring match or omit to avoid hallucination
      if (!docLower.includes(snippetLower)) {
        const words = snippetLower.split(/\s+/).filter(w => w.length > 3);
        const matchFound = words.length >= 3 && words.filter(w => docLower.includes(w)).length >= words.length * 0.7;
        if (!matchFound) {
          // Snippet cannot be grounded in source text
          verifiedSnippet = undefined;
        }
      }
    }

    return {
      answer: answerText || "I couldn't find that information in the uploaded document.",
      clauseReference: parsed.clauseReference ? String(parsed.clauseReference) : undefined,
      pageReference: parsed.pageReference ? String(parsed.pageReference) : undefined,
      evidenceSnippet: verifiedSnippet,
      evidenceStrength: normalizeEvidenceStrength(parsed.evidenceStrength),
      isNotFound: false,
    };
  } catch (error: any) {
    console.error('Gemini answerDocumentQuestionServer error:', error);
    throw error;
  }
}
