import React from 'react';
import { X, Scale, Info, ShieldCheck, AlertTriangle } from 'lucide-react';
import { LegalHealthScore } from '../types/document';

interface HowScoreCalculatedModalProps {
  score: LegalHealthScore;
  onClose: () => void;
}

export const HowScoreCalculatedModal: React.FC<HowScoreCalculatedModalProps> = ({ score, onClose }) => {
  const dimensionsList = [
    {
      key: 'fairness',
      data: score.dimensions.fairness,
      rubric: 'Examines whether protections and remedies are bilateral or unilateral. Penalizes one-sided indemnification, unilateral cancellation, and rights waivers.',
    },
    {
      key: 'riskExposure',
      data: score.dimensions.riskExposure,
      rubric: 'Evaluates financial penalties, liquidated damages, liability caps, personal guarantees, and potential monetary exposure.',
    },
    {
      key: 'obligationBalance',
      data: score.dimensions.obligationBalance,
      rubric: 'Assesses whether duties and affirmative obligations are reasonably apportioned, including maintenance responsibilities and post-contract covenants.',
    },
    {
      key: 'terminationRights',
      data: score.dimensions.terminationRights,
      rubric: 'Reviews notice periods, automatic renewal traps, cure periods, and whether exit provisions favor one party disproportionately.',
    },
    {
      key: 'clarity',
      data: score.dimensions.clarity,
      rubric: 'Checks for vague standards, subjective discretion (e.g., "sole discretion"), defined terms, and clear milestone dates.',
    },
    {
      key: 'disputeResolution',
      data: score.dimensions.disputeResolution,
      rubric: 'Reviews mandatory arbitration rules, jury trial waivers, class action waivers, governing law, and attorney fee shifting clauses.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center space-x-2 text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>Algorithmic Screening Signal</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 font-sans">
            How the Legal Health Score is Calculated
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            The Legal Health Score is an objective, weighted index designed to surface asymmetric provisions, unusual financial risks, and potential pitfalls for your attention.
          </p>
        </div>

        {/* Informational Disclaimer Box */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 mb-6 text-amber-900 text-xs leading-relaxed flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-950 mb-1">Informational Screening Signal Only</p>
            <p className="text-amber-800">
              This score is an informational heuristic, NOT a legal determination or warranty of enforceability. A low score does not mean a contract is illegal, and a high score does not replace customized advice from a qualified attorney.
            </p>
          </div>
        </div>

        {/* Six Dimensions Breakdown */}
        <div className="space-y-4 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            6 Core Evaluated Dimensions
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {dimensionsList.map(({ key, data, rubric }) => (
              <div
                key={key}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{data.name}</span>
                    <span className="text-[11px] font-medium text-slate-600">
                      ({data.weight}% weight)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        data.score < 50
                          ? 'bg-rose-100 text-rose-800'
                          : data.score < 70
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {data.score} / 100
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rubric}</p>
                <div className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200/60 font-medium">
                  <span className="text-slate-600 font-semibold">Document Finding:</span>{' '}
                  {data.keyFinding}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formula Summary */}
        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs space-y-2">
          <div className="flex items-center space-x-2 text-white font-semibold">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>Composite Weighting Formula</span>
          </div>
          <p className="font-mono text-[11px] text-indigo-300">
            Score = (Risk × 0.25) + (Fairness × 0.20) + (Obligations × 0.15) + (Termination × 0.15) + (Clarity × 0.15) + (Dispute × 0.10)
          </p>
          <p className="text-[11px] text-slate-400">
            High-severity silent risks apply additional downward scoring adjustment to highlight critical attention areas.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Transparent Rubric
          </button>
        </div>
      </div>
    </div>
  );
};
