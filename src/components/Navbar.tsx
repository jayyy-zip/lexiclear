import React from 'react';
import { Shield, FileText, Upload, Sparkles, Scale, RefreshCw } from 'lucide-react';
import { useDocumentContext } from '../services/documentContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenUpload }) => {
  const { currentDocument } = useDocumentContext();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Scale className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                  Lexi<span className="text-indigo-600">Clear</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  GenAI Co-Pilot
                </span>
              </div>
              <p className="text-[11px] text-slate-600 hidden sm:block">
                Understand contracts & identify silent risks
              </p>
            </div>
          </div>

          {/* Current Document Pill */}
          {currentDocument && (
            <div className="hidden md:flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-xs text-slate-600 max-w-sm">
              <FileText className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
              <span className="truncate font-medium text-slate-800">
                {currentDocument.metadata.fileName}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] bg-slate-200/80 px-2 py-0.5 rounded-full font-medium text-slate-600">
                {currentDocument.documentType}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center space-x-2 text-xs font-semibold px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{currentDocument ? 'Switch Document' : 'Upload Document'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (visible when document loaded) */}
        {currentDocument && (
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('score')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'score'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Legal Health Score</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'score'
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {currentDocument.healthScore.overallScore}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('risks')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'risks'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Silent Risk Radar</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'risks'
                    ? 'bg-white/20 text-white'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {currentDocument.risks.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('clauses')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'clauses'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Clause X-Ray
            </button>
            <button
              onClick={() => setActiveTab('ask')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'ask'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask Document</span>
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Action Checklist</span>
              <span className="text-[10px] bg-slate-200 px-1.5 rounded-full font-bold text-slate-700">
                {currentDocument.actionChecklist.filter(a => a.completed).length}/
                {currentDocument.actionChecklist.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('lawyer')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'lawyer'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Lawyer Prep Kit
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>Important Dates</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded-full font-bold">
                {currentDocument.timeline.length}
              </span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
