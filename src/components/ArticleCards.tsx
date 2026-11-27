import Link from 'next/link';
import { articleExcerpt } from '@/lib/articles';
import { formatDate, getDict, type Lang } from '@/lib/i18n';
import type { Article } from '@/types';

export default function ArticleCards({ articles, lang = 'en' }: { articles: Article[]; lang?: Lang }) {
  const t = getDict(lang).articles;
  if (articles.length === 0) {
    return <p className="nb-empty">{t.empty}</p>;
  }
  return (
    <ul className="art-cards">
      {articles.map((a) => (
        <li key={a.id}>
          <Link href={`/articles/${a.slug}`} className="art-card">
            <span className="nb-meta">
              <time dateTime={a.createdAt}>{formatDate(lang, a.createdAt)}</time>
              {a.category && <span className="chip">{a.category}</span>}
            </span>
            <span className="art-card__title">{a.title}</span>
            <span className="art-card__excerpt">{articleExcerpt(a, 160)}</span>
            <span className="art-card__more">{t.read}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
