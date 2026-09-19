import React from 'react';
import { FileSearch, CheckCircle, ShieldAlert, Sparkles, Scale, Loader2 } from 'lucide-react';
import { useDocumentContext } from '../services/documentContext';

export const ProcessingView: React.FC = () => {
  const { processingStage, processingPercent } = useDocumentContext();

  const stages = [
    { label: 'Reading document', desc: 'Parsing structure, pages, and metadata', threshold: 25 },
    { label: 'Finding clauses', desc: 'Segmenting provisions, obligations, and rights', threshold: 50 },
    { label: 'Checking areas that need attention', desc: 'Spotting silent risks, penalties, and asymmetry', threshold: 75 },
    { label: 'Preparing summary & score', desc: 'Calculating Legal Health Score and action kit', threshold: 95 },
  ];

  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center">
      {/* Central Animated Graphic */}
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 rounded-3xl bg-indigo-50 animate-ping opacity-75"></div>
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
          <Scale className="w-10 h-10 animate-pulse text-indigo-100" />
        </div>
      </div>

      {/* Stage Title */}
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
          Analyzing Legal Document
        </h2>
        <p className="text-sm text-indigo-700 font-medium animate-pulse">
          {processingStage || 'Processing document content...'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 mb-8 overflow-hidden border border-slate-200">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.max(5, processingPercent)}%` }}
        ></div>
      </div>

      {/* Step Indicators */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-left space-y-4">
        {stages.map((stage, idx) => {
          const isDone = processingPercent >= stage.threshold;
          const isCurrent =
            processingPercent < stage.threshold &&
            (idx === 0 || processingPercent >= stages[idx - 1].threshold);

          return (
            <div key={stage.label} className="flex items-start space-x-3.5">
              <div className="mt-0.5 flex-shrink-0">
                {isDone ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {idx + 1}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${
                    isDone
                      ? 'text-slate-900'
                      : isCurrent
                      ? 'text-indigo-700'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reassurance Disclaimer */}
      <p className="text-xs text-slate-600 mt-6 max-w-sm mx-auto leading-relaxed">
        LexiClear grounds all findings strictly in your uploaded text to prevent hallucinations.
      </p>
    </div>
  );
};
