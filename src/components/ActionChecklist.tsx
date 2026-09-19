import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  AlertCircle,
  Copy,
  Check,
  Filter,
  ArrowRight,
  ListTodo,
  Sparkles
} from 'lucide-react';
import { ActionItem } from '../types/document';
import { useDocumentContext } from '../services/documentContext';

interface ActionChecklistProps {
  items: ActionItem[];
  documentName: string;
}

export const ActionChecklist: React.FC<ActionChecklistProps> = ({ items, documentName }) => {
  const { toggleActionItem } = useDocumentContext();
  const [copied, setCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const completedCount = items.filter(i => i.completed).length;

  const filteredItems = items.filter(i => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'pending') return !i.completed;
    if (categoryFilter === 'completed') return i.completed;
    return i.category === categoryFilter;
  });

  const handleCopy = () => {
    const text = items
      .map(
        i =>
          `[${i.completed ? 'X' : ' '}] (${i.priority.toUpperCase()}) ${i.title}\n  Reason: ${i.reason}\n  Ref: ${i.clauseReference}`
      )
      .join('\n\n');

    navigator.clipboard.writeText(`LexiClear Action Checklist for ${documentName}:\n\n` + text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPriorityBadge = (p: string) => {
    if (p === 'high') return 'bg-rose-100 text-rose-800 border-rose-200';
    if (p === 'medium') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getCategoryBadge = (c?: string) => {
    switch (c) {
      case 'negotiate':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'clarify':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'deadline':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <ListTodo className="w-4 h-4" />
            <span>Targeted Next Steps</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans">
            Action Checklist
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {completedCount} of {items.length} prioritized tasks addressed
          </p>
        </div>

        <div className="flex items-center space-x-3 self-stretch sm:self-auto">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Checklist'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%` }}
        ></div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="text-slate-400 font-semibold uppercase text-[11px] flex-shrink-0">
          Filter:
        </span>
        {[
          { key: 'all', label: `All (${items.length})` },
          { key: 'pending', label: `Pending (${items.length - completedCount})` },
          { key: 'completed', label: `Completed (${completedCount})` },
          { key: 'negotiate', label: 'To Negotiate' },
          { key: 'clarify', label: 'To Clarify' },
          { key: 'deadline', label: 'Deadlines' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setCategoryFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
              categoryFilter === tab.key
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Checklist Items List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={() => toggleActionItem(item.id)}
            className={`p-5 rounded-xl border transition-all cursor-pointer flex items-start space-x-4 ${
              item.completed
                ? 'bg-slate-50 border-slate-200 opacity-60'
                : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-xs'
            }`}
          >
            {/* Interactive Checkbox */}
            <div className="mt-0.5 text-indigo-600 flex-shrink-0">
              {item.completed ? (
                <CheckSquare className="w-5 h-5 text-emerald-600" />
              ) : (
                <Square className="w-5 h-5 text-slate-400 hover:text-indigo-600" />
              )}
            </div>

            {/* Content Details */}
            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPriorityBadge(
                    item.priority
                  )}`}
                >
                  {item.priority} Priority
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryBadge(
                    item.category
                  )}`}
                >
                  {item.category}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-mono text-slate-500 font-medium">
                  {item.clauseReference}
                </span>
              </div>

              <h4
                className={`text-sm sm:text-base font-bold font-sans ${
                  item.completed ? 'line-through text-slate-500' : 'text-slate-900'
                }`}
              >
                {item.title}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                {item.reason}
              </p>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No items in this category.
          </div>
        )}
      </div>
    </div>
  );
};
