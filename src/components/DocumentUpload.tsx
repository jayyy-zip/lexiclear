import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
  Layers,
  X
} from 'lucide-react';
import { SAMPLE_DOCUMENTS, SampleDoc } from '../data/sampleDocuments';
import { extractDocumentText, validateFile } from '../services/parser';
import { analyzeDocument } from '../services/gemini';
import { useDocumentContext } from '../services/documentContext';

interface DocumentUploadProps {
  onUploadSuccess: () => void;
  isModal?: boolean;
  onCloseModal?: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadSuccess,
  isModal = false,
  onCloseModal
}) => {
  const { setProcessing, setCurrentDocument, setError } = useDocumentContext();
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processSelectedFile = async (file: File) => {
    setUploadError(null);
    setSelectedFileName(file.name);

    // 1. File Validation
    const validation = validateFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    try {
      // Stage 1: Reading document
      setProcessing(true, 'Reading and parsing document structure...', 30);
      const extracted = await extractDocumentText(file);

      // Stage 2: AI analysis
      setProcessing(true, 'Spotting silent risks and analyzing clauses with Gemini...', 70);
      const analysis = await analyzeDocument({
        rawText: extracted.rawText,
        fileName: extracted.fileName,
        fileType: extracted.fileType,
        wordCount: extracted.wordCount,
        pageCount: extracted.pageCount || 1,
        fileSize: extracted.fileSize,
      });

      // Stage 3: Scoring & finalizing
      setProcessing(true, 'Verifying evidence grounding and compiling Legal Health Score...', 95);

      setCurrentDocument(analysis);
      setProcessing(false, 'Complete', 100);
      if (onCloseModal) onCloseModal();
      onUploadSuccess();
    } catch (err: any) {
      console.error('Document processing failed:', err);
      let msg = err.message || 'An unexpected error occurred while analyzing the document.';
      if (msg.includes('undefined is not a function') || msg.toLowerCase().includes('readablestream')) {
        msg = "LexiClear couldn't extract readable text from this PDF due to a browser compatibility issue. Try another PDF or an OCR-readable document.";
      }
      setUploadError(msg);
      setError(msg);
      setProcessing(false, 'Error', 0);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processSelectedFile(file);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processSelectedFile(file);
    }
  };

  const handleSelectSample = async (sample: SampleDoc) => {
    setUploadError(null);
    setSelectedFileName(sample.name);

    try {
      // Run processing animation flow for authentic experience
      setProcessing(true, 'Reading and segmenting contract terms...', 30);
      await new Promise(r => setTimeout(r, 450));

      setProcessing(true, 'Evaluating silent risks with Gemini co-pilot...', 70);
      await new Promise(r => setTimeout(r, 550));

      setProcessing(true, 'Compiling Legal Health Score and Lawyer Prep Kit...', 95);
      await new Promise(r => setTimeout(r, 400));

      const analysisWithRawText = {
        ...sample.precomputedAnalysis,
        metadata: {
          ...sample.precomputedAnalysis.metadata,
          rawText: sample.rawText,
        },
      };
      setCurrentDocument(analysisWithRawText);
      setProcessing(false, 'Complete', 100);
      if (onCloseModal) onCloseModal();
      onUploadSuccess();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to load sample document.');
      setProcessing(false, 'Error', 0);
    }
  };

  const content = (
    <div className="space-y-8">
      {/* Upload Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>GenAI Legal Document Co-Pilot</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
          Upload any legal contract. <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">
            Uncover silent risks in seconds.
          </span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
          Upload your lease, employment contract, or loan note. LexiClear translates complex legalese, scores contractual balance, and grounds every answer in your actual text.
        </p>
      </div>

      {/* Error Alert if any */}
      {uploadError && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Unable to process document</p>
            <p className="text-rose-700 text-xs leading-relaxed">{uploadError}</p>
            <button
              onClick={() => setUploadError(null)}
              className="text-xs font-medium text-rose-800 underline hover:text-rose-900 cursor-pointer pt-1"
            >
              Dismiss and try another file
            </button>
          </div>
        </div>
      )}

      {/* Main Drag-and-Drop Area */}
      <div className="max-w-2xl mx-auto">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer bg-white relative group ${
            dragActive
              ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50/70 shadow-sm'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4 transition-colors">
            <Upload className="w-8 h-8 text-indigo-600" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Drag & drop your contract here
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            or <span className="text-indigo-600 font-semibold underline">browse files</span> on your computer
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">PDF (.pdf)</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">Word (.docx)</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200">Text (.txt)</span>
            <span className="text-slate-400">•</span>
            <span>Max 15MB</span>
          </div>
        </div>
      </div>

      {/* Or Select Sample Contracts Section */}
      <div className="max-w-4xl mx-auto pt-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            or explore with sample documents
          </span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_DOCUMENTS.map(sample => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {sample.category}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Demo</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {sample.fileType.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {sample.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {sample.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                <span>Explore demo contract</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Privacy Note */}
      <div className="max-w-3xl mx-auto text-center space-y-2 pt-4">
        <div className="inline-flex items-start sm:items-center space-x-2 text-xs text-slate-600 bg-slate-100/80 px-4 py-2.5 rounded-xl border border-slate-200 text-left sm:text-center">
          <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-relaxed">
            <strong className="text-slate-800">Document processing:</strong> Your document is temporarily processed by LexiClear's server for analysis. LexiClear does not intentionally persist uploaded documents after the temporary analysis session.
          </span>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
          {onCloseModal && (
            <button
              onClick={onCloseModal}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {content}
        </div>
      </div>
    );
  }

  return <div className="py-8">{content}</div>;
};
