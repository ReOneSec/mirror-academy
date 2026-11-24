'use client';

import { Suspense, useEffect, useState, type MouseEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { COURSE_STREAMS, ALL_COURSES } from '@/lib/constants';
import { COURSE_EVENT, chooseCourse } from '@/lib/courseSelection';

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
function CoursesFromUrl() {
  const searchParams = useSearchParams();
  return <Courses searchParams={searchParams} />;
}

function Courses({ searchParams }: { searchParams: URLSearchParams | ReturnType<typeof useSearchParams> }) {
  const router = useRouter();
  const marked = useMarkedCourse();
  const activeStream = searchParams.get('stream') ?? 'all';

  const filters = [
    { label: 'All streams', slug: 'all', count: ALL_COURSES.length },
    ...COURSE_STREAMS.map((s) => ({ label: s.stream, slug: s.slug, count: s.courses.length })),
  ];

  const streams =
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
    return `/?${params.toString()}#registration`;
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
      <div className="chips" role="group" aria-label="Show courses by stream">
        {filters.map((f) => (
          <button
            key={f.slug}
            type="button"
            aria-pressed={f.slug === activeStream}
            onClick={() => selectStream(f.slug)}
          >
            {f.label}
            <span>{f.count}</span>
          </button>
        ))}
      </div>

      <div className="cards cards--courses" aria-live="polite">
        {streams.map((stream) => (
          <div key={stream.slug}>
            <div className="card__head">
              <h3 id={`stream-${stream.slug}`}>{stream.stream}</h3>
              <span className="card__count">{stream.courses.length}</span>
            </div>
            <ul aria-labelledby={`stream-${stream.slug}`}>
              {stream.courses.map((course) => (
                <li key={course.slug} className="course">
                  <a
                    href={courseHref(course.slug)}
                    onClick={(e) => onPick(e, course.slug)}
                    data-marked={marked === course.slug}
                    aria-label={`Register for ${course.name}`}
                  >
                    <span translate="no">{course.name}</span>
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

export default function CourseStreams() {
  return (
    <section id="courses" className="section" aria-labelledby="courses-heading">
      <div className="head">
        <p className="head__eyebrow">Courses</p>
        <h2 id="courses-heading">
          {ALL_COURSES.length} courses in {COURSE_STREAMS.length} streams, from public services to
          mock interviews.
        </h2>
        <p className="head__sub">Tap a course to start your registration with it selected.</p>
      </div>
      <Suspense fallback={<Courses searchParams={new URLSearchParams()} />}>
        <CoursesFromUrl />
      </Suspense>
    </section>
  );
}
