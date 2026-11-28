import type { Article } from '@/types';

export const ARTICLE_TITLE_MAX = 200;
export const ARTICLE_CATEGORY_MAX = 60;
export const ARTICLE_SUMMARY_MAX = 400;
export const ARTICLE_BODY_MAX = 30000;
export const ARTICLE_SLUG_MAX = 80;
/** Same rule as the database check: lowercase letters and digits, single hyphens between words. */
export const ARTICLE_SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Tidies what an admin types into a slug: lowercase, spaces and underscores to hyphens, other marks dropped. */
export function cleanSlugInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/g, '')
    .slice(0, ARTICLE_SLUG_MAX);
}

/** Suggested slug for an English title; empty for a title with Bengali or other non-English letters. */
export function suggestSlug(title: string): string {
  if (/[^\x00-\x7F]/.test(title)) return '';
  const base = slugBase(title);
  return base === 'article' ? '' : base;
}

/** Error message for a slug, or null when it is fine. */
export function slugProblem(slug: string): string | null {
  if (slug.length > ARTICLE_SLUG_MAX) return `Keep the link under ${ARTICLE_SLUG_MAX} characters.`;
  if (!ARTICLE_SLUG_RE.test(slug))
    return 'Use only English lowercase letters, numbers and single hyphens, with no hyphen at the start or end.';
  return null;
}

export const ARTICLE_COLUMNS = 'id, slug, title, category, summary, body, published, created_at, updated_at';

export interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  summary: string | null;
  body: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export function toArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    body: row.body,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** URL slug from the title's English letters and digits; Bengali-only titles get "article". */
export function slugBase(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return base.length >= 3 ? base : 'article';
}

/** Plain text for cards and meta descriptions: formatting marks removed, whitespace collapsed. */
export function plainText(body: string, max = 180): string {
  const text = body
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^-{3,}\s*$/gm, ' ')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/\*+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trim()}…`;
}

export function articleExcerpt(a: Pick<Article, 'summary' | 'body'>, max = 180): string {
  return a.summary?.trim() ? plainText(a.summary, max) : plainText(a.body, max);
}

export function formatArticleDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}
