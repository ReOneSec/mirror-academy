import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/adminAuth';
import { DOWNLOAD_BUCKET, DOWNLOAD_FILE_TYPES, DOWNLOAD_MAX_BYTES, uploadPath } from '@/lib/downloads';

/**
 * Step 1 of an upload: returns a one-time signed URL token so the browser uploads the file
 * straight to Supabase Storage. This skips Vercel's ~4.5 MB request limit, so large PDFs work.
 */
export async function POST(request: NextRequest) {
  if (!(await getAuthenticatedUser(request))) {
    return NextResponse.json({ success: false, message: 'Unauthorized. Please sign in.' }, { status: 401 });
  }
  let input: { name?: unknown; type?: unknown; size?: unknown };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request.' }, { status: 400 });
  }
  const name = String(input.name ?? '');
  const type = String(input.type ?? '');
  const size = Number(input.size ?? 0);
  if (!name) return NextResponse.json({ success: false, message: 'Choose a file.' }, { status: 400 });
  if (!DOWNLOAD_FILE_TYPES.includes(type)) {
    return NextResponse.json({ success: false, message: 'Upload a PDF, JPG, PNG or WebP file.' }, { status: 400 });
  }
  if (!(size > 0) || size > DOWNLOAD_MAX_BYTES) {
    return NextResponse.json({ success: false, message: 'The file must be 25 MB or smaller.' }, { status: 400 });
  }

  const path = uploadPath(name);
  const { data, error } = await createAdminClient().storage.from(DOWNLOAD_BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    console.error('Signed upload URL error:', error);
    return NextResponse.json(
      { success: false, message: 'Could not start the upload. Has migration 006 been run in Supabase?' },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true, path: data.path, token: data.token });
}
