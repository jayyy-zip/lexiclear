import { TimelineEvent } from '../types/document';

function formatIcsDate(dateStr?: string): string {
  if (!dateStr) {
    const now = new Date();
    return now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) {
    // If not standard date, use future placeholder 30 days out
    const future = new Date(Date.now() + 30 * 86400000);
    return future.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  return parsed.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function generateIcsContent(event: TimelineEvent, documentName: string): string {
  const uid = `lexiclear-${event.id}-${Date.now()}@lexiclear.ai`;
  const dtStamp = formatIcsDate();
  const dtStart = formatIcsDate(event.isoDate || event.date);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LexiClear//Legal Document Co-Pilot//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `SUMMARY:LexiClear Deadline: ${event.title}`,
    `DESCRIPTION:${event.description} (Ref: ${event.clauseReference}) - Document: ${documentName}`,
    'STATUS:CONFIRMED',
    'PRIORITY:1',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcsFile(event: TimelineEvent, documentName: string): void {
  const icsString = generateIcsContent(event, documentName);
  const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
