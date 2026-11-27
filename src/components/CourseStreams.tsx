'use client';

import { Suspense, useEffect, useState, type MouseEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { COURSE_STREAMS, ALL_COURSES } from '@/lib/constants';
import { COURSE_EVENT, chooseCourse } from '@/lib/courseSelection';
import { getDict, homePath, num, type Lang } from '@/lib/i18n';

function useMarkedCourse() {
  const [marked, setMarked] = useState<string | null>(null);
  useEffect(() => {
    const onCourse = (e: Event) => setMarked((e as CustomEvent<string>).detail || null);
    window.addEventListener(COURSE_EVENT, onCourse);
    return () => window.removeEventListener(COURSE_EVENT, onCourse);
  }, []);
  return marked;
}

/** Reads the URL, so it suspends during prerender; the fallback renders the same cards unfiltered. */
function CoursesFromUrl({ lang }: { lang: Lang }) {
  const searchParams = useSearchParams();
  return <Courses searchParams={searchParams} lang={lang} />;
}

function Courses({
  searchParams,
  lang,
}: {
  searchParams: URLSearchParams | ReturnType<typeof useSearchParams>;
  lang: Lang;
}) {
  const marked = useMarkedCourse();
  const t = getDict(lang).courses;
  const base = homePath(lang);
  const streamName = (slug: string, fallback: string) => t.streams[slug] ?? fallback;
  const about = (slug: string, fallback?: string) => (lang === 'bn' ? t.about[slug] ?? fallback : fallback);
  // history.replaceState updates useSearchParams on the client (Next 14.1+), so a filter switch
  // re-renders instantly with no server round trip.
  // One stream at a time: the one in the URL, else the stream of a course picked from a link,
  // else the first stream.
  const fromUrl = searchParams.get('stream');
  const picked = searchParams.get('course');
  const activeStream =
    COURSE_STREAMS.find((s) => s.slug === fromUrl)?.slug ??
    COURSE_STREAMS.find((s) => s.courses.some((c) => c.slug === picked))?.slug ??
    COURSE_STREAMS[0].slug;

  const filters = COURSE_STREAMS.map((s) => ({
    label: streamName(s.slug, s.stream),
    slug: s.slug,
    count: s.courses.length,
  }));

  const streams = COURSE_STREAMS.filter((s) => s.slug === activeStream);

  function selectStream(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('stream', slug);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `${base}?${qs}#courses` : `${base}#courses`);
  }

  function courseHref(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('course', slug);
    return `${base}?${params.toString()}#registration`;
  }

  function onPick(e: MouseEvent<HTMLAnchorElement>, slug: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    chooseCourse(slug);
    window.history.replaceState(null, '', courseHref(slug));
    document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="stack">
      <div className="chips chips--streams" role="group" aria-label={t.filterAria}>
        {filters.map((f) => (
          <button
            key={f.slug}
            type="button"
            aria-pressed={f.slug === activeStream}
            onClick={(e) => {
              selectStream(f.slug);
              e.currentTarget.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
            }}
          >
            {f.label}
            <span>{num(lang, f.count)}</span>
          </button>
        ))}
      </div>

      <div className="cards cards--courses cards--one-stream" aria-live="polite">
        {streams.map((stream) => (
          <div key={stream.slug}>
            <div className="card__head">
              <h3 id={`stream-${stream.slug}`}>{streamName(stream.slug, stream.stream)}</h3>
              <span className="card__count">{num(lang, stream.courses.length)}</span>
            </div>
            <ul aria-labelledby={`stream-${stream.slug}`}>
              {stream.courses.map((course) => (
                <li key={course.slug} className="course">
                  <a
                    href={courseHref(course.slug)}
                    onClick={(e) => onPick(e, course.slug)}
                    data-marked={marked === course.slug}
                    aria-label={t.registerFor(course.name)}
                  >
                    <span className="course__text">
                      <span className="course__name" translate="no">{course.name}</span>
                      {about(course.slug, course.about) && (
                        <span className="course__about">{about(course.slug, course.about)}</span>
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CourseStreams({ lang = 'en' }: { lang?: Lang }) {
  const t = getDict(lang).courses;
  return (
    <section id="courses" className="section" aria-labelledby="courses-heading">
      <div className="head">
        <p className="head__eyebrow">{t.eyebrow}</p>
        <h2 id="courses-heading">
          {t.heading(num(lang, ALL_COURSES.length), num(lang, COURSE_STREAMS.length))}
        </h2>
        <p className="head__sub">{t.sub}</p>
      </div>
      <Suspense fallback={<Courses searchParams={new URLSearchParams()} lang={lang} />}>
        <CoursesFromUrl lang={lang} />
      </Suspense>
    </section>
  );
}
