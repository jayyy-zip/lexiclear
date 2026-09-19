import { Router, Request, Response } from 'express';
import { analyzeDocumentServer, answerDocumentQuestionServer } from './geminiService';

export const apiRouter = Router();

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'LexiClear AI Co-Pilot Server',
    geminiKeySet: Boolean(process.env.GEMINI_API_KEY),
  });
});

apiRouter.post('/analyze-document', async (req: Request, res: Response): Promise<void> => {
  try {
    const { rawText, fileName, fileType, wordCount, pageCount } = req.body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 20) {
      res.status(400).json({
        error: 'Invalid or empty document text provided for analysis.',
      });
      return;
    }

    const result = await analyzeDocumentServer({
      rawText,
      fileName: fileName || 'Uploaded_Document',
      fileType: fileType || 'txt',
      wordCount: wordCount || rawText.split(/\s+/).length,
      pageCount: pageCount || 1,
    });

    res.json(result);
  } catch (error: any) {
    console.error('API /analyze-document error:', error);
    res.status(500).json({
      error: error.message || 'Failed to complete document analysis using Gemini AI.',
    });
  }
});

apiRouter.post('/ask-document', async (req: Request, res: Response): Promise<void> => {
  try {
    const { rawText, question, documentType, clauses } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'A question is required.' });
      return;
    }

    if (!rawText || typeof rawText !== 'string') {
      res.status(400).json({ error: 'Document text context is required.' });
      return;
    }

    const answerResult = await answerDocumentQuestionServer({
      rawText,
      question: question.trim(),
      documentType,
      clauses,
    });

    res.json(answerResult);
  } catch (error: any) {
    console.error('API /ask-document error:', error);
    res.status(500).json({
      error: error.message || 'Failed to answer question grounded in document.',
    });
  }
});
