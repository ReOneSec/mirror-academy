import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/adminAuth';
import { cleanLink } from '@/lib/notices';
import { isIsoDate } from '@/lib/dates';
import {
  EXAM_EVENT_COLUMNS,
  EXAM_EVENT_KINDS,
  EXAM_NAME_MAX,
  EXAM_NOTE_MAX,
  toExamEvent,
  type ExamEventRow,
} from '@/lib/examEvents';

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}
const unauthorized = () => fail('Unauthorized. Please sign in.', 401);
const NEEDS_006 = 'Could not save. Has migration 006 been run in Supabase?';

async function readJson(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const data = await request.json();
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Validates the fields present in input. Returns an error message or the row update. */
function readFields(input: Record<string, unknown>, requireAll: boolean): string | Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (requireAll || 'exam' in input) {
    const exam = String(input.exam ?? '').trim();
    if (!exam) return 'Add the exam name.';
    if (exam.length > EXAM_NAME_MAX) return `Keep the exam name under ${EXAM_NAME_MAX} characters.`;
    out.exam = exam;
  }
  if (requireAll || 'kind' in input) {
    const kind = String(input.kind ?? 'exam');
    if (!(EXAM_EVENT_KINDS as string[]).includes(kind)) return 'Pick what the date is for.';
    out.kind = kind;
  }
  if (requireAll || 'startsOn' in input) {
    if (!isIsoDate(input.startsOn)) return 'Pick the date.';
    out.starts_on = input.startsOn;
  }
  if ('endsOn' in input) {
    if (input.endsOn === null || input.endsOn === '') out.ends_on = null;
    else if (!isIsoDate(input.endsOn)) return 'Pick a valid end date.';
    else out.ends_on = input.endsOn;
  }
  if (typeof out.ends_on === 'string' && typeof out.starts_on === 'string' && out.ends_on < out.starts_on) {
    return 'The end date must be on or after the start date.';
  }
  if ('note' in input) {
    const note = String(input.note ?? '').trim();
    if (note.length > EXAM_NOTE_MAX) return `Keep the note under ${EXAM_NOTE_MAX} characters.`;
    out.note = note || null;
  }
  if ('linkUrl' in input) {
    const link = cleanLink(input.linkUrl);
    if (link === 'invalid') return 'The link must start with https:// or http://.';
    out.link_url = link;
  }
  if (typeof input.published === 'boolean') out.published = input.published;
  return out;
}

export async function GET(request: NextRequest) {
  if (!(await getAuthenticatedUser(request))) return unauthorized();
  const { data, error } = await createAdminClient()
    .from('exam_events')
    .select(EXAM_EVENT_COLUMNS)
    .order('starts_on', { ascending: false });
  if (error) {
    console.error('Exam events query error:', error);
    return fail('Failed to load dates. Has migration 006 been run in Supabase?', 500);
  }
  return NextResponse.json({ success: true, events: (data as ExamEventRow[]).map(toExamEvent) });
}

export async function POST(request: NextRequest) {
  if (!(await getAuthenticatedUser(request))) return unauthorized();
  const input = await readJson(request);
  if (!input) return fail('Invalid request.', 400);
  const fields = readFields(input, true);
  if (typeof fields === 'string') return fail(fields, 400);
  const { data, error } = await createAdminClient().from('exam_events').insert(fields).select(EXAM_EVENT_COLUMNS).single();
  if (error || !data) {
    console.error('Exam event insert error:', error);
    return fail(NEEDS_006, 500);
  }
  return NextResponse.json({ success: true, event: toExamEvent(data as ExamEventRow), message: 'Date added.' });
}

export async function PATCH(request: NextRequest) {
  if (!(await getAuthenticatedUser(request))) return unauthorized();
  const input = await readJson(request);
  if (!input) return fail('Invalid request.', 400);
  const id = typeof input.id === 'string' ? input.id : '';
  if (!id) return fail('Missing id.', 400);
  const fields = readFields(input, false);
  if (typeof fields === 'string') return fail(fields, 400);
  if (Object.keys(fields).length === 0) return fail('Nothing to update.', 400);
  const { data, error } = await createAdminClient()
    .from('exam_events')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(EXAM_EVENT_COLUMNS)
    .single();
  if (error || !data) {
    console.error('Exam event update error:', error);
    return fail('Could not update the date. Check the end date is not before the start date.', 500);
  }
  return NextResponse.json({ success: true, event: toExamEvent(data as ExamEventRow), message: 'Date updated.' });
}

export async function DELETE(request: NextRequest) {
  if (!(await getAuthenticatedUser(request))) return unauthorized();
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return fail('Missing id.', 400);
  const { error } = await createAdminClient().from('exam_events').delete().eq('id', id);
  if (error) {
    console.error('Exam event delete error:', error);
    return fail('Could not delete the date.', 500);
  }
  return NextResponse.json({ success: true, message: 'Date deleted.' });
}
