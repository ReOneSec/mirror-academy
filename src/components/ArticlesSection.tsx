import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import ArticleCards from '@/components/ArticleCards';
import { listArticles } from '@/lib/articlesData';
import { getDict, type Lang } from '@/lib/i18n';

async function Latest({ lang }: { lang: Lang }) {
  await connection();
  const articles = await listArticles(12);
  return (
    <div className="scrollbox" data-scrollbox tabIndex={0} aria-label={getDict(lang).articles.heading}>
      <ArticleCards articles={articles} lang={lang} />
    </div>
  );
}

export default function ArticlesSection({ lang = 'en' }: { lang?: Lang }) {
  const t = getDict(lang).articles;
  return (
    <section id="articles" className="section" aria-labelledby="articles-heading">
      <div className="head">
        <p className="head__eyebrow">{t.eyebrow}</p>
        <h2 id="articles-heading">{t.heading}</h2>
      </div>
      <Suspense fallback={<p className="nb-empty">{t.loading}</p>}>
        <Latest lang={lang} />
      </Suspense>
      <p>
        <Link href="/articles" className="btn">
          {t.all}
        </Link>
      </p>
    </section>
  );
}
