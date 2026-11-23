import Image from 'next/image';
import { SITE, COURSE_STREAMS, ALL_COURSES } from '@/lib/constants';
import { PhoneIcon, MapPinIcon, ArrowRightIcon } from '@/components/Icons';

const STATS = [
  { value: String(SITE.since), label: 'Since' },
  { value: String(ALL_COURSES.length), label: 'Courses' },
  { value: String(COURSE_STREAMS.length), label: 'Streams' },
];

// Real course names from constants, shown as floating chips around the logo
const FLOATING = [
  { name: 'WBCS', className: 'left-[-4%] top-[14%] delay-1' },
  { name: 'NEET', className: 'right-[-2%] top-[8%] delay-2' },
  { name: 'WB Police', className: 'right-[-8%] bottom-[22%] delay-3' },
  { name: 'TET', className: 'left-[2%] bottom-[10%] delay-4' },
];

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-navy-900 text-white"
    >
      {/* Background layers */}
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[36rem] w-[36rem] rounded-full bg-gold-400/[0.09] blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-48 -left-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-navy-600/40 blur-[120px]"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:px-8 lg:pb-28 lg:pt-20">
        {/* Copy */}
        <div className="max-w-2xl">
          <p className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
            {SITE.name} · Since {SITE.since}
          </p>

          <h1
            id="hero-heading"
            className="anim-fade-up delay-1 mt-6 font-display text-[2.75rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Reflect Your{' '}
            <span className="text-gradient-gold italic">Strength!</span>
          </h1>

          <p className="anim-fade-up delay-2 mt-6 max-w-xl text-lg leading-relaxed text-white/75 sm:text-xl">
            Focused coaching for{' '}
            <strong className="font-semibold text-white">{SITE.focus}</strong>{' '}
            in Berhampore — with dedicated Medical &amp; Engg., Force and
            Teaching streams.
          </p>

          <div className="anim-fade-up delay-3 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#enquiry"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-7 py-4 text-base font-bold text-navy-950 shadow-[0_12px_32px_-10px_rgb(255_197_1/0.7)] transition hover:-translate-y-0.5 hover:bg-gold-300"
            >
              Enquire for admission
              <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>
            <a
              href={SITE.phoneTel}
              className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-7 py-4 text-base font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10"
              aria-label={`Call ${SITE.phone}`}
            >
              <PhoneIcon className="h-[18px] w-[18px] text-gold-400" aria-hidden="true" />
              <span className="tabular-nums">{SITE.phoneDisplay}</span>
            </a>
          </div>

          <p className="anim-fade-up delay-4 mt-6 flex items-start gap-2 text-sm text-white/60">
            <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-400/80" aria-hidden="true" />
            {SITE.address}
          </p>

          {/* Stats derived from real data */}
          <dl className="anim-fade-up delay-5 mt-12 grid max-w-lg grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-8">
            {STATS.map((s) => (
              <div key={s.label} className="px-4 first:pl-0">
                <dt className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-white/50 sm:text-xs">
                  {s.label}
                </dt>
                <dd className="mt-1.5 font-display text-3xl font-semibold text-white sm:text-4xl">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual */}
        <div className="relative mx-auto w-full max-w-[19rem] sm:max-w-sm lg:max-w-md">
          <div className="anim-fade-scale relative aspect-square">
            {/* Rings */}
            <div className="absolute inset-0 rounded-full border border-white/10" aria-hidden="true" />
            <div
              className="anim-spin-slow absolute inset-[6%] rounded-full border border-dashed border-gold-400/30"
              aria-hidden="true"
            />
            <div
              className="absolute inset-[14%] rounded-full bg-gradient-to-b from-gold-400/25 to-transparent blur-2xl"
              aria-hidden="true"
            />
            {/* Logo medallion */}
            <div className="absolute inset-[14%] overflow-hidden rounded-full shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)] ring-1 ring-white/15">
              <Image
                src="/brand/logo.jpg"
                alt="Mirror Academy logo — gold M above an open book on a navy circle"
                width={640}
                height={640}
                sizes="(min-width: 1024px) 320px, 260px"
                className="h-full w-full scale-[1.06] object-cover"
                priority
                fetchPriority="high"
              />
            </div>

            {/* Floating course chips */}
            {FLOATING.map((chip) => (
              <span
                key={chip.name}
                className={`anim-fade-up absolute ${chip.className}`}
                aria-hidden="true"
              >
                <span className="anim-float block rounded-full border border-white/15 bg-navy-950/70 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md sm:text-sm">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-gold-400 align-middle" />
                  {chip.name}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom curve into the next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
