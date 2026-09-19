import React from 'react';
import {
  X,
  FileText,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { Clause, SilentRisk } from '../types/document';

interface ClauseXRayModalProps {
  clause: Clause | null;
  risk?: SilentRisk | null;
  onClose: () => void;
  onAskAboutClause?: (clauseTitle: string) => void;
}

export const ClauseXRayModal: React.FC<ClauseXRayModalProps> = ({
  clause,
  risk,
  onClose,
  onAskAboutClause
}) => {
  if (!clause && !risk) return null;

  const title = risk?.title || clause?.title || 'Clause Details';
  const originalText = clause?.text || risk?.evidence || 'No verbatim text available.';
  const plainEnglish =
    risk?.plainEnglishTranslation ||
    clause?.plainEnglish ||
    'Plain English translation summarizing the intent and legal mechanism of this clause.';
  const whyItMatters =
    risk?.reason ||
    clause?.whyItMatters ||
    'This clause defines contractual responsibilities and potential exposure.';
  const questionToConsider =
    risk?.questionToConsider ||
    'Can this provision be amended to provide mutual reciprocity and standard notice?';
  const citation =
    clause?.title ||
    risk?.clauseTitle ||
    (clause?.page ? `Page ${clause.page}` : 'Document Excerpt');
  const evidenceStrength = risk?.evidenceStrength || 'Strong evidence';

  const getStrengthBadge = (str: string) => {
    if (str.includes('Strong')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (str.includes('Limited')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Clause X-Ray</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono text-slate-500">{citation}</span>
            {risk && (
              <>
                <span className="text-slate-300">•</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    risk.severity === 'high'
                      ? 'bg-rose-100 text-rose-800'
                      : risk.severity === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {risk.severity} Severity
                </span>
              </>
            )}
          </div>

          <h3 className="text-2xl font-bold text-slate-900 font-sans">{title}</h3>
        </div>

        {/* Section 1: Original Contract Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Original Contract Text</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Verbatim Excerpt
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs font-serif text-slate-800 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap select-text">
            {originalText}
          </div>
        </div>

        {/* Section 2: Plain-English Translation */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-5 space-y-2">
          <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Plain-English Translation</span>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed font-sans">
            {plainEnglish}
          </p>
        </div>

        {/* Section 3: Why It Matters */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Why It Matters</span>
          </h4>
          <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-4 text-xs text-amber-950 leading-relaxed">
            {whyItMatters}
          </div>
        </div>

        {/* Section 4: Question to Consider */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>Question to Consider / Counter-Proposal</span>
          </h4>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-800 leading-relaxed font-medium">
            "{questionToConsider}"
          </div>
        </div>

        {/* Section 5: Grounding Citation & Evidence Confidence */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500">Citation:</span>
            <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {citation}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Evidence:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full border ${getStrengthBadge(
                evidenceStrength
              )}`}
            >
              {evidenceStrength}
            </span>
            {risk?.sourceLocation?.startOffset !== undefined && (
              <>
                <span className="text-slate-300">•</span>
                <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Offsets: {risk.sourceLocation.startOffset}–{risk.sourceLocation.endOffset}
                </span>
              </>
            )}
          </div>

          {onAskAboutClause && (
            <button
              onClick={() => {
                onClose();
                onAskAboutClause(title);
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Co-Pilot About This Clause</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
