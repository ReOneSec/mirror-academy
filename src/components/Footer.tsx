import { Suspense } from 'react';
import { connection } from 'next/server';
import Image from 'next/image';
import Link from 'next/link';
import { SITE, COURSE_STREAMS } from '@/lib/constants';
import { PhoneIcon, MapPinIcon, MailIcon } from '@/components/Icons';

async function CurrentYear() {
  await connection();
  return <>{new Date().getFullYear()}</>;
}

export default function Footer() {
  return (
    <footer className="bg-navy py-12 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-1">
            <div className="mb-3 flex items-center gap-3">
              <Image
                src="/brand/logo.jpg"
                alt="Mirror Academy logo"
                width={36}
                height={36}
                className="rounded-full"
                loading="lazy"
              />
              <span className="text-lg font-bold">{SITE.name}</span>
            </div>
            <p className="mb-1 text-sm text-gold">{SITE.tagline}</p>
            <p className="text-sm text-white/60">Since {SITE.since}</p>
          </div>

          {/* Course streams */}
          {COURSE_STREAMS.map((stream) => (
            <div key={stream.slug}>
              <h3 className="mb-3 text-sm font-bold text-gold">
                {stream.stream}
              </h3>
              <ul className="space-y-1">
                {stream.courses.map((course) => (
                  <li
                    key={course.slug}
                    className="text-sm text-white/70"
                  >
                    {course.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {SITE.address}
            </span>
            <a
              href={SITE.phoneTel}
              className="flex items-center gap-1.5 text-white/80 hover:text-gold"
              aria-label={`Call ${SITE.phone}`}
            >
              <PhoneIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="tabular-nums">{SITE.phone}</span>
            </a>
            <a
              href={SITE.emailMailto}
              className="flex items-center gap-1.5 text-white/80 hover:text-gold"
              aria-label={`Email ${SITE.email}`}
            >
              <MailIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{SITE.email}</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <p>
              &copy;{' '}
              <Suspense fallback={null}>
                <CurrentYear />
              </Suspense>{' '}
              {SITE.name}
            </p>
            <span className="text-white/20">•</span>
            <Link
              href="/admin"
              className="text-xs text-white/50 hover:text-gold transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
