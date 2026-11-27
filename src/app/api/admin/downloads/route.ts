import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/adminAuth';
import { cleanLink } from '@/lib/notices';
import {
  DOWNLOAD_BUCKET,
  DOWNLOAD_CATEGORIES,
  DOWNLOAD_COLUMNS,
  DOWNLOAD_EXAM_MAX,
  DOWNLOAD_FILE_TYPES,
  DOWNLOAD_MAX_BYTES,
  DOWNLOAD_TITLE_MAX,
  toDownload,
  type DownloadRow,
} from '@/lib/downloads';

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}
const unauthorized = () => fail('Unauthorized. Please sign in.', 401);

async function readJson(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const data = await request.json();
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function readFields(input: Record<string, unknown>, requireAll: boolean): string | Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (requireAll || 'title' in input) {
    const title = String(input.title ?? '').trim();
    if (!title) return 'Add a title.';
    if (title.length > DOWNLOAD_TITLE_MAX) return `Keep the title under ${DOWNLOAD_TITLE_MAX} characters.`;
    out.title = title;
  }
  if (requireAll || 'category' in input) {
    const category = String(input.category ?? '');
    if (!(DOWNLOAD_CATEGORIES as string[]).includes(category)) return 'Pick a section.';
    out.category = category;
  }
  if ('exam' in input) {
    const exam = String(input.exam ?? '').trim();
    if (exam.length > DOWNLOAD_EXAM_MAX) return `Keep the exam name under ${DOWNLOAD_EXAM_MAX} characters.`;
    out.exam = exam || null;
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
    .from('downloads')
    .select(DOWNLOAD_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Downloads query error:', error);
    return fail('Failed to load downloads. Has migration 006 been run in Supabase?', 500);
  }
  return NextResponse.json({ success: true, downloads: (data as DownloadRow[]).map(toDownload) });
}

/** Step 2 of an upload (or a link-only entry): saves the details. `file` is what step 1 uploaded. */
export async function POST(request: NextRequest) {
  if (!(await getAuthenticatedUser(request))) return unauthorized();
  const input = await readJson(request);
  if (!input) return fail('Invalid request.', 400);
  const fields = readFields(input, true);
  if (typeof fields === 'string') return fail(fields, 400);

  const admin = createAdminClient();
  const file = input.file as { path?: unknown; name?: unknown; type?: unknown; size?: unknown } | null | undefined;
  if (file && typeof file === 'object') {
    const path = String(file.path ?? '');
    const type = String(file.type ?? '');
    const size = Number(file.size ?? 0);
    if (!/^\d{4}\/[0-9a-f-]{36}-[a-z0-9.-]+$/.test(path)) return fail('Invalid file.', 400);
    if (!DOWNLOAD_FILE_TYPES.includes(type) || !(size > 0) || size > DOWNLOAD_MAX_BYTES) return fail('Invalid file.', 400);
    // Make sure the upload really happened before saving a row that points at it.
    const folder = path.split('/')[0];
    const { data: listed } = await admin.storage.from(DOWNLOAD_BUCKET).list(folder, { search: path.split('/')[1] });
    if (!listed?.some((f) => `${folder}/${f.name}` === path)) return fail('The file did not finish uploading. Try again.', 400);
    Object.assign(fields, {
      file_path: path,
      file_name: String(file.name ?? '').slice(0, 200) || null,
      file_type: type,
      file_size: Math.round(size),
    });
  }
  if (!fields.file_path && !fields.link_url) return fail('Upload a file or add a link.', 400);

  const { data, error } = await admin.from('downloads').insert(fields).select(DOWNLOAD_COLUMNS).single();
  if (error || !data) {
    console.error('Download insert error:', error);
    if (typeof fields.file_path === 'string') await admin.storage.from(DOWNLOAD_BUCKET).remove([fields.file_path]);
    return fail('Could not save. Has migration 006 been run in Supabase?', 500);
  }
  return NextResponse.json({ success: true, download: toDownload(data as DownloadRow), message: 'Added to downloads.' });
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
    .from('downloads')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(DOWNLOAD_COLUMNS)
    .single();
  if (error || !data) {
    console.error('Download update error:', error);
    return fail('Could not update.', 500);
  }
  return NextResponse.json({ success: true, download: toDownload(data as DownloadRow), message: 'Updated.' });
}

export async function DELETE(request: NextRequest) {
  if (!(await getAuthenticatedUser(request))) return unauthorized();
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return fail('Missing id.', 400);
  const admin = createAdminClient();
  const { data: existing } = await admin.from('downloads').select('file_path').eq('id', id).maybeSingle();
  const { error } = await admin.from('downloads').delete().eq('id', id);
  if (error) {
    console.error('Download delete error:', error);
    return fail('Could not delete.', 500);
  }
  if (existing?.file_path) await admin.storage.from(DOWNLOAD_BUCKET).remove([existing.file_path]);
  return NextResponse.json({ success: true, message: 'Deleted.' });
}
