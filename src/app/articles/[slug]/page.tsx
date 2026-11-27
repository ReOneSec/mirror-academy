import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import SubpageHeader from '@/components/SubpageHeader';
import Footer from '@/components/Footer';
import ArticleBody from '@/components/ArticleBody';
import { getArticle } from '@/lib/articlesData';
import { articleExcerpt, formatArticleDate } from '@/lib/articles';
import { SITE } from '@/lib/constants';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Article not found | Mirror Academy' };
  const description = articleExcerpt(article, 160);
  return {
    title: `${article.title} | Mirror Academy`,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: { title: article.title, description, type: 'article', url: `/articles/${article.slug}` },
  };
}

async function ArticleView({ params }: { params: Params }) {
  await connection();
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    publisher: { '@type': 'EducationalOrganization', name: SITE.name },
  };

  return (
    <article className="art" aria-labelledby="art-title">
      <div className="nb-meta">
        <time dateTime={article.createdAt}>{formatArticleDate(article.createdAt)}</time>
        {article.category && <span className="chip">{article.category}</span>}
      </div>
      <h1 id="art-title" className="art-h1">
        {article.title}
      </h1>
      <ArticleBody text={article.body} />
      <div className="links art-foot">
        <Link href="/#registration" className="btn btn--primary">
          Register for a batch
        </Link>
        <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn">
          Ask on WhatsApp
        </a>
        <Link href="/articles" className="btn">
          More articles
        </Link>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    </article>
  );
}

export default function ArticlePage({ params }: { params: Params }) {
  return (
    <div className="page" id="top">
      <SubpageHeader />
      <main id="main-content" className="main">
        <section className="section">
          <Suspense fallback={<p className="nb-empty">Loading article…</p>}>
            <ArticleView params={params} />
          </Suspense>
        </section>
      </main>
      <Footer linkBase="/" />
    </div>
  );
}
