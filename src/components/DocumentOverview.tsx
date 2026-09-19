import React from 'react';
import {
  FileText,
  Users,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  Scale,
  ShieldAlert,
  ArrowRight,
  Clock,
  Sparkles,
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { AnalysisResult } from '../types/document';

interface DocumentOverviewProps {
  document: AnalysisResult;
  onNavigateTab: (tab: string) => void;
}

export const DocumentOverview: React.FC<DocumentOverviewProps> = ({
  document,
  onNavigateTab
}) => {
  const highRiskCount = document.risks.filter(r => r.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* Top Banner with High-Level Summary */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {document.documentType}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-mono">
                {document.metadata.pageCount} pages • {document.metadata.wordCount} words
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
              {document.metadata.fileName}
            </h1>
          </div>

          {/* Quick Stat Pill Cards */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Legal Health Score Pill */}
            <div
              onClick={() => onNavigateTab('score')}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 transition-colors cursor-pointer flex items-center space-x-3"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {document.healthScore.overallScore}
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400">Health Score</div>
                <div className="text-xs font-semibold text-slate-800">{document.healthScore.status}</div>
              </div>
            </div>

            {/* Silent Risk Radar Pill */}
            <div
              onClick={() => onNavigateTab('risks')}
              className="bg-rose-50 hover:bg-rose-100/70 border border-rose-200 rounded-xl px-4 py-2.5 transition-colors cursor-pointer flex items-center space-x-3"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
                {document.risks.length}
              </div>
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-rose-500">Silent Risks</div>
                <div className="text-xs font-semibold text-rose-900">{highRiskCount} High Severity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Executive Summary
          </h3>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans">
            {document.summary}
          </p>
        </div>

        {/* Contract Key Metadata Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* Parties */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Identified Parties</span>
            </div>
            <ul className="text-xs text-slate-800 font-medium space-y-1">
              {document.parties.map((p, idx) => (
                <li key={idx} className="truncate">• {p}</li>
              ))}
            </ul>
          </div>

          {/* Jurisdiction */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Governing Jurisdiction</span>
            </div>
            <p className="text-xs text-slate-800 font-medium">
              {document.jurisdiction || 'Jurisdiction not specified in main body'}
            </p>
          </div>

          {/* Dispute Resolution */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>Dispute Forum</span>
            </div>
            <p className="text-xs text-slate-800 font-medium line-clamp-2">
              {document.disputeResolution}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Terms & Obligations Two-Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Terms */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Key Financial Terms</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium font-mono">
              {document.financialTerms.length} terms
            </span>
          </div>

          <div className="space-y-2">
            {document.financialTerms.map((term, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs text-slate-800 font-medium"
              >
                {term}
              </div>
            ))}
          </div>
        </div>

        {/* Obligations & Termination */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Key Obligations & Termination</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium font-mono">
              {document.obligations.length} duties
            </span>
          </div>

          <div className="space-y-2">
            {document.obligations.map((ob, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs text-slate-800"
              >
                {ob}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Exploration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Silent Risk Radar */}
        <div
          onClick={() => onNavigateTab('risks')}
          className="group bg-gradient-to-br from-rose-50 to-white p-5 rounded-2xl border border-rose-200/80 hover:border-rose-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors">
              Silent Risk Radar
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review {document.risks.length} flagged clauses with one-sided liabilities or automatic traps.
            </p>
          </div>
          <div className="pt-4 flex items-center space-x-1 text-xs font-semibold text-rose-600">
            <span>Explore risks</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Ask Document */}
        <div
          onClick={() => onNavigateTab('ask')}
          className="group bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl border border-indigo-200/80 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
              Ask Your Document
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Chat with Gemini grounded strictly in your contract text with citations.
            </p>
          </div>
          <div className="pt-4 flex items-center space-x-1 text-xs font-semibold text-indigo-600">
            <span>Start asking</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Action Checklist */}
        <div
          onClick={() => onNavigateTab('checklist')}
          className="group bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
              Action Checklist
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Prioritized checklist of items to negotiate, clarify, and track.
            </p>
          </div>
          <div className="pt-4 flex items-center space-x-1 text-xs font-semibold text-slate-700">
            <span>Open checklist</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Lawyer Prep Kit */}
        <div
          onClick={() => onNavigateTab('lawyer')}
          className="group bg-gradient-to-br from-slate-50 to-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
              Lawyer Prep Kit
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export an executive brief with questions ready for your attorney consultation.
            </p>
          </div>
          <div className="pt-4 flex items-center space-x-1 text-xs font-semibold text-slate-700">
            <span>View brief</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
