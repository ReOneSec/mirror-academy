import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import SubpageHeader from '@/components/SubpageHeader';
import Footer from '@/components/Footer';
import DownloadList from '@/components/DownloadList';
import { listDownloads } from '@/lib/downloadsData';
import { getDict } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Downloads | Mirror Academy, Berhampore',
  description: 'Syllabus PDFs, previous year question papers, study material and official notifications from Mirror Academy, Berhampore.',
  alternates: { canonical: '/downloads' },
};

async function All() {
  await connection();
  return <DownloadList items={await listDownloads()} lang="en" headingLevel={2} />;
}

export default function DownloadsPage() {
  const t = getDict('en').downloads;
  return (
    <div className="page" id="top">
      <SubpageHeader />
      <main id="main-content" className="main">
        <section className="section" aria-labelledby="downloads-heading">
          <div className="head">
            <p className="head__eyebrow">{t.eyebrow}</p>
            <h1 id="downloads-heading" className="art-h1">
              {t.heading}
            </h1>
          </div>
          <Suspense fallback={<p className="nb-empty">{t.loading}</p>}>
            <All />
          </Suspense>
        </section>
      </main>
      <Footer linkBase="/" />
    </div>
  );
}
