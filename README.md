# LexiClear

> A GenAI legal document co-pilot that helps individuals and teams understand complex contracts, spot silent risks, ask grounded questions, and prepare practical next steps for legal consultation.

---

## Problem

Standard commercial and consumer contracts—from apartment leases and employment agreements to service notes and vendor terms—are dense, asymmetrical, and difficult for non-lawyers to evaluate. Traditional legal reviews are slow and expensive, while generic AI chatbots frequently hallucinate legal citations, fabricate clause numbers, and fail to provide exact quotes from the uploaded contract text.

## Solution

LexiClear acts as an informational document co-pilot. It combines local document extraction, structured GenAI analysis via Google Gemini, strict substring and token offset verification, and deterministic rule-based scoring to deliver:
1. Transparent, reproducible document screening.
2. Verified clause citations linked directly to verbatim contract text.
3. Strict anti-hallucination Q&A that refuses to speculate when information is absent.
4. Actionable preparation kits for reviewing with qualified legal counsel.

---

## Core Features

- **Document Extraction & Normalization**: Native browser/server parsing for PDF, DOCX, and TXT files, preserving headings, page boundaries, and section offsets without fabricating page numbers.
- **Legal Health Screen**: An informational screening index across 6 core weighted dimensions: Risk Exposure (25%), Fairness (20%), Obligation Balance (15%), Termination Rights (15%), Clarity (15%), and Dispute Resolution (10%).
- **Silent Risk Radar**: Spotlights unilateral indemnities, automatic renewals, penalty clauses, and liabilities with quoted evidence.
- **Clause X-Ray**: Side-by-side view with plain-English translation, practical impact ("Why It Matters"), questions to consider, and exact source offsets.
- **Ask the Document**: Grounded Q&A assistant powered by server-side Gemini. Returns verbatim quoted evidence and explicit source locations, or returns *"I couldn't find that information in the uploaded document."* when topics are not covered.
- **Action Checklist**: Categorized action items (negotiate, clarify, prepare, verify, deadline) with interactive completion tracking.
- **Timeline & Calendar Export**: Chronological extraction of critical deadlines with one-click `.ics` calendar file generation.
- **Lawyer Prep Kit**: Structured consultation summary highlighting top concerns, financial exposure, and targeted questions to bring to a licensed attorney.
- **Deterministic Demo Mode**: Interactive offline sample agreements (Residential Lease, Executive Employment, Commercial Note) enabling instant evaluation without requiring live API keys.

---

## Architecture

```text
                    ┌─────────────────────────┐
                    │  React 19 + Vite UI     │
                    └────────────┬────────────┘
                                 │ Typed API Client
                                 │ (Zero Gemini SDK/Keys in bundle)
                    ┌────────────▼────────────┐
                    │    Express API Server   │
                    │  /api/v1/*              │
                    │  rate limiting          │
                    │  request IDs            │
                    │  security headers       │
                    │  Zod validation         │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
        Document Store    Gemini Service     Grounding Verifier
        (Ephemeral TTL)          │           (Offsets & Sections)
                                 │                  │
                         Structured JSON            │
                                 │                  │
              └──────────────────┼──────────────────┘
                                 │
                     Deterministic Risk Engine
                     (Local algorithmic scoring)
                                 │
                     Validated Result Envelope
                                 │
                    ┌────────────▼────────────┐
                    │  React State Store      │
                    │  (Finite Status FSM)    │
                    └─────────────────────────┘
```

### Critical Security Boundaries
- **Server-Side AI Isolation**: The Gemini SDK and `GEMINI_API_KEY` reside exclusively on the server. The client bundle contains zero references to the AI API key.
- **Untrusted Document Defense**: Document contents are treated strictly as untrusted passive data wrapped in boundary tags (`<DOCUMENT_CONTENT>`). System instructions explicitly instruct the model to ignore any embedded prompt injection attempts or adversarial commands.
- **Ephemeral Document Lifecycle**: Documents are stored in bounded, in-memory cache with TTL and automatic eviction. The application does not use a persistent database or third-party storage.

---

## AI Safety & Grounding Protocol

1. **Exact & Normalized Verification**: Every citation and evidence snippet returned by AI is verified against the source text using deterministic substring and whitespace alignment. Loose 70% fuzzy matching is strictly rejected.
2. **Source Location Mapping**: Verified quotes return precise character offsets (`startOffset`, `endOffset`), `sectionId`, and `page` references.
3. **Absence Fallback**: For document queries concerning unmentioned subjects, the system returns:
   > *"I couldn't find that information in the uploaded document."*
4. **Local Deterministic Scoring**: AI spots potential clauses and evidence; local deterministic code normalizes severity, deduplicates findings, applies algorithmic downward pressure, and computes the composite score.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Motion
- **Document Parsing**: pdfjs-dist, Mammoth, custom text normalizer
- **Backend**: Express 4, tsx, Node.js (v20+)
- **AI Integration**: `@google/genai` (Google GenAI SDK), Gemini 3.8 Flash (configurable via `GEMINI_MODEL`)
- **Validation**: Zod (runtime type and schema validation)
- **Testing**: Custom automated test suite covering parser, risk engine, grounding verifier, and Express API integration

---

## Project Structure

```text
lexiclear/
├── dist/                         # Static production build output
├── server/
│   ├── api.ts                   # Versioned Express routes (/api/v1/*)
│   ├── geminiService.ts         # Server-side Gemini service & Zod validation
│   ├── documentStore.ts         # In-memory ephemeral document store (TTL)
│   ├── documentChunker.ts       # Section segmentation & coverage metrics
│   ├── groundingVerifier.ts     # Deterministic quote verification & offsets
│   ├── middleware/
│   │   └── security.ts          # Request IDs, rate limiter, security headers
│   └── prompts/
│       ├── analysisPrompt.ts    # Prompt injection defense & analysis instructions
│       └── qaPrompt.ts          # Grounded Q&A prompt template
├── src/
│   ├── components/              # UI components (Overview, X-Ray, Chat, etc.)
│   ├── data/
│   │   └── sampleDocuments.ts   # Deterministic demo contracts
│   ├── services/
│   │   ├── apiClient.ts         # Typed frontend HTTP client
│   │   ├── documentContext.ts   # Finite state management & store
│   │   ├── parser.ts            # Local file parsing & normalization
│   │   ├── riskEngine.ts        # Deterministic scoring & deduplication
│   │   └── gemini.ts            # Client facade delegating to apiClient
│   ├── types/
│   │   ├── api.ts               # API response and envelope types
│   │   ├── document.ts          # Document domain interfaces
│   │   └── schemas.ts           # Shared Zod schemas & inferred types
│   ├── utils/
│   │   └── icsExporter.ts       # Calendar export generator
│   ├── App.tsx                  # Main layout & navigation
│   └── main.tsx                 # React entry point
├── tests/
│   └── runTests.ts              # Unit and API integration test suite
├── package.json
├── server.ts                    # Production Express entry point
├── tsconfig.json
└── vite.config.ts
```

---

## Local Development

### Prerequisites
- Node.js (v20 or newer recommended)
- npm (v9 or newer)

### Installation
```bash
git clone <repository-url>
cd lexiclear
npm install
```

### Environment Configuration
Copy the example configuration:
```bash
cp .env.example .env
```
Set your Google Gemini API key:
```env
GEMINI_API_KEY="your_api_key_here"
PORT=3000
GEMINI_MODEL="gemini-3.8-flash"
```

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port for the Express server | `3000` |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `production` |
| `GEMINI_API_KEY` | Google GenAI API key for live analysis | `""` |
| `GEMINI_MODEL` | Gemini model name | `gemini-3.8-flash` |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting sliding window in milliseconds | `60000` (1 min) |
| `RATE_LIMIT_MAX_ANALYZE` | Max analyze requests per window per IP | `20` |
| `RATE_LIMIT_MAX_QA` | Max Q&A requests per window per IP | `60` |

---

## Backend API

All endpoints require JSON payloads and return structured responses with an `X-Request-ID` header.

### Endpoints

#### `GET /api/health`
Returns service health status without leaking secrets.
```json
{
  "status": "ok",
  "service": "lexiclear-api",
  "version": "1.0.0"
}
```

#### `GET /api/ready`
Readiness probe for deployment orchestrators.
```json
{
  "ready": true,
  "service": "lexiclear-api"
}
```

#### `POST /api/v1/analyze-document`
Analyzes document text, detects clauses and silent risks, verifies grounding, and computes the Legal Health Score.
- **Request Body**:
  ```json
  {
    "rawText": "Full text of the legal contract...",
    "fileName": "Contract.pdf",
    "fileType": "pdf",
    "wordCount": 1200,
    "pageCount": 4
  }
  ```
- **Response**: Full `AnalysisResult` object with `documentId`.

#### `POST /api/v1/ask-document`
Answers questions strictly grounded in the document context.
- **Request Body**:
  ```json
  {
    "documentId": "doc-1726743900000-xyz",
    "question": "What is the penalty for late rent?"
  }
  ```
- **Response**:
  ```json
  {
    "answer": "If rent is not received by the third day, a late fee of $250 is assessed...",
    "clauseReference": "Clause 2: Rent & Late Fees",
    "pageReference": "Page 1",
    "evidenceSnippet": "Tenant shall incur a late charge of $250.00...",
    "evidenceStrength": "Strong evidence",
    "isNotFound": false,
    "sourceLocation": {
      "quote": "Tenant shall incur a late charge of $250.00...",
      "startOffset": 1240,
      "endOffset": 1285,
      "page": 1
    }
  }
  ```

---

## Testing

Run the full automated test suite (including unit tests for parser, chunker, risk engine, and Express API integration tests):
```bash
npm test
```

Run TypeScript static type checks:
```bash
npm run lint
```

---

## Deployment

LexiClear is designed to deploy as **a single full-stack Node service** (e.g. Google Cloud Run, Render, Railway, AWS App Runner).

1. Build static production client:
   ```bash
   npm run build
   ```
2. Start the production Express server:
   ```bash
   npm start
   ```

The Express server binds to `0.0.0.0`, listens on `process.env.PORT`, serves `/api/v1/*` routes, and statically serves the compiled Vite assets from `dist/` with single-page application (SPA) wildcard fallback.

---

## Privacy Notice

Your uploaded contracts are processed ephemerally in active server memory for the duration of the analysis session. LexiClear does not intentionally persist uploaded documents to disk or databases after the session terminates.

---

## Legal Disclaimer

**LexiClear provides informational document analysis and issue spotting, not legal advice.**

The findings, screening scores, and summaries generated by LexiClear are designed exclusively to highlight clauses and provisions that may deserve closer review. LexiClear does not provide formal legal opinions, establish an attorney-client relationship, or guarantee contractual enforceability. Always consult with a qualified attorney licensed in your jurisdiction for binding legal counsel.
