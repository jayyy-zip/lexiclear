import React, { useState } from 'react';
import {
  Briefcase,
  Printer,
  Copy,
  Check,
  HelpCircle,
  FileCheck,
  AlertTriangle,
  FileText,
  DollarSign,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { LawyerPrepKit as LawyerPrepKitType } from '../types/document';

interface LawyerPrepKitProps {
  kit: LawyerPrepKitType;
  documentName: string;
  documentType: string;
}

export const LawyerPrepKit: React.FC<LawyerPrepKitProps> = ({
  kit,
  documentName,
  documentType
}) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `
LEXICLEAR LAWYER CONSULTATION PREP KIT
Document: ${documentName} (${documentType})
Generated: ${new Date().toLocaleDateString()}
Disclaimer: LexiClear provides informational document analysis, not legal advice.

--------------------------------------------------
1. EXECUTIVE SUMMARY
${kit.documentSummary}

--------------------------------------------------
2. TOP CONCERNS IDENTIFIED
${kit.topConcerns.map((c, i) => `${i + 1}. ${c}`).join('\n')}

--------------------------------------------------
3. FINANCIAL EXPOSURE & PENALTIES
${kit.importantFinancialExposure.map((f, i) => `• ${f}`).join('\n')}

--------------------------------------------------
4. IMPORTANT CLAUSES FOR COUNSEL REVIEW
${kit.importantClauses
  .map(
    c =>
      `• ${c.title} (${c.reference})\n  Summary: ${c.summary}\n  Why Flagged: ${c.flagReason}`
  )
  .join('\n\n')}

--------------------------------------------------
5. RECOMMENDED QUESTIONS FOR YOUR LAWYER
${kit.questionsForLawyer.map((q, i) => `${i + 1}. ${q}`).join('\n')}

--------------------------------------------------
6. SUPPORTING DOCUMENTS TO BRING
${kit.supportingDocumentsToBring.map((d, i) => `[ ] ${d}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Action Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>Consultation Readiness</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans">
            Lawyer Prep Kit
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Export a structured brief to maximize the value of your 30-minute legal consultation.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-stretch sm:self-auto">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Brief' : 'Copy Brief'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-amber-900 text-xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-amber-950 block mb-0.5">Informational Prep Kit Notice</span>
          {kit.disclaimer || 'LexiClear provides informational document analysis, not legal advice.'} This kit organizes findings and questions to help you have an informed, efficient discussion with a licensed attorney.
        </div>
      </div>

      {/* Structured Brief Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Document Summary */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Executive Summary</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {kit.documentSummary}
            </p>
          </div>

          {/* Top Concerns */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Top Concerns to Raise</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {kit.topConcerns.map((concern, idx) => (
                <li key={idx} className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{concern}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Financial Exposure */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Identified Financial Liabilities</span>
            </h3>
            <div className="space-y-2 text-xs text-slate-700">
              {kit.importantFinancialExposure.map((exposure, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 font-medium"
                >
                  {exposure}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Questions for Lawyer */}
          <div className="bg-indigo-50/60 rounded-2xl p-6 border border-indigo-100 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-900 flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Questions for Your Lawyer</span>
            </h3>
            <div className="space-y-2.5">
              {kit.questionsForLawyer.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3.5 rounded-xl border border-indigo-100/80 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed shadow-xs flex items-start space-x-2.5"
                >
                  <span className="text-indigo-600 font-bold">{idx + 1}.</span>
                  <span>"{q}"</span>
                </div>
              ))}
            </div>
          </div>

          {/* Important Clauses to Highlight */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <FileCheck className="w-4 h-4 text-slate-700" />
              <span>Specific Clauses to Review</span>
            </h3>
            <div className="space-y-3">
              {kit.importantClauses.map((clause, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{clause.title}</span>
                    <span className="font-mono text-slate-400 text-[11px]">{clause.reference}</span>
                  </div>
                  <p className="text-slate-600">{clause.summary}</p>
                  <p className="text-[11px] text-rose-700 font-medium pt-0.5">
                    ⚠️ {clause.flagReason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Supporting Documents to Bring */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Documents to Bring Along</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {kit.supportingDocumentsToBring.map((doc, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
