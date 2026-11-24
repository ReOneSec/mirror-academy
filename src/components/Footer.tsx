import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';
import { SITE, NAV_LINKS } from '@/lib/constants';

async function CurrentYear() {
  await connection();
  return <>{new Date().getFullYear()}</>;
}

export default function Footer() {
  return (
    <footer className="foot flex-col gap-6 pt-6 pb-10">
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <p>
          <strong>{SITE.name}</strong>, Berhampore · {SITE.tagline}
        </p>
        <nav aria-label="Back to sections">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          <Link href="/admin" className="link text-xs">
            Admin portal
          </Link>
        </nav>
      </div>

      <div className="w-full border-t border-[var(--stroke-secondary)]/50 pt-5 text-center text-xs leading-relaxed text-[var(--text-secondary)]">
        <p>
          Disclaimer: Site Contents designed, developed, maintained and updated by{' '}
          <a
            href="https://epplicon.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#b45309] hover:underline dark:text-amber-400"
          >
            Epplicon Technologies
          </a>
        </p>
        <p className="mt-1">
          Official Site of Mirror Academy &nbsp;|&nbsp; Copyright{' '}
          <Suspense fallback={null}>
            <CurrentYear />
          </Suspense>
          , All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
