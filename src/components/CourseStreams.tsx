'use client';

import { Suspense, useEffect, useState, type MouseEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { COURSE_STREAMS, ALL_COURSES } from '@/lib/constants';
import { COURSE_EVENT, chooseCourse } from '@/lib/courseSelection';
import Icon from '@/components/icons/Icon';
import { STREAM_ICONS } from '@/components/streamIcons';

function SectionHeading() {
  return (
    <div className="max-w-2xl">
      <h2
        id="courses-heading"
        className="w-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl"
      >
        Courses on Offer
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        {ALL_COURSES.length} courses across {COURSE_STREAMS.length} streams. Mark a course to
        start your enquiry with it filled in.
      </p>
    </div>
  );
}

function useMarkedCourse() {
  const [marked, setMarked] = useState<string | null>(null);
  useEffect(() => {
    const onCourse = (e: Event) => setMarked((e as CustomEvent<string>).detail || null);
    window.addEventListener(COURSE_EVENT, onCourse);
    return () => window.removeEventListener(COURSE_EVENT, onCourse);
  }, []);
  return marked;
}

/** Reads the URL, so it suspends during prerender; the fallback renders the same sheet unfiltered. */
function AnswerSheetFromUrl() {
  const searchParams = useSearchParams();
  return <AnswerSheet searchParams={searchParams} />;
}

function AnswerSheet({ searchParams }: { searchParams: URLSearchParams | ReturnType<typeof useSearchParams> }) {
  const router = useRouter();
  const marked = useMarkedCourse();
  const activeStream = searchParams.get('stream') ?? 'all';

  const filters = [
    { label: 'All streams', slug: 'all', count: ALL_COURSES.length },
    ...COURSE_STREAMS.map((s) => ({ label: s.stream, slug: s.slug, count: s.courses.length })),
  ];

  const rows =
    activeStream === 'all'
      ? COURSE_STREAMS
      : COURSE_STREAMS.filter((s) => s.slug === activeStream);

  function selectStream(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') params.delete('stream');
    else params.set('stream', slug);
    const qs = params.toString();
    router.replace(qs ? `/?${qs}#courses` : '/#courses', { scroll: false });
  }

  function courseHref(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('course', slug);
    return `/?${params.toString()}#enquiry`;
  }

  function onMark(e: MouseEvent<HTMLAnchorElement>, slug: string) {
    // Let Cmd/Ctrl/middle click open the deep link in a new tab as usual
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    chooseCourse(slug);
    window.history.replaceState(null, '', courseHref(slug));
    document.getElementById('enquiry')?.scrollIntoView();
  }

  return (
    <>
      <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Show courses by stream">
        {filters.map((f) => {
          const isActive = f.slug === activeStream;
          return (
            <button
              key={f.slug}
              type="button"
              aria-pressed={isActive}
              onClick={() => selectStream(f.slug)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-3.5 text-[0.95rem] font-medium transition-colors ${
                isActive
                  ? 'border-ink bg-ink text-white'
                  : 'border-rule-strong bg-sheet text-ink hover:border-ink'
              }`}
            >
              {f.label}
              <span className={`tabular-nums ${isActive ? 'text-gold' : 'text-muted'}`}>
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* The answer sheet: one ruled surface, a row per stream, a bubble per course */}
      <div className="mt-6 overflow-hidden rounded-lg border border-rule bg-sheet" aria-live="polite">
        {rows.map((stream) => (
          <section
            key={stream.slug}
            aria-labelledby={`stream-${stream.slug}`}
            className="grid gap-4 border-b border-rule px-5 py-6 last:border-b-0 sm:px-7 md:grid-cols-[15rem_1fr] md:gap-8"
          >
            <div className="flex items-center gap-3 md:items-start">
              <Icon name={STREAM_ICONS[stream.slug]} size={28} />
              <div className="min-w-0">
                <h3 id={`stream-${stream.slug}`} className="text-xl font-semibold leading-tight">
                  {stream.stream}
                </h3>
                <p className="mt-0.5 text-[0.95rem] text-muted">
                  {stream.courses.length} courses
                </p>
              </div>
            </div>

            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
              {stream.courses.map((course) => (
                <li key={course.slug}>
                  <a
                    href={courseHref(course.slug)}
                    onClick={(e) => onMark(e, course.slug)}
                    data-marked={marked === course.slug}
                    className="course-option -mx-2 flex min-h-11 items-center gap-3 rounded-md px-2 font-medium transition-colors hover:bg-paper"
                    aria-label={`Enquire about ${course.name}`}
                  >
                    <span className="bubble" aria-hidden="true" />
                    <span translate="no" className="min-w-0 break-words">
                      {course.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

export default function CourseStreams() {
  return (
    <section id="courses" aria-labelledby="courses-heading" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading />
        <Suspense fallback={<AnswerSheet searchParams={new URLSearchParams()} />}>
          <AnswerSheetFromUrl />
        </Suspense>
      </div>
    </section>
  );
}
