import { Suspense } from 'react';
import { connection } from 'next/server';
import Image from 'next/image';
import Link from 'next/link';
import { SITE, COURSE_STREAMS, NAV_LINKS } from '@/lib/constants';
import { MailIcon } from '@/components/Icons';

async function CurrentYear() {
  await connection();
  return <>{new Date().getFullYear()}</>;
}

export default function Footer() {
  return (
    <footer className="on-ink bg-ink text-white">
      <div className="mx-auto max-w-6xl px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="block h-12 w-12 shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/brand/logo.jpg"
                  alt="Mirror Academy logo"
                  width={48}
                  height={48}
                  className="h-full w-full scale-[1.08] object-cover"
                  loading="lazy"
                />
              </span>
              <span translate="no" className="w-display text-xl font-bold leading-none">
                {SITE.name}
              </span>
            </div>
            <p className="w-display mt-6 text-2xl font-bold text-gold">{SITE.tagline}</p>
            <p className="mt-3 leading-relaxed text-white/70">{SITE.address}</p>

            <div className="mt-4 flex flex-col gap-2">
              <a
                href={SITE.phoneTel}
                className="inline-block font-semibold tabular-nums underline-offset-4 hover:underline hover:decoration-gold hover:decoration-2"
              >
                <span className="sr-only">Call </span>
                {SITE.phoneDisplay}
              </a>
              <a
                href={SITE.emailMailto}
                className="flex items-center gap-1.5 text-white/80 hover:text-gold text-sm"
                aria-label={`Email ${SITE.email}`}
              >
                <MailIcon className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span>{SITE.email}</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {COURSE_STREAMS.map((stream) => (
              <div key={stream.slug}>
                <h3 className="font-semibold text-gold">{stream.stream}</h3>
                <ul className="mt-3 space-y-1.5">
                  {stream.courses.map((course) => (
                    <li key={course.slug} translate="no" className="text-[0.95rem] text-white/65">
                      {course.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/15 pt-6 text-[0.95rem] text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <p>
              &copy;{' '}
              <Suspense fallback={null}>
                <CurrentYear />
              </Suspense>{' '}
              {SITE.name}. All rights reserved.
            </p>
            <span className="text-white/20">•</span>
            <Link
              href="/admin"
              className="text-xs text-white/50 hover:text-gold transition-colors"
            >
              Admin Portal
            </Link>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-white hover:underline hover:decoration-gold hover:decoration-2 underline-offset-4"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
