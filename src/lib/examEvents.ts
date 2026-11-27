import type { ExamEvent, ExamEventKind } from '@/types';

export const EXAM_EVENT_KINDS: ExamEventKind[] = ['exam', 'admit_card', 'result', 'application', 'other'];
export const EXAM_NAME_MAX = 120;
export const EXAM_NOTE_MAX = 300;
export const EXAM_EVENT_COLUMNS = 'id, exam, kind, starts_on, ends_on, note, link_url, published';

export interface ExamEventRow {
  id: string;
  exam: string;
  kind: ExamEventKind;
  starts_on: string;
  ends_on: string | null;
  note: string | null;
  link_url: string | null;
  published: boolean;
}

export function toExamEvent(row: ExamEventRow): ExamEvent {
  return {
    id: row.id,
    exam: row.exam,
    kind: row.kind,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    note: row.note,
    linkUrl: row.link_url,
    published: row.published,
  };
}

/** Still upcoming or happening on `today` (YYYY-MM-DD). */
export const isUpcoming = (e: Pick<ExamEvent, 'startsOn' | 'endsOn'>, today: string) =>
  (e.endsOn ?? e.startsOn) >= today;

const WBPSC_CLERK_PDF =
  'https://psc.wb.gov.in/Download?param1=25112026104610_AnnouncementClerk.pdf&param2=advertisement';

/** Shown only when the exam_events table can't be read (migration 006 not run yet). Migration 006 seeds the same. */
export const FALLBACK_EXAM_EVENTS: ExamEvent[] = [
  {
    id: 'fallback-clerk-admit',
    exam: 'WBPSC Clerkship Part-I',
    kind: 'admit_card',
    startsOn: '2026-12-14',
    endsOn: null,
    note: 'Admit cards available at psc.wb.gov.in',
    linkUrl: WBPSC_CLERK_PDF,
    published: true,
  },
  {
    id: 'fallback-clerk-exam',
    exam: 'WBPSC Clerkship Part-I',
    kind: 'exam',
    startsOn: '2026-12-26',
    endsOn: '2026-12-27',
    note: null,
    linkUrl: WBPSC_CLERK_PDF,
    published: true,
  },
];
