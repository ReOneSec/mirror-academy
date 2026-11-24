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
    <footer className="foot">
      <p>
        <strong>{SITE.name}</strong>, Berhampore · {SITE.tagline}
        <br />©{' '}
        <Suspense fallback={null}>
          <CurrentYear />
        </Suspense>{' '}
        {SITE.name}. All rights reserved. ·{' '}
        <Link href="/admin" className="link">
          Admin portal
        </Link>
      </p>
      <nav aria-label="Back to sections">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
