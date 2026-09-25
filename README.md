# LexiClear — The Legal Document Co-Pilot

> An AI-powered legal document co-pilot that helps individuals and teams understand complex contracts, spot silent risks, ask grounded questions, and prepare practical next steps for legal consultation.

[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg)](https://react.dev/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## Overview

Standard commercial and consumer contracts—from residential leases and executive employment agreements to service notes and vendor terms—are dense, asymmetrical, and difficult for non-lawyers to evaluate. Generic AI chatbots frequently hallucinate legal citations, fabricate clause numbers, and fail to provide exact quotes from the uploaded contract text.

**LexiClear** solves this by combining client-side document extraction, structured GenAI analysis via Google Gemini, strict substring and token offset verification, and deterministic rule-based scoring to deliver:
1. **Transparent, reproducible document screening** without hidden algorithmic bias.
2. **Verified clause citations** linked directly to verbatim contract text with start/end character offsets.
3. **Strict anti-hallucination Q&A** that refuses to speculate when information is absent.
4. **Actionable preparation kits** designed for reviewing with licensed legal counsel.
5. **Vercel-native serverless architecture** that is fast, resilient, and respects platform payload limits.

---

## Core Features

- **Document Extraction & Normalization**: Native browser-first parsing for PDF, DOCX, and TXT files, preserving headings, page boundaries, and section offsets.
- **Safari-Hardened PDF Parsing**: Uses `streamTextContent().getReader().read()` and a matched local worker (`/pdf.worker.min.mjs`) for robust compatibility across iOS Safari, macOS Safari, Chrome, Edge, and Firefox.
- **Legal Health Screen**: An informational screening index across 6 core weighted dimensions: Risk Exposure (25%), Fairness (20%), Obligation Balance (15%), Termination Rights (15%), Clarity (15%), and Dispute Resolution (10%).
- **Silent Risk Radar**: Spotlights unilateral indemnities, automatic renewals, penalty clauses, and liabilities with quoted evidence.
- **Clause X-Ray**: Side-by-side view with plain-English translation, practical impact ("Why It Matters"), questions to consider, and exact source offsets.
- **Ask the Document**: Grounded Q&A assistant powered by server-side Gemini. Returns verbatim quoted evidence and explicit source locations, or returns *"I couldn't find that information in the uploaded document."* when topics are not covered.
- **Stateless Serverless Fallback**: Sends ranked document section context with queries so Q&A never breaks when serverless function instances scale or recycle.
- **Action Checklist**: Categorized action items (negotiate, clarify, prepare, verify, deadline) with interactive completion tracking.
- **Timeline & Calendar Export**: Chronological extraction of critical deadlines with one-click `.ics` calendar file generation.
- **Lawyer Prep Kit**: Structured consultation summary highlighting top concerns, financial exposure, and targeted questions to bring to a licensed attorney.
- **Deterministic Offline Demo**: Interactive sample agreements (Residential Lease, Executive Employment, Commercial Note) enabling instant evaluation without requiring live API keys.

---

## Target Deployment Architecture

LexiClear is structured for **single-deployment hosting on Vercel** (or local Node development) combining static Vite assets and Vercel Node Serverless Functions.

```text
                                  VERCEL
                                    │
               ┌────────────────────┴────────────────────┐
               │                                         │
          React 19 / Vite                          Vercel Functions
           Static Assets                          Node 22 / Express
           (dist/ folder)                            (api/index.ts)
               │                                         │
               │ /pdf.worker.min.mjs                     │ /api/v1/*
               │                                         │
               └────────────────────┬────────────────────┘
                                    │
                              Google Gemini
                            (GEMINI_API_KEY)
```

### Architectural Highlights

1. **Unified Application Architecture**:
   - `server/app.ts`: Defines the Express application, security headers, rate limiting, and API routes.
   - `server.ts`: Local server entrypoint that mounts `app.listen()` for `npm start`.
   - `api/index.ts`: Production Vercel Serverless Function entrypoint exporting `app` with `maxDuration: 60`.
2. **Payload Protection (< 4.5 MB Vercel Limit)**:
   - Raw documents are parsed locally in the browser into structured sections.
   - Large documents are chunked into safe batches (<= 40,000 characters) and sent via `POST /api/v1/analyze-chunk`.
   - The final analysis is assembled and scored deterministically via `POST /api/v1/finalize-analysis`.
   - Standard requests remain well under 1.5–2 MB.
3. **Response Payload Protection**:
   - The backend never mirrors the entire original raw document text back to the client. Responses contain only structured metadata, clauses, risks, scores, and evidence coordinates.
4. **Stateless Serverless Q&A**:
   - Vercel serverless function instances are ephemeral and do not share in-memory state.
   - The browser ranks and selects the most relevant sections locally (`relevantSections`, <= 25 KB) and provides them with the query to `POST /api/v1/ask-document`.
   - The backend grounds its answer against the provided context, guaranteeing reliable Q&A even on cold starts or across separate function instances.
5. **Ephemeral Security Model**:
   - Zero database, Redis, or permanent disk storage dependencies.
   - Active document content resides only in React memory during the user's session.
   - The browser bundle contains **zero** Google GenAI SDK imports or API key references.

---

## Vercel Deployment Guide

Deploying LexiClear to Vercel takes less than 3 minutes.

### Step-by-Step Instructions

1. **Fork or Push** the repository to GitHub:
   ```bash
   git push origin main
   ```
2. **Import Project into Vercel**:
   - Log in to your [Vercel Dashboard](https://vercel.com).
   - Click **Add New** → **Project**.
   - Select your `lexiclear` repository and click **Import**.
3. **Configure Build & Settings**:
   - **Framework Preset**: `Vite` (automatically detected).
   - **Root Directory**: `./` (default).
   - **Node.js Version**: Ensure Node `22.x` is selected in *Project Settings → General → Node.js Version* (enforced by `"engines": { "node": "22.x" }` in `package.json`).
4. **Configure Environment Variables**:
   In the **Environment Variables** section, add:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `GEMINI_API_KEY` | `AIzaSy...` | **Required**. Your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/). |
   | `GEMINI_MODEL` | `gemini-3.8-flash` | *Optional*. Configured Gemini model (defaults to `gemini-3.8-flash`). |
5. **Deploy**:
   - Click **Deploy**. Vercel will build the Vite frontend to `dist/` and compile the serverless function in `api/index.ts`.
6. **Verify Deployment**:
   - Open your deployed URL:
     - Health Check: `https://<your-project>.vercel.app/api/health` → `{"status":"ok","service":"lexiclear-api","version":"1.0.0"}`
     - Readiness Check: `https://<your-project>.vercel.app/api/ready` → `{"ready":true,"service":"lexiclear-api"}`
     - PDF Worker: `https://<your-project>.vercel.app/pdf.worker.min.mjs` → Returns the worker script with HTTP 200.

---

## Environment Variables

| Variable | Scope | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Server-only | **Yes** (for live AI) | `""` | Google GenAI API key for document analysis & Q&A. |
| `GEMINI_MODEL` | Server-only | No | `gemini-3.8-flash` | Gemini model used for analysis and Q&A. |
| `PORT` | Server-only | No (Local dev) | `3000` | Port for local Express standalone server. Ignored by Vercel. |
| `NODE_ENV` | Server-only | No | `production` | Environment mode (`development`, `production`, `test`). |
| `RATE_LIMIT_WINDOW_MS` | Server-only | No | `60000` | In-memory IP rate limiter window (ms). |
| `RATE_LIMIT_MAX_ANALYZE` | Server-only | No | `20` | Max analysis requests per IP per window. |
| `RATE_LIMIT_MAX_QA` | Server-only | No | `60` | Max Q&A requests per IP per window. |

> **Security Guarantee**: Never set `VITE_GEMINI_API_KEY` or expose AI secrets to Vite. The frontend bundle in `dist/` is audited to ensure zero occurrences of `GEMINI_API_KEY` or `@google/genai`.

---

## Local Development

### Prerequisites
- **Node.js**: `22.x` (recommended) or higher
- **npm**: `v9` or newer

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jayyy-zip/lexiclear.git
   cd lexiclear
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your `GEMINI_API_KEY`:
   ```env
   GEMINI_API_KEY="your_api_key_here"
   GEMINI_MODEL="gemini-3.8-flash"
   PORT=3000
   ```
4. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run with Vercel CLI (Local Serverless Emulation)**:
   If you have the Vercel CLI installed:
   ```bash
   npx vercel dev
   ```
   This emulates the exact Vercel Serverless Function routing and static file handling locally.

6. **Start local production server**:
   ```bash
   npm run build
   npm start
   ```

---

## Testing & Quality Assurance

Run the comprehensive automated test suite (210+ assertions covering parsers, chunkers, deterministic risk engine, grounding verification, and serverless API integration):

```bash
npm test
```

Run TypeScript strict type checking:
```bash
npm run lint
```

Build the production client:
```bash
npm run build
```

---

## Browser & Cross-Device Compatibility

LexiClear is tested and hardened across modern desktop and mobile browsers:

| Platform | Browser | Status | Notes |
| :--- | :--- | :--- | :--- |
| **macOS / iOS** | Safari | **Supported** | Hardened `streamTextContent().getReader().read()` PDF extraction; handles missing `Symbol.asyncIterator`. |
| **macOS / Windows / Linux** | Google Chrome | **Supported** | Native ReadableStream and full PDF worker acceleration. |
| **macOS / Windows / Linux** | Mozilla Firefox | **Supported** | Full compatibility with Web Workers and dynamic imports. |
| **macOS / Windows** | Microsoft Edge | **Supported** | Chromium-parity compatibility. |
| **iOS** | Mobile Safari | **Supported** | Viewport safety via `100dvh`, iOS safe-area insets (`--sat`, `--sab`), non-clipping keyboard layout. |
| **Android** | Android Chrome | **Supported** | Fallback MIME type handling for Android file picker; touch targets >= 44px. |

### Responsive Design
- **Supported Widths**: 320px (iPhone SE) to 4K desktop (3840px).
- **Safe Viewports**: Employs `100dvh` to prevent mobile address bar jumping and clipping.
- **Mobile File Chooser**: Robust extension-based validation handles empty or irregular MIME types from iOS Files and Android storage providers.

---

## PDF Extraction Architecture

LexiClear avoids brittle external PDF services by running PDF parsing directly in the browser using `pdfjs-dist`:

1. **Safari Stream Reader Fix**:
   Safari does not natively support `Symbol.asyncIterator` on `ReadableStreamDefaultReader`. Instead of `for await (... of stream)` or the deprecated `page.getTextContent()`, LexiClear implements an explicit loop:
   ```ts
   const reader = stream.getReader();
   while (true) {
     const { done, value } = await reader.read();
     if (done) break;
     // aggregate text items
   }
   ```
2. **Local Worker Parity**:
   The worker script at `public/pdf.worker.min.mjs` is an exact match for the installed `pdfjs-dist@6.3.289` package. This eliminates CDN network dependencies and avoids version-mismatch exceptions.
3. **Friendly Error Classification**:
   Scanned PDFs without selectable text, password-encrypted files, and corrupted binaries are intercepted with helpful guidance rather than raw JavaScript exceptions.

---

## Backend API Reference

All endpoints accept JSON payloads and include security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-Request-ID`).

### `GET /api/health`
Health check endpoint. Never exposes API keys or internal environment secrets.
```json
{
  "status": "ok",
  "service": "lexiclear-api",
  "version": "1.0.0"
}
```

### `GET /api/ready`
Readiness probe for deployment orchestrators.
```json
{
  "ready": true,
  "service": "lexiclear-api"
}
```

### `POST /api/v1/analyze-chunk`
Analyzes an individual section chunk of a large contract (<= 40,000 chars) to stay safely below Vercel payload limits.
- **Request**:
  ```json
  {
    "documentId": "doc-1726743900000-xyz",
    "chunkIndex": 0,
    "totalChunks": 2,
    "chunkText": "1. TERM AND RENEWAL...",
    "sections": [{ "id": "sec-1", "heading": "1. Term", "text": "...", "page": 1, "startOffset": 0, "endOffset": 250 }]
  }
  ```
- **Response**: Compact structured clauses and silent risks detected in this chunk.

### `POST /api/v1/finalize-analysis`
Merges findings from all chunks, applies deduplication, computes the deterministic Legal Health Score, and builds the Lawyer Prep Kit.
- **Request**: Aggregated clauses, risks, summaries, and document metadata.
- **Response**: Full `AnalysisResult` envelope with coverage metrics (`coverageComplete`, `sectionsAnalyzed`, `sectionsTotal`).

### `POST /api/v1/ask-document`
Answers questions strictly grounded in the document context. Supports stateless fallback via `relevantSections`.
- **Request**:
  ```json
  {
    "documentId": "doc-1726743900000-xyz",
    "question": "What is the security deposit refund policy?",
    "relevantSections": [
      {
        "id": "sec-3",
        "heading": "3. Security Deposit",
        "text": "Deposit of $3,000 shall be returned within twenty-one (21) days of surrender...",
        "page": 2,
        "startOffset": 1500,
        "endOffset": 1750
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "answer": "The security deposit of $3,000 must be returned within 21 days following property surrender.",
    "clauseReference": "Clause 3: Security Deposit",
    "pageReference": "Page 2",
    "evidenceSnippet": "Deposit of $3,000 shall be returned within twenty-one (21) days",
    "evidenceStrength": "Strong evidence",
    "isNotFound": false,
    "sourceLocation": {
      "quote": "Deposit of $3,000 shall be returned within twenty-one (21) days",
      "startOffset": 1500,
      "endOffset": 1563,
      "page": 2
    }
  }
  ```

---

## Privacy Model

- **No Persistent Document Storage**: Uploaded legal contracts are processed ephemerally in active memory. LexiClear has no database, no Redis cache, and no external object storage.
- **No Browser Storage for Documents**: Contract text is never written to `localStorage` or `sessionStorage`. Closing or refreshing the tab clears all document content from memory.
- **Untrusted Passive Data Boundary**: Document content is wrapped in strict structural delimiters (`<DOCUMENT_CONTENT>`) with system instructions forbidding the AI from executing embedded prompts or adversarial commands.

---

## Limitations

- **Scanned / Image-Only Documents**: LexiClear extracts selectable text. Scanned contracts without an OCR text layer cannot be parsed; users should OCR the document before upload.
- **Session Duration**: Because documents are held ephemerally in React state, refreshing the browser requires re-uploading the file.
- **Rate Limits**: Public deployments enforce sliding-window IP rate limits to mitigate abuse.
- **Serverless Timeouts**: Analyses of extremely lengthy contracts (> 100 pages) should be processed through chunked analysis to prevent exceeding Vercel function timeout thresholds.

---

## Legal Disclaimer

**LexiClear provides informational document analysis and issue spotting, not legal advice.**

The findings, screening scores, silent risk detections, and summaries generated by LexiClear are designed exclusively to highlight contractual provisions that may deserve closer review. LexiClear does not provide formal legal opinions, establish an attorney-client relationship, or guarantee contractual enforceability or zero hallucinations. Always consult with a qualified attorney licensed in your jurisdiction for binding legal counsel.
