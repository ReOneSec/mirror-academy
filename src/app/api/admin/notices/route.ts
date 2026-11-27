import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/adminAuth';
import {
  NOTICE_BUCKET,
  NOTICE_BODY_MAX,
  NOTICE_COLUMNS,
  NOTICE_COLUMNS_V1,
  NOTICE_FILE_TYPES,
  NOTICE_MAX_BYTES,
  NOTICE_TITLE_MAX,
  cleanLink,
  toNotice,
  type NoticeRow,
} from '@/lib/notices';
import { isIsoDate } from '@/lib/dates';

const NEEDS_006 = 'Run migration 006 in Supabase to use end dates.';

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

const unauthorized = () => fail('Unauthorized. Please sign in.', 401);

export async function GET(request: NextRequest) {
  if (!(await getAuthenticatedUser(request))) return unauthorized();
  try {
    const admin = createAdminClient();
    const query = (columns: string) =>
      admin.from('notices').select(columns).order('pinned', { ascending: false }).order('created_at', { ascending: false });
    let { data, error } = await query(NOTICE_COLUMNS);
    if (error) ({ data, error } = await query(NOTICE_COLUMNS_V1)); // migration 006 not run yet
    if (error) {
      console.error('Notices query error:', error);
      return fail('Failed to load notices. Has migration 004 been run?', 500);
    }
    return NextResponse.json({ success: true, notices: (data as unknown as NoticeRow[]).map(toNotice) });
  } catch (err) {
    console.error('Notices GET error:', err);
    return fail('Internal server error.', 500);
  }
}

/** New notice: multipart form with title, body, linkUrl, pinned, published and an optional file. */
export async function POST(request: NextRequest) {
  if (!(await getAuthenticatedUser(request))) return unauthorized();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail('Could not read the form. Is the file under 4 MB?', 400);
  }

  const title = String(form.get('title') ?? '').trim();
  const body = String(form.get('body') ?? '').trim();
  const link = cleanLink(form.get('linkUrl'));
  const pinned = form.get('pinned') === 'true';
  const published = form.get('published') !== 'false';
  const file = form.get('file');
  const expiresRaw = String(form.get('expiresOn') ?? '').trim();

  if (!title) return fail('Add a title.', 400);
  if (title.length > NOTICE_TITLE_MAX) return fail(`Keep the title under ${NOTICE_TITLE_MAX} characters.`, 400);
  if (body.length > NOTICE_BODY_MAX) return fail(`Keep the notice under ${NOTICE_BODY_MAX} characters.`, 400);
  if (link === 'invalid') return fail('The link must start with https:// or http://.', 400);
  if (expiresRaw && !isIsoDate(expiresRaw)) return fail('Pick a valid end date.', 400);

  const admin = createAdminClient();
  let attachment: { path: string; name: string; type: string } | null = null;

  if (file instanceof File && file.size > 0) {
    if (!(NOTICE_FILE_TYPES as readonly string[]).includes(file.type)) {
      return fail('Attach a PDF, JPG, PNG or WebP file.', 400);
    }
    if (file.size > NOTICE_MAX_BYTES) return fail('The file must be 4 MB or smaller.', 400);

    const safeName =
      file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(-80) || 'file';
    const path = `${new Date().getFullYear()}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await admin.storage
      .from(NOTICE_BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
    if (uploadError) {
      console.error('Notice upload error:', uploadError);
      return fail('Could not upload the file. Has migration 004 been run?', 500);
    }
    attachment = { path, name: file.name.slice(0, 200), type: file.type };
  }

  const { data, error } = await admin
    .from('notices')
    .insert({
      title,
      body: body || null,
      link_url: link,
      attachment_path: attachment?.path ?? null,
      attachment_name: attachment?.name ?? null,
      attachment_type: attachment?.type ?? null,
      pinned,
      published,
      ...(expiresRaw ? { expires_on: expiresRaw } : {}),
    })
    .select(expiresRaw ? NOTICE_COLUMNS : NOTICE_COLUMNS_V1)
    .single();

  if (error || !data) {
    console.error('Notice insert error:', error);
    if (attachment) await admin.storage.from(NOTICE_BUCKET).remove([attachment.path]);
    return fail(expiresRaw && error?.code === '42703' ? NEEDS_006 : 'Could not save the notice.', 500);
  }
  return NextResponse.json({ success: true, notice: toNotice(data as unknown as NoticeRow), message: 'Notice posted.' });
}

/** Edit: JSON with id and any of title, body, linkUrl, pinned, published. */
export async function PATCH(request: NextRequest) {
  if (!(await getAuthenticatedUser(request))) return unauthorized();

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return fail('Invalid request.', 400);
  }
  const id = typeof input.id === 'string' ? input.id : '';
  if (!id) return fail('Missing notice id.', 400);

  const update: Record<string, unknown> = {};
  if ('title' in input) {
    const title = String(input.title ?? '').trim();
    if (!title || title.length > NOTICE_TITLE_MAX) return fail('Title must be 1 to 150 characters.', 400);
    update.title = title;
  }
  if ('body' in input) {
    const body = String(input.body ?? '').trim();
    if (body.length > NOTICE_BODY_MAX) return fail(`Keep the notice under ${NOTICE_BODY_MAX} characters.`, 400);
    update.body = body || null;
  }
  if ('linkUrl' in input) {
    const link = cleanLink(input.linkUrl);
    if (link === 'invalid') return fail('The link must start with https:// or http://.', 400);
    update.link_url = link;
  }
  if (typeof input.pinned === 'boolean') update.pinned = input.pinned;
  if (typeof input.published === 'boolean') update.published = input.published;
  if ('expiresOn' in input) {
    if (input.expiresOn === null || input.expiresOn === '') update.expires_on = null;
    else if (isIsoDate(input.expiresOn)) update.expires_on = input.expiresOn;
    else return fail('Pick a valid end date.', 400);
  }
  if (Object.keys(update).length === 0) return fail('Nothing to update.', 400);
  update.updated_at = new Date().toISOString();

  const { data, error } = await createAdminClient()
    .from('notices')
    .update(update)
    .eq('id', id)
    .select('expires_on' in update ? NOTICE_COLUMNS : NOTICE_COLUMNS_V1)
    .single();
  if (error || !data) {
    console.error('Notice update error:', error);
    return fail('expires_on' in update && error?.code === '42703' ? NEEDS_006 : 'Could not update the notice.', 500);
  }
  return NextResponse.json({ success: true, notice: toNotice(data as unknown as NoticeRow), message: 'Notice updated.' });
}

export async function DELETE(request: NextRequest) {
  if (!(await getAuthenticatedUser(request))) return unauthorized();
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return fail('Missing notice id.', 400);

  const admin = createAdminClient();
  const { data: existing } = await admin.from('notices').select('attachment_path').eq('id', id).maybeSingle();
  const { error } = await admin.from('notices').delete().eq('id', id);
  if (error) {
    console.error('Notice delete error:', error);
    return fail('Could not delete the notice.', 500);
  }
  if (existing?.attachment_path) {
    await admin.storage.from(NOTICE_BUCKET).remove([existing.attachment_path]);
  }
  return NextResponse.json({ success: true, message: 'Notice deleted.' });
}
