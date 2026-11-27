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
