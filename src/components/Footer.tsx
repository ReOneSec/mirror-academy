import { Suspense } from 'react';
import { connection } from 'next/server';
import Image from 'next/image';
import { SITE, COURSE_STREAMS, NAV_LINKS } from '@/lib/constants';
import { PhoneIcon, MapPinIcon, ArrowRightIcon } from '@/components/Icons';

async function CurrentYear() {
  await connection();
  return <>{new Date().getFullYear()}</>;
}

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-navy-950 text-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent"
        aria-hidden="true"
      />

      {/* CTA band */}
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-10 md:flex-row md:items-center">
          <div>
            <p className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {SITE.tagline}
            </p>
            <p className="mt-2 text-white/60">
              Coaching for {SITE.focus} in Berhampore, since {SITE.since}.
            </p>
          </div>
          <a
            href="#enquiry"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 text-sm font-bold text-navy-950 transition hover:bg-gold-300"
          >
            Enquire now
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="block h-12 w-12 overflow-hidden rounded-full ring-2 ring-gold-400/50">
                <Image
                  src="/brand/logo.jpg"
                  alt=""
                  width={96}
                  height={96}
                  className="h-full w-full scale-[1.06] object-cover"
                  loading="lazy"
                />
              </span>
              <span className="font-display text-2xl font-semibold">{SITE.name}</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                <span>{SITE.address}</span>
              </li>
              <li>
                <a
                  href={SITE.phoneTel}
                  className="inline-flex items-center gap-2.5 text-white/85 transition-colors hover:text-gold-300"
                  aria-label={`Call ${SITE.phone}`}
                >
                  <PhoneIcon className="h-4 w-4 text-gold-400" aria-hidden="true" />
                  <span className="tabular-nums">{SITE.phone}</span>
                </a>
              </li>
            </ul>
            <nav aria-label="Footer navigation" className="mt-6">
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-white/70 transition-colors hover:text-gold-300">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Course streams */}
          {COURSE_STREAMS.map((stream) => (
            <div key={stream.slug} className="lg:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-gold-400">
                {stream.stream}
              </h3>
              <ul className="mt-4 space-y-2">
                {stream.courses.map((course) => (
                  <li key={course.slug} className="text-sm text-white/65">
                    {course.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy;{' '}
            <Suspense fallback={null}>
              <CurrentYear />
            </Suspense>{' '}
            {SITE.name}. All rights reserved.
          </p>
          <p className="text-gold-300/80">{SITE.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
