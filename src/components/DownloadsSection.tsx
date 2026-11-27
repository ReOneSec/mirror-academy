import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import DownloadList from '@/components/DownloadList';
import { listDownloads } from '@/lib/downloadsData';
import { getDict, type Lang } from '@/lib/i18n';

async function Latest({ lang }: { lang: Lang }) {
  await connection();
  const items = await listDownloads(30);
  return (
    <div className="scrollbox" data-scrollbox tabIndex={0} aria-label={getDict(lang).downloads.heading}>
      <DownloadList items={items} lang={lang} />
    </div>
  );
}

export default function DownloadsSection({ lang = 'en' }: { lang?: Lang }) {
  const t = getDict(lang).downloads;
  return (
    <section id="downloads" className="section" aria-labelledby="downloads-heading">
      <div className="head">
        <p className="head__eyebrow">{t.eyebrow}</p>
        <h2 id="downloads-heading">{t.heading}</h2>
      </div>
      <Suspense fallback={<p className="nb-empty">{t.loading}</p>}>
        <Latest lang={lang} />
      </Suspense>
      <p>
        <Link href="/downloads" className="btn">
          {t.all}
        </Link>
      </p>
    </section>
  );
}
