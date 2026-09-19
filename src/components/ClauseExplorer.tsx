import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  FileText,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { Clause } from '../types/document';

interface ClauseExplorerProps {
  clauses: Clause[];
  onSelectClause: (clause: Clause) => void;
  onAskAboutClause?: (clauseTitle: string) => void;
}

export const ClauseExplorer: React.FC<ClauseExplorerProps> = ({
  clauses,
  onSelectClause,
  onAskAboutClause
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeClauseId, setActiveClauseId] = useState<string>(clauses[0]?.id || '');

  const types = Array.from(new Set(clauses.map(c => c.type).filter(Boolean)));

  const filteredClauses = clauses.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.plainEnglish && c.plainEnglish.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || c.type === selectedType;
    return matchesSearch && matchesType;
  });

  const activeClause = clauses.find(c => c.id === activeClauseId) || filteredClauses[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Document Breakdown</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans">
            Clause X-Ray Explorer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Compare verbatim contractual text side-by-side with clear, plain-English explanations.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search clauses or terms..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Two-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Clause List */}
        <div className="lg:col-span-5 space-y-2 max-h-[700px] overflow-y-auto pr-1">
          {filteredClauses.map(clause => {
            const isSelected = activeClause?.id === clause.id;

            return (
              <div
                key={clause.id}
                onClick={() => {
                  setActiveClauseId(clause.id);
                  onSelectClause(clause);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                    {clause.page ? `Page ${clause.page}` : 'Clause'}
                  </span>
                  {clause.financialExposure && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      Financial
                    </span>
                  )}
                </div>

                <h4
                  className={`text-xs sm:text-sm font-bold leading-snug ${
                    isSelected ? 'text-indigo-950' : 'text-slate-900'
                  }`}
                >
                  {clause.title}
                </h4>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {clause.plainEnglish || clause.text}
                </p>
              </div>
            );
          })}

          {filteredClauses.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
              No clauses match your search.
            </div>
          )}
        </div>

        {/* Right Column: Detailed Clause X-Ray Card */}
        <div className="lg:col-span-7">
          {activeClause ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                    {activeClause.page ? `Page ${activeClause.page}` : 'Active Provision'}
                  </span>
                  {activeClause.type && (
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {activeClause.type}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-sans">
                  {activeClause.title}
                </h3>
              </div>

              {/* Plain English Translation */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-5 space-y-2">
                <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Plain-English Translation</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                  {activeClause.plainEnglish ||
                    'Outlines formal duties and conditions required of both contracting parties.'}
                </p>
              </div>

              {/* Verbatim Legal Contract Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Verbatim Contract Text</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">Original Clause</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs font-serif text-slate-800 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap select-text">
                  {activeClause.text}
                </div>
              </div>

              {/* Why It Matters */}
              {activeClause.whyItMatters && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Why It Matters</span>
                  </h4>
                  <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-4 text-xs text-amber-950 leading-relaxed">
                    {activeClause.whyItMatters}
                  </div>
                </div>
              )}

              {/* Quick Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  Evidence confidence: <strong className="text-slate-700">Strong evidence</strong>
                </span>

                {onAskAboutClause && (
                  <button
                    onClick={() => onAskAboutClause(activeClause.title)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask Question About This Clause</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400">
              Select a clause from the list to view its X-Ray breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
