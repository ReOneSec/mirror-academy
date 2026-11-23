'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { COURSE_STREAMS } from '@/lib/constants';
import { ScrollIcon, StethoscopeIcon, ShieldIcon, BookOpenIcon, InterviewIcon } from '@/components/Icons';
import { Suspense } from 'react';

const STREAM_ICONS: Record<string, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>> = {
  'public-services': ScrollIcon,
  'medical-engg': StethoscopeIcon,
  'force': ShieldIcon,
  'teaching': BookOpenIcon,
  'interview': InterviewIcon,
};

function CourseStreamsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeStream = searchParams.get('stream') ?? 'all';

  const chips = [
    { label: 'All', slug: 'all' },
    ...COURSE_STREAMS.map((s) => ({ label: s.stream, slug: s.slug })),
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
    <section id="courses" className="bg-chalk py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="mb-8 text-2xl font-bold text-navy sm:text-3xl">
          Courses we offer
        </h2>

        {/* Filter chips */}
        <div
          className="mb-10 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter courses by stream"
        >
          {chips.map((chip) => {
            const isActive = chip.slug === activeStream;
            return (
              <button
                key={chip.slug}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectStream(chip.slug)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors touch-action-manipulation ${
                  isActive
                    ? 'bg-gold text-navy shadow-sm'
                    : 'bg-white text-ink border border-slate/20 hover:border-gold hover:text-navy'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Course groups */}
        <div className="space-y-10">
          {filteredStreams.map((stream) => {
            const Icon = STREAM_ICONS[stream.slug];
            return (
              <div key={stream.slug}>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-navy">
                  {Icon && <Icon className="h-5 w-5 text-gold" aria-hidden="true" />}
                  {stream.stream}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stream.courses.map((course) => (
                    <span
                      key={course.slug}
                      className="rounded-lg border border-slate/15 bg-white px-4 py-2 text-sm font-medium text-ink shadow-xs"
                    >
                      {course.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function CourseStreams() {
  return (
    <Suspense fallback={
      <section id="courses" className="bg-chalk py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="mb-8 text-2xl font-bold text-navy sm:text-3xl">Courses we offer</h2>
          <p className="text-slate">Loading…</p>
        </div>
      </section>
    }>
      <CourseStreamsInner />
    </Suspense>
  );
}
