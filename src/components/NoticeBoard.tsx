import { Suspense } from 'react';
import { connection } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { FALLBACK_NOTICES, NOTICE_COLUMNS, formatNoticeDate, toNotice, type NoticeRow } from '@/lib/notices';
import type { Notice } from '@/types';

const NEW_FOR_MS = 7 * 24 * 60 * 60 * 1000;

async function loadNotices(): Promise<Notice[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await supabase
      .from('notices')
      .select(NOTICE_COLUMNS)
      .eq('published', true)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(12);
    if (error) {
      console.error('Public notices error:', error);
      return null;
    }
    return (data as NoticeRow[]).map(toNotice);
  } catch (err) {
    console.error('Public notices error:', err);
    return null;
  }
}

async function getBoard() {
  const notices = (await loadNotices()) ?? FALLBACK_NOTICES;
  return { notices, now: Date.now() };
}

function NoticeItem({ notice, now }: { notice: Notice; now: number }) {
  const isNew = now - new Date(notice.createdAt).getTime() < NEW_FOR_MS;
  const isImage = notice.attachmentType?.startsWith('image/');
  return (
    <li className="nb-item" data-pinned={notice.pinned || undefined}>
      <div className="nb-meta">
        <time dateTime={notice.createdAt}>{formatNoticeDate(notice.createdAt)}</time>
        {notice.pinned && <span className="chip chip--solid">Pinned</span>}
        {!notice.pinned && isNew && <span className="chip nb-new">New</span>}
      </div>
      <h3 className="nb-title">{notice.title}</h3>
      {notice.body && <p className="nb-body">{notice.body}</p>}
      {isImage && notice.attachmentUrl && (
        <a href={notice.attachmentUrl} target="_blank" rel="noopener noreferrer" className="nb-img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={notice.attachmentUrl} alt={notice.title} loading="lazy" />
        </a>
      )}
      {(notice.attachmentUrl || notice.linkUrl) && (
        <div className="links nb-links">
          {notice.attachmentUrl && !isImage && (
            <a href={notice.attachmentUrl} target="_blank" rel="noopener noreferrer" className="btn">
              Open PDF
            </a>
          )}
          {notice.linkUrl && (
            <a href={notice.linkUrl} target="_blank" rel="noopener noreferrer" className="btn">
              Open link
            </a>
          )}
        </div>
      )}
    </li>
  );
}

async function NoticeList() {
  await connection();
  const { notices, now } = await getBoard();
  if (notices.length === 0) {
    return <p className="nb-empty">No notices right now. New announcements will appear here.</p>;
  }
  return (
    <ol className="nb-list">
      {notices.map((n) => (
        <NoticeItem key={n.id} notice={n} now={now} />
      ))}
    </ol>
  );
}

export default function NoticeBoard() {
  return (
    <section id="notices" className="section" aria-labelledby="notices-heading">
      <div className="head">
        <p className="head__eyebrow">Notice board</p>
        <h2 id="notices-heading">Latest announcements.</h2>
      </div>
      <Suspense fallback={<p className="nb-empty">Loading notices…</p>}>
        <NoticeList />
      </Suspense>
    </section>
  );
}
