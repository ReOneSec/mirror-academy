import Link from 'next/link';
import { SITE, COURSE_STREAMS, ALL_COURSES } from '@/lib/constants';
import Icon from '@/components/icons/Icon';
import { STREAM_ICONS } from '@/components/streamIcons';

export default function Hero() {
  return (
    <section id="top" aria-labelledby="hero-heading" className="on-ink bg-ink text-white">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:pt-24">
        {/* The tagline is the one bold move: set wide like the logo's MIRROR, with its reflection */}
        <div className="text-[13vw] sm:text-[clamp(3.25rem,9.2vw,7.25rem)]">
          <h1
            id="hero-heading"
            className="w-display font-extrabold uppercase leading-[0.92] tracking-[-0.01em]"
          >
            Reflect Your Strength!
          </h1>
          <div className="mirror-line mt-[0.14em] h-[3px] w-full bg-gold" aria-hidden="true" />
          <div className="mirror-reflection-wrap mt-[0.06em]" aria-hidden="true">
            <p className="mirror-reflection w-display font-extrabold uppercase leading-[0.92] tracking-[-0.01em]">
              Reflect Your Strength!
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-12 lg:mt-4 lg:grid-cols-[1fr_22rem] lg:gap-20">
          <div>
            <p className="max-w-[34rem] text-lg leading-relaxed text-white/80 sm:text-[1.3125rem]">
              Coaching for{' '}
              <span className="font-semibold text-white">WBPSC, WBCS and related exams</span> in
              Berhampore since {SITE.since}, with separate streams for Medical &amp; Engg., Force,
              Teaching and Mock Interviews.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#registration"
                className="inline-flex items-center justify-center rounded-md bg-gold px-6 py-3.5 text-[1.0625rem] font-bold text-ink transition-colors hover:bg-gold-2"
              >
                Register as a student
              </a>
              <a
                href={SITE.phoneTel}
                className="inline-flex items-center justify-center gap-2.5 rounded-md border border-white/35 px-6 py-3.5 text-[1.0625rem] font-semibold transition-colors hover:border-white/70 hover:bg-ink-2"
              >
                <Icon name="phone" size={20} />
                <span>
                  Call <span className="tabular-nums">{SITE.phoneDisplay}</span>
                </span>
              </a>
            </div>

            <p className="mt-7 flex max-w-md items-start gap-2.5 text-[0.95rem] leading-snug text-white/70">
              <Icon name="map" size={20} className="mt-px" />
              <span>{SITE.address}</span>
            </p>
          </div>

          {/* Stream index: real counts, each row deep-links the course filter */}
          <nav aria-labelledby="hero-streams" className="lg:pt-1">
            <p id="hero-streams" className="text-[0.95rem] text-white/70">
              <span className="font-semibold text-white">{ALL_COURSES.length} courses</span> in{' '}
              {COURSE_STREAMS.length} streams
            </p>
            <ul className="mt-3 border-t border-white/15">
              {COURSE_STREAMS.map((stream) => (
                <li key={stream.slug} className="border-b border-white/15">
                  <Link
                    href={`/?stream=${stream.slug}#courses`}
                    scroll={false}
                    className="group flex items-center gap-3 py-3"
                  >
                    <Icon name={STREAM_ICONS[stream.slug] || 'target'} size={20} />
                    <span className="min-w-0 flex-1 font-medium underline-offset-4 group-hover:underline group-hover:decoration-gold group-hover:decoration-2">
                      {stream.stream}
                    </span>
                    <span className="tabular-nums text-white/60">{stream.courses.length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
