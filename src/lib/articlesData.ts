import { createPublicClient } from '@/lib/supabase/public';
import { ARTICLE_COLUMNS, toArticle, type ArticleRow } from '@/lib/articles';
import { FALLBACK_ARTICLES } from '@/lib/articlesFallback';
import type { Article } from '@/types';

/** Published articles, newest first. Falls back to the seed article when the table can't be read. */
export async function listArticles(limit = 50): Promise<Article[]> {
  const supabase = createPublicClient();
  if (!supabase) return FALLBACK_ARTICLES.slice(0, limit);
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(ARTICLE_COLUMNS)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('Public articles error:', error);
      return FALLBACK_ARTICLES.slice(0, limit);
    }
    return (data as ArticleRow[]).map(toArticle);
  } catch (err) {
    console.error('Public articles error:', err);
    return FALLBACK_ARTICLES.slice(0, limit);
  }
}

/**
 * The current slug for an old article link, when the article's slug was changed (migration 008).
 * Returns null when there is no redirect, the article is hidden, or the table is not there yet.
 */
export async function findArticleRedirect(slug: string): Promise<string | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('article_slug_redirects')
      .select('article_id')
      .eq('old_slug', slug)
      .maybeSingle();
    if (error || !data) return null;
    const { data: row } = await supabase
      .from('articles')
      .select('slug')
      .eq('id', (data as { article_id: string }).article_id)
      .eq('published', true)
      .maybeSingle();
    const next = (row as { slug: string } | null)?.slug;
    return next && next !== slug ? next : null;
  } catch {
    return null;
  }
}

export async function getArticle(slug: string): Promise<Article | null> {
  const fallback = FALLBACK_ARTICLES.find((a) => a.slug === slug) ?? null;
  const supabase = createPublicClient();
  if (!supabase) return fallback;
  try {
    const { data, error } = await supabase
      .from('articles')
      .select(ARTICLE_COLUMNS)
      .eq('published', true)
      .eq('slug', slug)
      .maybeSingle();
    if (error) {
      console.error('Public article error:', error);
      return fallback;
    }
    return data ? toArticle(data as ArticleRow) : null;
  } catch (err) {
    console.error('Public article error:', err);
    return fallback;
  }
}
