import { Suspense } from 'react';
import { connection } from 'next/server';
import { createPublicClient } from '@/lib/supabase/public';
import {
  FALLBACK_NOTICES,
  NOTICE_COLUMNS,
  NOTICE_COLUMNS_V1,
  isNoticeLive,
  toNotice,
  type NoticeRow,
} from '@/lib/notices';
import { todayIST } from '@/lib/dates';
import { formatDate, getDict, homePath, type Lang } from '@/lib/i18n';
import ShareWhatsApp from '@/components/ShareWhatsApp';
import type { Notice } from '@/types';

const NEW_FOR_MS = 7 * 24 * 60 * 60 * 1000;

export async function loadNotices(): Promise<Notice[] | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  try {
    // Fetch a few extra so expired ones can be dropped and 12 still show.
    const query = (columns: string) =>
      supabase
        .from('notices')
        .select(columns)
        .eq('published', true)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(30);
    let { data, error } = await query(NOTICE_COLUMNS);
    if (error) ({ data, error } = await query(NOTICE_COLUMNS_V1)); // migration 006 not run yet
    if (error) {
      console.error('Public notices error:', error);
      return null;
    }
    return (data as unknown as NoticeRow[]).map(toNotice);
  } catch (err) {
    console.error('Public notices error:', err);
    return null;
  }
}

function NoticeItem({ notice, now, lang }: { notice: Notice; now: number; lang: Lang }) {
  const t = getDict(lang);
  const isNew = now - new Date(notice.createdAt).getTime() < NEW_FOR_MS;
  const isImage = notice.attachmentType?.startsWith('image/');
  const shareText = [notice.title, notice.body, notice.attachmentUrl ?? notice.linkUrl].filter(Boolean).join('\n');
  return (
    <li className="nb-item" data-pinned={notice.pinned || undefined}>
      <div className="nb-meta">
        <time dateTime={notice.createdAt}>{formatDate(lang, notice.createdAt)}</time>
        {notice.pinned && <span className="chip chip--solid">{t.notices.pinned}</span>}
        {!notice.pinned && isNew && <span className="chip nb-new">{t.notices.new}</span>}
      </div>
      <h3 className="nb-title">{notice.title}</h3>
      {notice.body && <p className="nb-body">{notice.body}</p>}
      {isImage && notice.attachmentUrl && (
        <a href={notice.attachmentUrl} target="_blank" rel="noopener noreferrer" className="nb-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={notice.attachmentUrl} alt={notice.title} loading="lazy" />
        </a>
      )}
      <div className="links nb-links">
        {notice.attachmentUrl && !isImage && (
          <a href={notice.attachmentUrl} target="_blank" rel="noopener noreferrer" className="btn">
            {t.notices.openPdf}
          </a>
        )}
        {notice.linkUrl && (
          <a href={notice.linkUrl} target="_blank" rel="noopener noreferrer" className="btn">
            {t.notices.openLink}
          </a>
        )}
        <ShareWhatsApp text={shareText} path={`${homePath(lang)}#notices`} label={t.share.short} />
      </div>
    </li>
  );
}

/** Read at request time (after connection()). */
function clock() {
  return { today: todayIST(), now: Date.now() };
}

async function NoticeList({ lang }: { lang: Lang }) {
  await connection();
  const { today, now } = clock();
  const notices = ((await loadNotices()) ?? FALLBACK_NOTICES).filter((n) => isNoticeLive(n, today)).slice(0, 20);
  if (notices.length === 0) {
    return <p className="nb-empty">{getDict(lang).notices.empty}</p>;
  }
  return (
    <div className="scrollbox" data-scrollbox tabIndex={0} aria-label={getDict(lang).notices.heading}>
      <ol className="nb-list">
        {notices.map((n) => (
          <NoticeItem key={n.id} notice={n} now={now} lang={lang} />
        ))}
      </ol>
    </div>
  );
}

export default function NoticeBoard({ lang = 'en' }: { lang?: Lang }) {
  const t = getDict(lang).notices;
  return (
    <section id="notices" className="section" aria-labelledby="notices-heading">
      <div className="head">
        <p className="head__eyebrow">{t.eyebrow}</p>
        <h2 id="notices-heading">{t.heading}</h2>
      </div>
      <Suspense fallback={<p className="nb-empty">{t.loading}</p>}>
        <NoticeList lang={lang} />
      </Suspense>
    </section>
  );
}
