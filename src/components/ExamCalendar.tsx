import { Suspense } from 'react';
import { connection } from 'next/server';
import { createPublicClient } from '@/lib/supabase/public';
import { EXAM_EVENT_COLUMNS, FALLBACK_EXAM_EVENTS, isUpcoming, toExamEvent, type ExamEventRow } from '@/lib/examEvents';
import { daysBetween, todayIST } from '@/lib/dates';
import { formatDate, getDict, type Lang } from '@/lib/i18n';
import type { ExamEvent } from '@/types';

async function loadEvents(today: string): Promise<ExamEvent[]> {
  const supabase = createPublicClient();
  if (!supabase) return FALLBACK_EXAM_EVENTS;
  try {
    const { data, error } = await supabase
      .from('exam_events')
      .select(EXAM_EVENT_COLUMNS)
      .eq('published', true)
      .or(`starts_on.gte.${today},ends_on.gte.${today}`)
      .order('starts_on', { ascending: true })
      .limit(12);
    if (error) {
      console.error('Public exam events error:', error);
      return FALLBACK_EXAM_EVENTS;
    }
    return (data as ExamEventRow[]).map(toExamEvent);
  } catch (err) {
    console.error('Public exam events error:', err);
    return FALLBACK_EXAM_EVENTS;
  }
}

function When({ e, today, lang }: { e: ExamEvent; today: string; lang: Lang }) {
  const t = getDict(lang).calendar;
  if (e.startsOn === today && !e.endsOn) return <span className="chip chip--solid">{t.today}</span>;
  if (e.startsOn <= today) return <span className="chip chip--solid">{t.ongoing}</span>;
  return <span className="chip">{t.daysLeft(daysBetween(today, e.startsOn))}</span>;
}

function EventRow({ e, today, lang }: { e: ExamEvent; today: string; lang: Lang }) {
  const t = getDict(lang).calendar;
  const start = new Date(`${e.startsOn}T00:00:00+05:30`);
  const day = start.toLocaleDateString(lang === 'bn' ? 'bn-IN' : 'en-IN', { day: 'numeric', timeZone: 'Asia/Kolkata' });
  const month = start.toLocaleDateString(lang === 'bn' ? 'bn-IN' : 'en-IN', { month: 'short', timeZone: 'Asia/Kolkata' });
  const range = e.endsOn && e.endsOn !== e.startsOn
    ? `${formatDate(lang, e.startsOn)} – ${formatDate(lang, e.endsOn)}`
    : formatDate(lang, e.startsOn, { weekday: 'short' });
  return (
    <li className="cal-item" data-kind={e.kind}>
      <time className="cal-date" dateTime={e.startsOn} aria-hidden="true">
        <span className="cal-date__day">{day}</span>
        <span className="cal-date__month">{month}</span>
      </time>
      <div className="cal-body">
        <div className="nb-meta">
          <span className="chip cal-kind">{t.kinds[e.kind]}</span>
          <When e={e} today={today} lang={lang} />
        </div>
        <h3 className="cal-title">{e.exam}</h3>
        <p className="cal-when">{range}</p>
        {e.note && <p className="nb-body">{e.note}</p>}
      </div>
      {e.linkUrl && (
        <a href={e.linkUrl} target="_blank" rel="noopener noreferrer" className="btn cal-link">
          {t.official}
        </a>
      )}
    </li>
  );
}

async function EventList({ lang }: { lang: Lang }) {
  await connection();
  const today = todayIST();
  const events = (await loadEvents(today)).filter((e) => isUpcoming(e, today));
  if (events.length === 0) return <p className="nb-empty">{getDict(lang).calendar.empty}</p>;
  return (
    <ol className="cal-list">
      {events.map((e) => (
        <EventRow key={e.id} e={e} today={today} lang={lang} />
      ))}
    </ol>
  );
}

export default function ExamCalendar({ lang = 'en' }: { lang?: Lang }) {
  const t = getDict(lang).calendar;
  return (
    <section id="calendar" className="section" aria-labelledby="calendar-heading">
      <div className="head">
        <p className="head__eyebrow">{t.eyebrow}</p>
        <h2 id="calendar-heading">{t.heading}</h2>
        <p className="head__sub">{t.sub}</p>
      </div>
      <Suspense fallback={<p className="nb-empty">{t.loading}</p>}>
        <EventList lang={lang} />
      </Suspense>
    </section>
  );
}

