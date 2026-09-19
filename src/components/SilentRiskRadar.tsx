import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  ArrowRight,
  Filter,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Clock
} from 'lucide-react';
import { SilentRisk, Clause } from '../types/document';

interface SilentRiskRadarProps {
  risks: SilentRisk[];
  clauses: Clause[];
  onSelectRisk: (risk: SilentRisk) => void;
}

export const SilentRiskRadar: React.FC<SilentRiskRadarProps> = ({
  risks,
  clauses,
  onSelectRisk
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filteredRisks = risks.filter(r => {
    if (selectedSeverity === 'all') return true;
    return r.severity === selectedSeverity;
  });

  const highCount = risks.filter(r => r.severity === 'high').length;
  const mediumCount = risks.filter(r => r.severity === 'medium').length;
  const lowCount = risks.filter(r => r.severity === 'low').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-rose-200 text-xs font-semibold backdrop-blur-sm">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
            <span>Proactive Issue Spotting</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
            Silent Risk Radar
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            LexiClear proactively highlights asymmetric terms, broad liabilities, penalty formulas, and automatic renewal traps hidden within routine contract paragraphs.
          </p>
        </div>

        {/* Severity Metrics Badge */}
        <div className="flex items-center space-x-2 sm:space-x-3 bg-black/20 p-3 rounded-xl border border-white/10 self-stretch md:self-auto justify-around">
          <div className="text-center px-2">
            <div className="text-2xl font-black text-rose-400">{highCount}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-200">High</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center px-2">
            <div className="text-2xl font-black text-amber-400">{mediumCount}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-200">Medium</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center px-2">
            <div className="text-2xl font-black text-slate-300">{lowCount}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Low</div>
          </div>
        </div>
      </div>

      {/* Severity Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter by severity:</span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setSelectedSeverity('all')}
              className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedSeverity === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({risks.length})
            </button>
            <button
              onClick={() => setSelectedSeverity('high')}
              className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedSeverity === 'high'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              High ({highCount})
            </button>
            <button
              onClick={() => setSelectedSeverity('medium')}
              className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedSeverity === 'medium'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Medium ({mediumCount})
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Click any card to launch <strong className="text-slate-700">Clause X-Ray</strong>
        </span>
      </div>

      {/* Risk Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRisks.map(risk => {
          const isHigh = risk.severity === 'high';
          const isMed = risk.severity === 'medium';

          return (
            <div
              key={risk.id}
              onClick={() => onSelectRisk(risk)}
              className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-4 relative"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isMed
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {risk.severity} Attention
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {risk.clauseTitle || `Clause ${risk.clauseId}`}
                    </span>
                    {risk.pageReference && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {risk.pageReference}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {risk.title}
                  </h3>
                </div>

                <div className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Inspect X-Ray</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Reason Explanation */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {risk.reason}
              </p>

              {/* Verbatim Evidence Snippet */}
              <div className="bg-slate-50 border-l-4 border-slate-300 rounded-r-xl p-3.5 text-xs font-serif text-slate-700 italic leading-relaxed">
                "{risk.evidence}"
              </div>

              {/* User Impact & Question to Consider */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3 space-y-1">
                  <span className="font-bold text-rose-900 block">Practical Impact:</span>
                  <p className="text-rose-950 leading-relaxed">{risk.userImpact}</p>
                </div>
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 space-y-1">
                  <span className="font-bold text-indigo-900 block">Question to Consider:</span>
                  <p className="text-indigo-950 leading-relaxed font-medium">
                    "{risk.questionToConsider}"
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {filteredRisks.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-600">
              No risks found matching the selected filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
