import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import ArticleCards from '@/components/ArticleCards';
import { listArticles } from '@/lib/articlesData';

async function Latest() {
  await connection();
  const articles = await listArticles(3);
  return <ArticleCards articles={articles} />;
}

export default function ArticlesSection() {
  return (
    <section id="articles" className="section" aria-labelledby="articles-heading">
      <div className="head">
        <p className="head__eyebrow">Articles</p>
        <h2 id="articles-heading">Exam patterns, syllabi and guides.</h2>
      </div>
      <Suspense fallback={<p className="nb-empty">Loading articles…</p>}>
        <Latest />
      </Suspense>
      <p>
        <Link href="/articles" className="btn">
          All articles
        </Link>
      </p>
    </section>
  );
}
