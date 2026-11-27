import Link from 'next/link';
import { articleExcerpt, formatArticleDate } from '@/lib/articles';
import type { Article } from '@/types';

export default function ArticleCards({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return <p className="nb-empty">No articles yet. Exam patterns and syllabi will appear here.</p>;
  }
  return (
    <ul className="art-cards">
      {articles.map((a) => (
        <li key={a.id}>
          <Link href={`/articles/${a.slug}`} className="art-card">
            <span className="nb-meta">
              <time dateTime={a.createdAt}>{formatArticleDate(a.createdAt)}</time>
              {a.category && <span className="chip">{a.category}</span>}
            </span>
            <span className="art-card__title">{a.title}</span>
            <span className="art-card__excerpt">{articleExcerpt(a, 160)}</span>
            <span className="art-card__more">Read article →</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
