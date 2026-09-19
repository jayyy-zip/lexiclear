import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, HelpCircle, ArrowUpRight, Scale, Info, CheckCircle2 } from 'lucide-react';
import { LegalHealthScore } from '../types/document';
import { HowScoreCalculatedModal } from './HowScoreCalculatedModal';

interface HealthScoreCardProps {
  score: LegalHealthScore;
  onNavigateRisks?: () => void;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ score, onNavigateRisks }) => {
  const [showHowModal, setShowHowModal] = useState(false);

  const getScoreColor = (val: number) => {
    if (val < 45) return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', bar: 'bg-rose-500' };
    if (val < 65) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500' };
    if (val < 80) return { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', bar: 'bg-indigo-500' };
    return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' };
  };

  const overallColors = getScoreColor(score.overallScore);

  const dimensions = [
    { key: 'fairness', data: score.dimensions.fairness },
    { key: 'clarity', data: score.dimensions.clarity },
    { key: 'riskExposure', data: score.dimensions.riskExposure },
    { key: 'obligationBalance', data: score.dimensions.obligationBalance },
    { key: 'terminationRights', data: score.dimensions.terminationRights },
    { key: 'disputeResolution', data: score.dimensions.disputeResolution },
  ];

  return (
    <div className="space-y-6">
      {/* Main Score Hero Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Informational Screening
              </span>
              <span className="text-slate-300">•</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${overallColors.bg} ${overallColors.text} border ${overallColors.border}`}>
                {score.status}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans">
              Legal Health Score
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {score.shortExplanation}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowHowModal(true)}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How is this score calculated?</span>
              </button>

              {onNavigateRisks && (
                <button
                  onClick={onNavigateRisks}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <span>Review Silent Risk Radar</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Big Score Visual Meter */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200/80 min-w-[160px] flex-shrink-0 self-center md:self-auto">
            <div className="text-5xl sm:text-6xl font-black font-sans tracking-tight text-slate-900">
              {score.overallScore}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
              out of 100
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className={`h-2 rounded-full ${overallColors.bar} transition-all duration-700`}
                style={{ width: `${score.overallScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Dimensions Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">
            Dimension Breakdown
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Evaluated across 6 legal categories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dimensions.map(({ key, data }) => {
            const colors = getScoreColor(data.score);
            return (
              <div
                key={key}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900">{data.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {data.score} / 100
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${colors.bar}`}
                      style={{ width: `${data.score}%` }}
                    ></div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {data.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-lg leading-relaxed">
                  <span className="font-semibold text-slate-900 block mb-0.5">Key Finding:</span>
                  {data.keyFinding}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transparent Rubric Modal */}
      {showHowModal && (
        <HowScoreCalculatedModal
          score={score}
          onClose={() => setShowHowModal(false)}
        />
      )}
    </div>
  );
};
