import { createPublicClient } from '@/lib/supabase/public';
import {
  EXAM_EVENT_COLUMNS,
  EXAM_EVENT_COLUMNS_V1,
  FALLBACK_EXAM_EVENTS,
  isUpcoming,
  toExamEvent,
  type ExamEventRow,
} from '@/lib/examEvents';
import type { ExamEvent } from '@/types';

/** Published dates still shown on `today` (YYYY-MM-DD), soonest first. Falls back to the seed dates. */
export async function listUpcomingEvents(today: string, limit = 20): Promise<ExamEvent[]> {
  const supabase = createPublicClient();
  const done = (list: ExamEvent[]) => list.filter((e) => isUpcoming(e, today)).slice(0, limit);
  if (!supabase) return done(FALLBACK_EXAM_EVENTS);
  try {
    const withExpiry = () =>
      supabase
        .from('exam_events')
        .select(EXAM_EVENT_COLUMNS)
        .eq('published', true)
        .or(`starts_on.gte.${today},ends_on.gte.${today},expires_on.gte.${today}`)
        .order('starts_on', { ascending: true })
        .limit(limit + 20);
    const withoutExpiry = () =>
      supabase
        .from('exam_events')
        .select(EXAM_EVENT_COLUMNS_V1)
        .eq('published', true)
        .or(`starts_on.gte.${today},ends_on.gte.${today}`)
        .order('starts_on', { ascending: true })
        .limit(limit + 20);
    let { data, error } = await withExpiry();
    if (error) ({ data, error } = await withoutExpiry()); // migration 007 not run yet
    if (error) {
      console.error('Public exam events error:', error);
      return done(FALLBACK_EXAM_EVENTS);
    }
    return done((data as unknown as ExamEventRow[]).map(toExamEvent));
  } catch (err) {
    console.error('Public exam events error:', err);
    return done(FALLBACK_EXAM_EVENTS);
  }
}
