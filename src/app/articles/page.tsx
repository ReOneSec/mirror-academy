import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import SubpageHeader from '@/components/SubpageHeader';
import Footer from '@/components/Footer';
import ArticleCards from '@/components/ArticleCards';
import { listArticles } from '@/lib/articlesData';

export const metadata: Metadata = {
  title: 'Articles | Mirror Academy, Berhampore',
  description: 'Exam patterns, syllabi and guides for WBCS, WBPSC, SSC, police and other exams from Mirror Academy, Berhampore.',
  alternates: { canonical: '/articles' },
};

async function AllArticles() {
  await connection();
  const articles = await listArticles(100);
  return <ArticleCards articles={articles} />;
}

export default function ArticlesPage() {
  return (
    <div className="page" id="top">
      <SubpageHeader />
      <main id="main-content" className="main">
        <section className="section" aria-labelledby="articles-heading">
          <div className="head">
            <p className="head__eyebrow">Articles</p>
            <h1 id="articles-heading" className="art-h1">Exam patterns, syllabi and guides.</h1>
          </div>
          <Suspense fallback={<p className="nb-empty">Loading articles…</p>}>
            <AllArticles />
          </Suspense>
        </section>
      </main>
      <Footer linkBase="/" />
    </div>
  );
}
