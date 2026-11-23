'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { COURSE_STREAMS, ALL_COURSES } from '@/lib/constants';
import {
  ScrollIcon,
  StethoscopeIcon,
  ShieldIcon,
  BookOpenIcon,
  ArrowRightIcon,
} from '@/components/Icons';

type IconType = React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;

const STREAM_ICONS: Record<string, IconType> = {
  'public-services': ScrollIcon,
  'medical-engg': StethoscopeIcon,
  force: ShieldIcon,
  teaching: BookOpenIcon,
};

/** Pre-select a course in the enquiry form, then let the anchor scroll there. */
function prefillCourse(slug: string) {
  const select = document.getElementById('enquiry-course') as HTMLSelectElement | null;
  if (select) {
    select.value = slug;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

function SectionHeading() {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
        Courses
      </p>
      <h2 id="courses-heading" className="mt-3 font-display text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
        Courses we offer
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-slate">
        {ALL_COURSES.length} courses across {COURSE_STREAMS.length} streams. Pick
        a course to start your enquiry.
      </p>
    </div>
  );
}

function CourseStreamsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeStream = searchParams.get('stream') ?? 'all';

  const chips = [
    { label: 'All', slug: 'all', count: ALL_COURSES.length },
    ...COURSE_STREAMS.map((s) => ({ label: s.stream, slug: s.slug, count: s.courses.length })),
  ];

  const filteredStreams =
    activeStream === 'all'
      ? COURSE_STREAMS
      : COURSE_STREAMS.filter((s) => s.slug === activeStream);

  function selectStream(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      params.delete('stream');
    } else {
      params.set('stream', slug);
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '/', { scroll: false });
  }

  return (
    <>
      {/* Filter chips */}
      <div
        className="-mx-4 mt-10 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
        role="group"
        aria-label="Filter courses by stream"
      >
        <div className="inline-flex gap-2 rounded-full border border-line bg-white p-1.5 shadow-sm">
          {chips.map((chip) => {
            const isActive = chip.slug === activeStream;
            return (
              <button
                key={chip.slug}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectStream(chip.slug)}
                className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-navy-900 text-white shadow'
                    : 'text-slate hover:bg-chalk hover:text-navy-900'
                }`}
              >
                {chip.label}
                <span
                  className={`rounded-full px-1.5 py-px text-[0.7rem] tabular-nums ${
                    isActive ? 'bg-gold-400 text-navy-950' : 'bg-chalk text-slate'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stream cards */}
      <div
        className={`mt-8 grid gap-5 ${filteredStreams.length > 1 ? 'md:grid-cols-2' : ''}`}
        aria-live="polite"
      >
        {filteredStreams.map((stream) => {
          const Icon = STREAM_ICONS[stream.slug];
          const index = COURSE_STREAMS.findIndex((s) => s.slug === stream.slug) + 1;
          return (
            <article
              key={stream.slug}
              className="reveal group relative overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-[0_1px_2px_rgb(2_27_68/0.04)] transition duration-300 hover:-translate-y-1 hover:border-gold-400/60 hover:shadow-[0_24px_48px_-24px_rgb(2_27_68/0.25)] sm:p-8"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold-400/0 blur-3xl transition duration-500 group-hover:bg-gold-400/20"
                aria-hidden="true"
              />
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-gold-400 shadow-inner">
                    {Icon && <Icon className="h-6 w-6" aria-hidden="true" />}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-navy-900">
                      {stream.stream}
                    </h3>
                    <p className="text-sm text-slate">
                      {stream.courses.length} courses
                    </p>
                  </div>
                </div>
                <span
                  className="hidden font-display text-4xl font-semibold text-navy-900/10 sm:block"
                  aria-hidden="true"
                >
                  {String(index).padStart(2, '0')}
                </span>
              </div>

              <ul className="mt-6 flex flex-wrap gap-2">
                {stream.courses.map((course) => (
                  <li key={course.slug}>
                    <a
                      href="#enquiry"
                      onClick={() => prefillCourse(course.slug)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3.5 py-2 text-sm font-semibold text-navy-900 transition hover:border-navy-900 hover:bg-navy-900 hover:text-white"
                      aria-label={`Enquire about ${course.name}`}
                    >
                      {course.name}
                    </a>
                  </li>
                ))}
              </ul>

              <a
                href="#enquiry"
                onClick={() => prefillCourse(stream.courses[0].slug)}
                className="mt-7 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900 underline-offset-4 hover:underline"
              >
                Enquire about {stream.stream}
                <ArrowRightIcon className="h-4 w-4 text-gold-600 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </a>
            </article>
          );
        })}
      </div>
    </>
  );
}

export default function CourseStreams() {
  return (
    <section id="courses" aria-labelledby="courses-heading" className="relative bg-paper py-20 sm:py-28">
      <div className="bg-dots pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60 [mask-image:linear-gradient(to_bottom,#000,transparent)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading />
        <Suspense
          fallback={
            <div className="mt-10 grid gap-5 md:grid-cols-2" aria-hidden="true">
              {COURSE_STREAMS.map((s) => (
                <div key={s.slug} className="h-56 animate-pulse rounded-3xl border border-line bg-white" />
              ))}
            </div>
          }
        >
          <CourseStreamsInner />
        </Suspense>
      </div>
    </section>
  );
}
