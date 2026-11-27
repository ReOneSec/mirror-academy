import { Suspense } from 'react';
import { connection } from 'next/server';
import { loadNotices } from '@/components/NoticeBoard';
import UpdatesDialog, { type PopupDate, type PopupNotice } from '@/components/UpdatesDialog';
import { FALLBACK_NOTICES, isNoticeLive } from '@/lib/notices';
import { listUpcomingEvents } from '@/lib/examEventsData';
import { daysBetween, todayIST } from '@/lib/dates';
import { formatDate, getDict, type Lang } from '@/lib/i18n';

const NEW_FOR_DAYS = 7;

async function Content({ lang }: { lang: Lang }) {
  await connection();
  const today = todayIST();
  const t = getDict(lang);
  const [noticeRows, eventRows] = await Promise.all([loadNotices(), listUpcomingEvents(today, 3)]);
  const notices: PopupNotice[] = (noticeRows ?? FALLBACK_NOTICES)
    .filter((n) => isNoticeLive(n, today))
    .slice(0, 3)
    .map((n) => ({
      id: n.id,
      title: n.title,
      date: formatDate(lang, n.createdAt),
      isNew: daysBetween(n.createdAt.slice(0, 10), today) < NEW_FOR_DAYS,
    }));
  const dates: PopupDate[] = eventRows.map((e) => {
    const left = daysBetween(today, e.startsOn);
    return {
      id: e.id,
      exam: e.exam,
      kind: t.calendar.kinds[e.kind],
      date: formatDate(lang, e.startsOn),
      when: left <= 0 ? t.calendar.ongoing : t.calendar.daysLeft(left),
    };
  });
  if (notices.length === 0 && dates.length === 0) return null;
  return <UpdatesDialog lang={lang} notices={notices} dates={dates} today={today} />;
}

/** On page load, a popup with the latest notices and the next exam dates. */
export default function UpdatesPopup({ lang = 'en' }: { lang?: Lang }) {
  return (
    <Suspense fallback={null}>
      <Content lang={lang} />
    </Suspense>
  );
}
