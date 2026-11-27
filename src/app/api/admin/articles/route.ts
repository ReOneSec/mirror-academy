import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/adminAuth';
import {
  ARTICLE_BODY_MAX,
  ARTICLE_CATEGORY_MAX,
  ARTICLE_COLUMNS,
  ARTICLE_SUMMARY_MAX,
  ARTICLE_TITLE_MAX,
  slugBase,
  toArticle,
  type ArticleRow,
} from '@/lib/articles';

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}
const unauthorized = () => fail('Unauthorized. Please sign in.', 401);

type Fields = { title?: string; category?: string | null; summary?: string | null; body?: string; published?: boolean };

/** Validates the editable fields present in the input. Returns an error message or the cleaned fields. */
function readFields(input: Record<string, unknown>, requireAll: boolean): string | Fields {
  const out: Fields = {};
  if (requireAll || 'title' in input) {
    const title = String(input.title ?? '').trim();
    if (!title) return 'Add a title.';
    if (title.length > ARTICLE_TITLE_MAX) return `Keep the title under ${ARTICLE_TITLE_MAX} characters.`;
    out.title = title;
  }
  if (requireAll || 'body' in input) {
    const body = String(input.body ?? '').replace(/\r\n?/g, '\n').trim();
    if (!body) return 'Write the article.';
    if (body.length > ARTICLE_BODY_MAX) return `Keep the article under ${ARTICLE_BODY_MAX} characters.`;
    out.body = body;
  }
  if ('category' in input) {
    const category = String(input.category ?? '').trim();
    if (category.length > ARTICLE_CATEGORY_MAX) return `Keep the category under ${ARTICLE_CATEGORY_MAX} characters.`;
    out.category = category || null;
  }
  if ('summary' in input) {
    const summary = String(input.summary ?? '').trim();
    if (summary.length > ARTICLE_SUMMARY_MAX) return `Keep the summary under ${ARTICLE_SUMMARY_MAX} characters.`;
    out.summary = summary || null;
  }
  if (typeof input.published === 'boolean') out.published = input.published;
  return out;
}

async function readJson(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const data = await request.json();
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  if (!(await getAuthenticatedUser(request))) return unauthorized();
  try {
    const { data, error } = await createAdminClient()
      .from('articles')
      .select(ARTICLE_COLUMNS)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Articles query error:', error);
      return fail('Failed to load articles. Has migration 005 been run?', 500);
    }
    return NextResponse.json({ success: true, articles: (data as ArticleRow[]).map(toArticle) });
  } catch (err) {
    console.error('Articles GET error:', err);
    return fail('Internal server error.', 500);
  }
}

export async function POST(request: NextRequest) {
  if (!(await getAuthenticatedUser(request))) return unauthorized();
  const input = await readJson(request);
  if (!input) return fail('Invalid request.', 400);
  const fields = readFields(input, true);
  if (typeof fields === 'string') return fail(fields, 400);

  const admin = createAdminClient();
  const base = slugBase(fields.title!);
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = attempt === 0 && base !== 'article' ? base : `${base}-${crypto.randomUUID().slice(0, 6)}`;
    const { data, error } = await admin
      .from('articles')
      .insert({ ...fields, slug, published: fields.published ?? true })
      .select(ARTICLE_COLUMNS)
      .single();
    if (!error && data) {
      return NextResponse.json({ success: true, article: toArticle(data as ArticleRow), message: 'Article published.' });
    }
    if (error?.code !== '23505') {
      console.error('Article insert error:', error);
      return fail('Could not save the article. Has migration 005 been run?', 500);
    }
  }
  return fail('Could not create a unique link for this article. Change the title slightly.', 409);
}

export async function PATCH(request: NextRequest) {
  if (!(await getAuthenticatedUser(request))) return unauthorized();
  const input = await readJson(request);
  if (!input) return fail('Invalid request.', 400);
  const id = typeof input.id === 'string' ? input.id : '';
  if (!id) return fail('Missing article id.', 400);
  const fields = readFields(input, false);
  if (typeof fields === 'string') return fail(fields, 400);
  if (Object.keys(fields).length === 0) return fail('Nothing to update.', 400);

  const { data, error } = await createAdminClient()
    .from('articles')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(ARTICLE_COLUMNS)
    .single();
  if (error || !data) {
    console.error('Article update error:', error);
    return fail('Could not update the article.', 500);
  }
  return NextResponse.json({ success: true, article: toArticle(data as ArticleRow), message: 'Article updated.' });
}

export async function DELETE(request: NextRequest) {
  if (!(await getAuthenticatedUser(request))) return unauthorized();
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return fail('Missing article id.', 400);
  const { error } = await createAdminClient().from('articles').delete().eq('id', id);
  if (error) {
    console.error('Article delete error:', error);
    return fail('Could not delete the article.', 500);
  }
  return NextResponse.json({ success: true, message: 'Article deleted.' });
}
