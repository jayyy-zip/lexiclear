import React from 'react';
import {
  Calendar,
  CalendarPlus,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Download
} from 'lucide-react';
import { TimelineEvent } from '../types/document';
import { downloadIcsFile } from '../utils/icsExporter';

interface ImportantDatesProps {
  timeline: TimelineEvent[];
  documentName: string;
}

export const ImportantDates: React.FC<ImportantDatesProps> = ({ timeline, documentName }) => {
  const getPriorityBadge = (p: string) => {
    if (p === 'high') return 'bg-rose-100 text-rose-800 border-rose-200';
    if (p === 'medium') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const handleExportAll = () => {
    timeline.forEach(event => {
      downloadIcsFile(event, documentName);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Milestones & Deadlines</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-sans">
            Important Dates & Notice Windows
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Never miss an automatic renewal cutoff, notice deadline, or payment milestone.
          </p>
        </div>

        {timeline.length > 0 && (
          <button
            onClick={handleExportAll}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export All to Calendar (.ics)</span>
          </button>
        )}
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {timeline.map((event, idx) => (
          <div key={event.id} className="relative group">
            {/* Timeline Dot */}
            <div
              className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                event.priority === 'high'
                  ? 'bg-rose-500 text-white'
                  : event.priority === 'medium'
                  ? 'bg-amber-500 text-white'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>

            {/* Event Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm font-bold text-indigo-600 font-mono">
                      {event.date}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPriorityBadge(
                        event.priority
                      )}`}
                    >
                      {event.priority} Priority
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-mono text-slate-500">
                      {event.clauseReference}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {event.title}
                  </h3>
                </div>

                <button
                  onClick={() => downloadIcsFile(event, documentName)}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors cursor-pointer"
                  title="Download .ics event file to import into Google Calendar or Apple iCal"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Add to Calendar</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        ))}

        {timeline.length === 0 && (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No chronological milestones identified in this document.
          </div>
        )}
      </div>
    </div>
  );
};
